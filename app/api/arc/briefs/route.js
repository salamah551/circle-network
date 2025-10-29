// app/api/arc/briefs/route.js
// GET /api/arc/briefs - Returns ARC™ request briefs and their status
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Server-side mocked data - structured for easy replacement with real data
    const briefs = [
      {
        id: 1,
        title: 'Contract Analysis: Series A Term Sheet',
        status: 'completed',
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      },
      {
        id: 2,
        title: 'Flight Upgrade Options: UA-567',
        status: 'processing',
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Market Research: SaaS Competition',
        status: 'pending',
        updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        priority: 'low'
      },
      {
        id: 4,
        title: 'Strategic Networking Opportunities',
        status: 'completed',
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium'
      }
    ];

    // Future: Filter by logged-in user
    // const userId = request.headers.get('x-user-id');
    // const userBriefs = await getUserBriefs(userId);

    return Response.json(briefs);
  } catch (error) {
    console.error('Error fetching ARC briefs:', error);
    return Response.json(
      { error: 'Failed to fetch ARC briefs' },
      { status: 500 }
    );
  }
}
