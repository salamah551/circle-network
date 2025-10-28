/**
 * Dashboard Personalization Utility
 * Determines widget layout and priorities based on needs assessment data
 */

/**
 * Determines widget configuration based on user's needs assessment
 * @param {Object} needsAssessment - User's onboarding quiz responses
 * @returns {Object} Widget configuration with priorities and sizes
 */
export function getPersonalizedLayout(needsAssessment) {
  if (!needsAssessment) {
    // Default layout if no assessment data
    return {
      widgets: [
        { component: 'ActionCenter', size: 'hero', priority: 1 },
        { component: 'ArcBriefsWidget', size: 'large', priority: 2 },
        { component: 'AiMatchesWidget', size: 'large', priority: 3 },
        { component: 'UpcomingTravelWidget', size: 'default', priority: 4 },
        { component: 'MarketIntelWidget', size: 'default', priority: 5 },
        { component: 'CommunityHighlightsWidget', size: 'default', priority: 6 }
      ]
    };
  }

  const widgets = [];
  const {
    strategicGoal = '',
    dealPreferences = '',
    industries = [],
    geos = [],
    reputationKeywords = '',
    competitorWatch = ''
  } = needsAssessment;

  // Always include Action Center as hero
  widgets.push({ component: 'ActionCenter', size: 'hero', priority: 1 });

  // Analyze strategic goal for keywords
  const goal = strategicGoal.toLowerCase();
  
  // Travel optimization priority
  const travelKeywords = ['travel', 'flight', 'upgrade', 'hotel', 'trip', 'airline'];
  const hasTravelFocus = travelKeywords.some(kw => goal.includes(kw));
  
  // Networking priority
  const networkingKeywords = ['network', 'connection', 'partner', 'relationship', 'meet', 'intro'];
  const hasNetworkingFocus = networkingKeywords.some(kw => goal.includes(kw));
  
  // Investment/Deal priority
  const dealKeywords = ['invest', 'deal', 'funding', 'raise', 'series', 'capital'];
  const hasDealFocus = dealKeywords.some(kw => goal.includes(kw)) || 
                       (dealPreferences && dealPreferences.toLowerCase() !== 'not an active investor');
  
  // Intelligence priority
  const intelKeywords = ['competitive', 'intelligence', 'market', 'research', 'analysis', 'competitor'];
  const hasIntelFocus = intelKeywords.some(kw => goal.includes(kw)) || competitorWatch;

  // Assign priorities based on focus areas
  let currentPriority = 2;

  if (hasTravelFocus) {
    widgets.push({ component: 'UpcomingTravelWidget', size: 'large', priority: currentPriority++ });
  }

  if (hasNetworkingFocus) {
    widgets.push({ component: 'AiMatchesWidget', size: 'large', priority: currentPriority++ });
  }

  if (hasIntelFocus) {
    widgets.push({ component: 'MarketIntelWidget', size: 'large', priority: currentPriority++ });
  }

  // Always include ARC Briefs (high priority)
  widgets.push({ component: 'ArcBriefsWidget', size: 'large', priority: currentPriority++ });

  // Add remaining widgets
  if (!hasNetworkingFocus) {
    widgets.push({ component: 'AiMatchesWidget', size: 'default', priority: currentPriority++ });
  }

  if (!hasTravelFocus) {
    widgets.push({ component: 'UpcomingTravelWidget', size: 'default', priority: currentPriority++ });
  }

  if (!hasIntelFocus) {
    widgets.push({ component: 'MarketIntelWidget', size: 'default', priority: currentPriority++ });
  }

  // Always include community highlights at the end
  widgets.push({ component: 'CommunityHighlightsWidget', size: 'default', priority: currentPriority++ });

  // Sort by priority
  widgets.sort((a, b) => a.priority - b.priority);

  return { widgets };
}

/**
 * Gets a personalized welcome message based on needs assessment
 * @param {Object} needsAssessment - User's onboarding quiz responses
 * @param {String} firstName - User's first name
 * @returns {String} Personalized welcome message
 */
export function getPersonalizedWelcome(needsAssessment, firstName) {
  if (!needsAssessment || !needsAssessment.strategicGoal) {
    return `Welcome back, ${firstName}`;
  }

  const goal = needsAssessment.strategicGoal.toLowerCase();
  
  if (goal.includes('raise') || goal.includes('funding')) {
    return `Let's help you achieve your funding goals, ${firstName}`;
  }
  
  if (goal.includes('network') || goal.includes('connection')) {
    return `Ready to expand your network, ${firstName}?`;
  }
  
  if (goal.includes('market') || goal.includes('expand')) {
    return `Let's drive your market expansion, ${firstName}`;
  }
  
  return `Welcome back, ${firstName}`;
}
