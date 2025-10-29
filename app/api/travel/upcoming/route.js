// app/api/travel/upcoming/route.js
// GET /api/travel/upcoming - Returns upcoming travel itineraries
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Server-side mocked data - structured for easy replacement with real data
    const trips = [
      {
        id: 1,
        destination: 'San Francisco',
        start_date: '2025-11-15',
        end_date: '2025-11-18',
        airline: 'United Airlines',
        flight_number: 'UA-567',
        upgrade_available: true
      },
      {
        id: 2,
        destination: 'New York City',
        start_date: '2025-12-03',
        end_date: '2025-12-05',
        airline: 'Delta',
        flight_number: 'DL-234',
        upgrade_available: false
      },
      {
        id: 3,
        destination: 'London',
        start_date: '2025-12-15',
        end_date: '2025-12-20',
        airline: 'British Airways',
        flight_number: 'BA-178',
        upgrade_available: true
      }
    ];

    // Future: Filter by logged-in user
    // const userId = request.headers.get('x-user-id');
    // const userTrips = await getUserTrips(userId);

    return Response.json(trips);
  } catch (error) {
    console.error('Error fetching travel:', error);
    return Response.json(
      { error: 'Failed to fetch upcoming travel' },
      { status: 500 }
    );
  }
}
