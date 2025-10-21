/**
 * Launch Phase Management
 * 
 * Handles automated tier switching at the 50 founding member threshold.
 * Determines which pricing tiers to show based on current founding member count.
 */

import { createClient } from '@supabase/supabase-js';

export interface LaunchPhase {
  phase: 'founding' | 'standard';
  priceId?: string;
  priceIds?: string[];
  foundingMemberCount: number;
  spotsRemaining: number;
  isFull: boolean;
}

const FOUNDING_MEMBER_THRESHOLD = 50;

/**
 * Get the current launch phase based on founding member count
 * @param supabaseAdmin - Supabase admin client
 * @returns Launch phase information
 */
export async function getCurrentLaunchPhase(supabaseAdmin: any): Promise<LaunchPhase> {
  try {
    // Query: select count(*) from profiles where is_founding_member = true and status = 'active'
    const { count, error } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_founding_member', true);
    
    if (error) {
      console.error('Error counting founding members:', error);
      // Default to standard phase on error
      return {
        phase: 'standard',
        priceIds: [
          process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium',
          process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_elite'
        ],
        foundingMemberCount: 0,
        spotsRemaining: 0,
        isFull: true
      };
    }
    
    const foundingMemberCount = count || 0;
    const spotsRemaining = Math.max(0, FOUNDING_MEMBER_THRESHOLD - foundingMemberCount);
    const isFull = foundingMemberCount >= FOUNDING_MEMBER_THRESHOLD;
    
    if (isFull) {
      // Standard phase - show Premium and Elite
      return {
        phase: 'standard',
        priceIds: [
          process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium',
          process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_elite'
        ],
        foundingMemberCount,
        spotsRemaining,
        isFull
      };
    } else {
      // Founding phase - show only Founding Member price
      return {
        phase: 'founding',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING || 'price_founding_member',
        foundingMemberCount,
        spotsRemaining,
        isFull
      };
    }
  } catch (error) {
    console.error('Error getting launch phase:', error);
    // Default to standard phase on error
    return {
      phase: 'standard',
      priceIds: [
        process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium',
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_elite'
      ],
      foundingMemberCount: 0,
      spotsRemaining: 0,
      isFull: true
    };
  }
}

/**
 * Check if we're still in the founding phase
 * @param supabaseAdmin - Supabase admin client
 * @returns true if in founding phase, false otherwise
 */
export async function isFoundingPhase(supabaseAdmin: any): Promise<boolean> {
  const phase = await getCurrentLaunchPhase(supabaseAdmin);
  return phase.phase === 'founding';
}

/**
 * Get founding member status for display
 * @param supabaseAdmin - Supabase admin client
 * @returns Status object with count and availability
 */
export async function getFoundingMemberStatus(supabaseAdmin: any) {
  const phase = await getCurrentLaunchPhase(supabaseAdmin);
  
  return {
    count: phase.foundingMemberCount,
    spotsAvailable: phase.spotsRemaining,
    maxSpots: FOUNDING_MEMBER_THRESHOLD,
    isFull: phase.isFull
  };
}
