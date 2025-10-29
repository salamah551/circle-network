/**
 * Features and Capabilities Model
 * Replaces date-gated launch logic with a tier-based capabilities model
 */

export type TierName = 'inner-circle' | 'core';
export type ArcAccess = 'none' | 'limited' | 'full';

export interface Capabilities {
  arcAccess: ArcAccess;
  messaging: boolean;
  events: boolean;
  directory: boolean;
  strategicIntros: number; // per week
  priorityMatching: boolean;
  conciergeSourcing: boolean;
  dealFlowPreview: boolean;
  curatedSalons: boolean;
}

/**
 * Get capabilities for a given membership tier
 * 
 * Tier definitions:
 * - Inner Circle (Founding Member): Exclusive, high-touch for founders/VCs, full ARC™ access
 * - Core (Charter Member): Immediate but limited ARC™ access
 */
export function getTierCapabilities(tier: TierName | string): Capabilities {
  const tierLower = tier.toLowerCase();
  
  // Inner Circle (Founding Member) - Full access
  if (tierLower === 'inner-circle' || tierLower === 'founding') {
    return {
      arcAccess: 'full',
      messaging: true,
      events: true,
      directory: true,
      strategicIntros: 3,
      priorityMatching: true,
      conciergeSourcing: true,
      dealFlowPreview: true,
      curatedSalons: true,
    };
  }
  
  // Core (Charter Member) - Limited ARC access
  if (tierLower === 'core' || tierLower === 'premium') {
    return {
      arcAccess: 'limited',
      messaging: true,
      events: true,
      directory: true,
      strategicIntros: 2,
      priorityMatching: false,
      conciergeSourcing: false,
      dealFlowPreview: false,
      curatedSalons: false,
    };
  }
  
  // Elite tier (if still needed)
  if (tierLower === 'elite') {
    return {
      arcAccess: 'full',
      messaging: true,
      events: true,
      directory: true,
      strategicIntros: 5,
      priorityMatching: true,
      conciergeSourcing: true,
      dealFlowPreview: true,
      curatedSalons: true,
    };
  }
  
  // Default/unknown tier - no access
  return {
    arcAccess: 'none',
    messaging: false,
    events: false,
    directory: false,
    strategicIntros: 0,
    priorityMatching: false,
    conciergeSourcing: false,
    dealFlowPreview: false,
    curatedSalons: false,
  };
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(tier: TierName | string, feature: keyof Capabilities): boolean {
  const capabilities = getTierCapabilities(tier);
  const value = capabilities[feature];
  
  // Handle different value types
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value > 0;
  }
  
  if (typeof value === 'string') {
    return value !== 'none';
  }
  
  return false;
}

/**
 * Get display name for tier
 */
export function getTierDisplayName(tier: TierName | string): string {
  const tierLower = tier.toLowerCase();
  
  const displayNames: Record<string, string> = {
    'inner-circle': 'Inner Circle (Founding Member)',
    'founding': 'Inner Circle (Founding Member)',
    'core': 'Core (Charter Member)',
    'premium': 'Core (Charter Member)',
    'elite': 'Elite Member',
  };
  
  return displayNames[tierLower] || 'Member';
}

/**
 * Get ARC access description
 */
export function getArcAccessDescription(access: ArcAccess): string {
  const descriptions: Record<ArcAccess, string> = {
    'none': 'No ARC™ access',
    'limited': 'Limited ARC™ access',
    'full': 'Full ARC™ access',
  };
  
  return descriptions[access];
}
