/**
 * lib/features.ts
 * Feature capabilities model for Circle Network
 * Replaces date-gated launch logic with a tier-based capabilities system
 */

/**
 * Tier types supported by the platform
 */
export type MembershipTier = 'inner-circle' | 'core' | 'founding' | 'premium' | 'elite';

/**
 * ARC™ access levels
 */
export type ARCAccessLevel = 'none' | 'limited' | 'full';

/**
 * Capabilities available to members based on tier
 */
export interface Capabilities {
  arcAccess: ARCAccessLevel;
  messaging: boolean;
  events: boolean;
  directory: boolean;
  strategicIntros: boolean;
  valueExchange: boolean;
  dealFlow: boolean;
  expertSessions: boolean;
  priorityMatching: boolean;
  conciergeService: boolean;
}

/**
 * Get capabilities for a specific membership tier
 */
export function getTierCapabilities(tier: MembershipTier | string): Capabilities {
  const normalizedTier = normalizeTier(tier);
  
  switch (normalizedTier) {
    case 'inner-circle':
    case 'founding':
      // Inner Circle (Founding Member) - Full access to everything
      return {
        arcAccess: 'full',
        messaging: true,
        events: true,
        directory: true,
        strategicIntros: true,
        valueExchange: true,
        dealFlow: true,
        expertSessions: true,
        priorityMatching: true,
        conciergeService: true,
      };
      
    case 'core':
    case 'premium':
      // Core (Charter Member) - Immediate but limited ARC™ access
      return {
        arcAccess: 'limited',
        messaging: true,
        events: true,
        directory: true,
        strategicIntros: true,
        valueExchange: true,
        dealFlow: false,
        expertSessions: true,
        priorityMatching: false,
        conciergeService: false,
      };
      
    case 'elite':
      // Elite tier - Enhanced access
      return {
        arcAccess: 'full',
        messaging: true,
        events: true,
        directory: true,
        strategicIntros: true,
        valueExchange: true,
        dealFlow: true,
        expertSessions: true,
        priorityMatching: true,
        conciergeService: true,
      };
      
    default:
      // Free/trial tier - Minimal access
      return {
        arcAccess: 'none',
        messaging: false,
        events: false,
        directory: true,
        strategicIntros: false,
        valueExchange: false,
        dealFlow: false,
        expertSessions: false,
        priorityMatching: false,
        conciergeService: false,
      };
  }
}

/**
 * Normalize tier names to canonical form
 */
export function normalizeTier(tier: string): MembershipTier {
  const tierLower = tier.toLowerCase();
  
  // Map legacy names
  if (tierLower === 'founding') {
    return 'inner-circle';
  }
  if (tierLower === 'premium') {
    return 'core';
  }
  
  // Return as-is if recognized, otherwise default to core
  if (tierLower === 'inner-circle' || tierLower === 'core' || tierLower === 'elite') {
    return tierLower as MembershipTier;
  }
  
  return 'core';
}

/**
 * Get display name for tier
 */
export function getTierDisplayName(tier: MembershipTier | string): string {
  const normalizedTier = normalizeTier(tier);
  
  switch (normalizedTier) {
    case 'inner-circle':
      return 'Inner Circle (Founding Member)';
    case 'core':
      return 'Core (Charter Member)';
    case 'elite':
      return 'Elite Member';
    default:
      return 'Member';
  }
}

/**
 * Get tier description for marketing/UI
 */
export function getTierDescription(tier: MembershipTier | string): string {
  const normalizedTier = normalizeTier(tier);
  
  switch (normalizedTier) {
    case 'inner-circle':
      return 'Exclusive, high-touch for founders/VCs with full ARC™ access';
    case 'core':
      return 'Immediate but limited ARC™ access for charter members';
    case 'elite':
      return 'Enhanced access with premium features and priority support';
    default:
      return 'Basic access to The Circle Network';
  }
}

/**
 * Check if a feature is available for a specific tier
 */
export function hasFeatureAccess(
  tier: MembershipTier | string,
  feature: keyof Capabilities
): boolean {
  const capabilities = getTierCapabilities(tier);
  return Boolean(capabilities[feature]);
}

/**
 * Get ARC™ access level for a tier
 */
export function getARCAccess(tier: MembershipTier | string): ARCAccessLevel {
  const capabilities = getTierCapabilities(tier);
  return capabilities.arcAccess;
}

/**
 * Check if tier is a founding/inner-circle member
 */
export function isFoundingMember(tier: MembershipTier | string): boolean {
  const normalizedTier = normalizeTier(tier);
  return normalizedTier === 'inner-circle' || normalizedTier === 'founding';
}

/**
 * Get badge label for ARC™ access level
 */
export function getARCBadgeLabel(accessLevel: ARCAccessLevel): string {
  switch (accessLevel) {
    case 'full':
      return 'Full ARC™ Access';
    case 'limited':
      return 'Limited ARC™ Access';
    case 'none':
      return 'No ARC™ Access';
    default:
      return 'ARC™';
  }
}

/**
 * Get all available tiers for selection
 */
export function getAvailableTiers(): Array<{
  id: MembershipTier;
  name: string;
  description: string;
  arcAccess: ARCAccessLevel;
}> {
  return [
    {
      id: 'inner-circle',
      name: getTierDisplayName('inner-circle'),
      description: getTierDescription('inner-circle'),
      arcAccess: 'full',
    },
    {
      id: 'core',
      name: getTierDisplayName('core'),
      description: getTierDescription('core'),
      arcAccess: 'limited',
    },
  ];
}
