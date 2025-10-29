// app/api/matches/route.js
// GET /api/matches - Returns AI-curated member matches
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Server-side mocked data - structured for easy replacement with real data
    const matches = [
      {
        id: 1,
        member_id: 'member_001',
        full_name: 'Sarah Chen',
        title: 'VP of Engineering',
        company: 'TechCorp',
        industry: 'Technology',
        match_score: 94,
        reason: 'Shared interest in AI/ML infrastructure',
        avatar_url: null
      },
      {
        id: 2,
        member_id: 'member_002',
        full_name: 'Michael Rodriguez',
        title: 'Managing Partner',
        company: 'Venture Capital Fund',
        industry: 'Finance',
        match_score: 89,
        reason: 'Mutual focus on early-stage SaaS investments',
        avatar_url: null
      },
      {
        id: 3,
        member_id: 'member_003',
        full_name: 'Emily Thompson',
        title: 'Chief Strategy Officer',
        company: 'Global Logistics Inc',
        industry: 'Logistics',
        match_score: 87,
        reason: 'Complementary expertise in supply chain optimization',
        avatar_url: null
      },
      {
        id: 4,
        member_id: 'member_004',
        full_name: 'David Park',
        title: 'Founder & CEO',
        company: 'AI Startup Inc',
        industry: 'Technology',
        match_score: 85,
        reason: 'Aligned vision for enterprise AI solutions',
        avatar_url: null
      }
    ];

    // Future: Filter by logged-in user's needs_assessment
    // const { searchParams } = new URL(request.url);
    // const userId = searchParams.get('user_id');
    // const needsAssessment = await getUserNeedsAssessment(userId);
    // const filteredMatches = filterByNeeds(matches, needsAssessment);

    return Response.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return Response.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
