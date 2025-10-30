// app/api/dashboard/stats/route.js
// GET /api/dashboard/stats - Returns dashboard statistics
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return zeros until real data integration is complete
    // Future: Query actual stats from database
    const stats = {
      connections: 0,
      messages: 0,
      introsPending: 0,
      introsAccepted: 0
    };

    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
