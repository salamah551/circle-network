export function getRecommendations(currentUser, allMembers, limit = 3) {
  if (!currentUser || !allMembers || allMembers.length === 0) {
    return [];
  }

  const userNeeds = currentUser.needs || [];
  const userExpertise = currentUser.expertise || [];

  if (userNeeds.length === 0 && userExpertise.length === 0) {
    return [];
  }

  const scoredMembers = allMembers.map(member => {
    let score = 0;
    const reasons = [];

    const memberExpertise = member.expertise || [];
    const memberNeeds = member.needs || [];

    // Match: User's needs with member's expertise
    userNeeds.forEach(need => {
      const matchingExpertise = memberExpertise.find(exp => 
        exp.toLowerCase().includes(need.toLowerCase()) || 
        need.toLowerCase().includes(exp.toLowerCase())
      );
      
      if (matchingExpertise) {
        score += 10; // High priority: they can help you
        reasons.push(`Has expertise in ${matchingExpertise}`);
      }
    });

    // Match: Member's needs with user's expertise
    memberNeeds.forEach(need => {
      const matchingExpertise = userExpertise.find(exp =>
        exp.toLowerCase().includes(need.toLowerCase()) || 
        need.toLowerCase().includes(exp.toLowerCase())
      );
      
      if (matchingExpertise) {
        score += 8; // Good priority: you can help them
        reasons.push(`Needs help with ${matchingExpertise}`);
      }
    });

    // Boost for founding members
    if (member.is_founding_member) {
      score += 2;
    }

    // Boost for recently active members
    if (member.last_active_at) {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      if (new Date(member.last_active_at) > fiveMinutesAgo) {
        score += 3;
      }
    }

    return {
      member,
      score,
      reason: reasons[0] || 'Similar interests'
    };
  });

  // Filter out zero scores and sort by score
  return scoredMembers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
