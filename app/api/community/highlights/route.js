// app/api/community/highlights/route.js
// GET /api/community/highlights - Returns community activity highlights
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Server-side mocked data - structured for easy replacement with real data
    const highlights = [
      {
        id: 1,
        type: 'achievement',
        title: 'Member Milestone',
        description: '5 members closed funding rounds this week',
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        iconKey: 'award'
      },
      {
        id: 2,
        type: 'discussion',
        title: 'Hot Topic',
        description: 'AI ethics debate trending in the feed',
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        iconKey: 'message'
      },
      {
        id: 3,
        type: 'trending',
        title: 'Popular Resource',
        description: 'New market report shared by 15 members',
        time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        iconKey: 'trending'
      },
      {
        id: 4,
        type: 'event',
        title: 'Upcoming Event',
        description: 'Virtual networking session next Tuesday',
        time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        iconKey: 'calendar'
      },
      {
        id: 5,
        type: 'spotlight',
        title: 'Member Spotlight',
        description: 'Featured: Tech leader shares insights on scaling',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        iconKey: 'star'
      }
    ];

    // Future: Personalize based on user's interests and activity
    // const userId = request.headers.get('x-user-id');
    // const personalizedHighlights = await getPersonalizedHighlights(userId);

    return Response.json(highlights);
  } catch (error) {
    console.error('Error fetching community highlights:', error);
    return Response.json(
      { error: 'Failed to fetch community highlights' },
      { status: 500 }
    );
  }
}
