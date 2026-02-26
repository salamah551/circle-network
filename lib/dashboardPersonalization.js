/**
 * Dashboard Personalization Utility
 * Determines widget layout and priorities based on needs assessment data
 */

/**
 * Determines widget configuration based on user's needs assessment
 * @param {Object} needsAssessment - User's onboarding quiz responses
 * @param {string} needsAssessment.strategicGoal - Primary strategic goal (e.g., "Raise Series A", "Expand network")
 * @param {string} needsAssessment.dealPreferences - Investment preferences or "Not an active investor"
 * @param {Array<string>} needsAssessment.industries - Selected industries (e.g., ["Technology/SaaS", "Fintech"])
 * @param {Array<string>} needsAssessment.geos - Geographic focus areas (e.g., ["North America", "Europe"])
 * @param {string} needsAssessment.reputationKeywords - Comma-separated keywords for reputation monitoring
 * @param {string} needsAssessment.competitorWatch - Comma-separated competitor names to track
 * @returns {Object} Widget configuration with priorities and sizes
 * @returns {Array<Object>} returns.widgets - Array of widget configurations
 * @returns {string} returns.widgets[].component - Widget component name
 * @returns {string} returns.widgets[].size - Widget size ('small', 'default', 'large', 'hero')
 * @returns {number} returns.widgets[].priority - Display priority (lower = higher priority)
 */
export function getPersonalizedLayout(needsAssessment) {
  if (!needsAssessment) {
    // Default layout if no assessment data
    return {
      widgets: [
        { component: 'ActionCenter', size: 'hero', priority: 1 },
        { component: 'ArcBriefsWidget', size: 'large', priority: 2 },
        { component: 'BriefPointWidget', size: 'large', priority: 3 },
        { component: 'AiMatchesWidget', size: 'large', priority: 4 },
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

  if (hasNetworkingFocus) {
    widgets.push({ component: 'AiMatchesWidget', size: 'large', priority: currentPriority++ });
  }

  if (hasIntelFocus) {
    widgets.push({ component: 'MarketIntelWidget', size: 'large', priority: currentPriority++ });
  }

  // Always include ARC Briefs and BriefPoint (high priority)
  widgets.push({ component: 'ArcBriefsWidget', size: 'large', priority: currentPriority++ });
  widgets.push({ component: 'BriefPointWidget', size: 'large', priority: currentPriority++ });

  // Add remaining widgets
  if (!hasNetworkingFocus) {
    widgets.push({ component: 'AiMatchesWidget', size: 'default', priority: currentPriority++ });
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
  const name = firstName || 'there';
  if (!needsAssessment || !needsAssessment.strategicGoal) {
    return `Welcome back, ${name}`;
  }

  const goal = needsAssessment.strategicGoal.toLowerCase();
  
  if (goal.includes('raise') || goal.includes('funding')) {
    return `Let's help you achieve your funding goals, ${name}`;
  }
  
  if (goal.includes('network') || goal.includes('connection')) {
    return `Ready to expand your network, ${name}?`;
  }
  
  if (goal.includes('market') || goal.includes('expand')) {
    return `Let's drive your market expansion, ${name}`;
  }
  
  return `Welcome back, ${name}`;
}
