/**
 * Phase Guard - Automated Campaign Phase Management
 * 
 * Determines current phase based on tier conversion totals and automatically
 * switches campaigns when thresholds are reached (Founding → Premium → Elite).
 * 
 * All operations are idempotent and safe to call repeatedly.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get the Founding cap from environment or default
 * @returns {number} Founding member cap
 */
export function getFoundingCap() {
  const envCap = process.env.FOUNDING_CAP || process.env.NEXT_PUBLIC_FOUNDERS_CAP;
  return parseInt(envCap, 10) || 100;
}

/**
 * Get tier conversion totals from database
 * @param {any} supabaseAdmin - Supabase admin client
 * @returns {Promise<Object>} Tier totals keyed by tier name
 */
async function getTierTotals(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('membership_tier_totals')
    .select('tier, total');

  if (error) {
    console.error('Error fetching tier totals:', error);
    return { founding: 0, premium: 0, elite: 0 };
  }

  const totals = {};
  data.forEach(row => {
    totals[row.tier] = row.total || 0;
  });

  return {
    founding: totals.founding || 0,
    premium: totals.premium || 0,
    elite: totals.elite || 0,
  };
}

/**
 * Determine current phase based on founding total vs cap
 * @param {number} foundingTotal - Current founding member count
 * @param {number} foundingCap - Founding member cap
 * @returns {string} Current phase: 'founding', 'premium', or 'elite'
 */
function determinePhase(foundingTotal, foundingCap) {
  // For now, we support founding → premium transition
  // Elite phase can be added later based on premium cap
  if (foundingTotal >= foundingCap) {
    return 'premium';
  }
  return 'founding';
}

/**
 * Apply phase transition by pausing/activating campaigns
 * @param {any} supabaseAdmin - Supabase admin client
 * @param {string} currentPhase - Current phase ('founding' or 'premium')
 * @returns {Promise<Object>} Actions taken
 */
async function applyPhaseTransition(supabaseAdmin, currentPhase) {
  const actions = {
    pausedCampaigns: [],
    activatedCampaigns: [],
  };

  if (currentPhase === 'premium') {
    // Pause all active Founding campaigns
    const { data: foundingCampaigns, error: pauseError } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .update({ 
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('target_phase', 'founding')
      .eq('status', 'active')
      .select('id, name');

    if (pauseError) {
      console.error('Error pausing founding campaigns:', pauseError);
    } else if (foundingCampaigns && foundingCampaigns.length > 0) {
      actions.pausedCampaigns = foundingCampaigns.map(c => ({ id: c.id, name: c.name }));
      console.log(`✅ Paused ${foundingCampaigns.length} founding campaigns`);
    }

    // Activate primary Premium campaign if exists and not already active
    const { data: premiumCampaigns, error: activateError } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .update({ 
        status: 'active',
        activated_at: new Date().toISOString()
      })
      .eq('target_phase', 'premium')
      .eq('is_primary', true)
      .neq('status', 'active')
      .select('id, name');

    if (activateError) {
      console.error('Error activating premium campaigns:', activateError);
    } else if (premiumCampaigns && premiumCampaigns.length > 0) {
      actions.activatedCampaigns = premiumCampaigns.map(c => ({ id: c.id, name: c.name }));
      console.log(`✅ Activated ${premiumCampaigns.length} premium campaigns`);
    }
  }

  return actions;
}

/**
 * Main phase guard function - checks current phase and applies transitions
 * Idempotent: safe to call multiple times
 * 
 * @param {any} supabaseAdmin - Supabase admin client (optional, will create if not provided)
 * @returns {Promise<Object>} Phase status and actions taken
 */
export async function runPhaseGuard(supabaseAdmin = null) {
  // Create admin client if not provided
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  try {
    // Get tier totals
    const tierTotals = await getTierTotals(supabaseAdmin);
    const foundingCap = getFoundingCap();
    const foundingTotal = tierTotals.founding;
    const spotsRemaining = Math.max(0, foundingCap - foundingTotal);

    // Determine current phase
    const currentPhase = determinePhase(foundingTotal, foundingCap);

    console.log(`📊 Phase Guard: phase=${currentPhase}, founding=${foundingTotal}/${foundingCap}`);

    // Apply phase transition if needed (idempotent)
    const actions = await applyPhaseTransition(supabaseAdmin, currentPhase);

    return {
      phase: currentPhase,
      founders: {
        total: foundingTotal,
        cap: foundingCap,
        remaining: spotsRemaining,
      },
      tierTotals,
      actions: {
        pausedCampaignIds: actions.pausedCampaigns.map(c => c.id),
        pausedCampaigns: actions.pausedCampaigns,
        activatedCampaignIds: actions.activatedCampaigns.map(c => c.id),
        activatedCampaigns: actions.activatedCampaigns,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Phase guard error:', error);
    throw error;
  }
}

/**
 * Get current phase without applying transitions (read-only)
 * Useful for checking phase before sending invites
 * 
 * @param {any} supabaseAdmin - Supabase admin client (optional)
 * @returns {Promise<string>} Current phase
 */
export async function getCurrentPhase(supabaseAdmin = null) {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  const tierTotals = await getTierTotals(supabaseAdmin);
  const foundingCap = getFoundingCap();
  return determinePhase(tierTotals.founding, foundingCap);
}

/**
 * Increment tier total for a conversion (called by webhook)
 * Idempotent: uses upsert to handle duplicate calls
 * 
 * @param {any} supabaseAdmin - Supabase admin client
 * @param {string} tier - Tier name ('founding', 'premium', 'elite')
 * @returns {Promise<void>}
 */
export async function incrementTierTotal(supabaseAdmin, tier) {
  const { error } = await supabaseAdmin.rpc('increment_tier_total', { p_tier: tier });
  
  if (error) {
    console.error(`Error incrementing tier total for ${tier}:`, error);
    throw error;
  }
  
  console.log(`✅ Incremented ${tier} tier total`);
}
