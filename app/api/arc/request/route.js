// app/api/arc/request/route.js
// POST /api/arc/request - Submit a new ARC™ request
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { request: arcRequest, context } = body;

    if (!arcRequest || typeof arcRequest !== 'string' || !arcRequest.trim()) {
      return Response.json(
        { error: 'Request text is required' },
        { status: 400 }
      );
    }

    // Server-side mocked persistence - no AI keys exposed to client
    // Future: Store in database and queue for AI processing
    // const userId = request.headers.get('x-user-id');
    // const briefId = await createBrief(userId, arcRequest, context);
    // await queueArcProcessing(briefId);

    const mockBriefId = `brief_${Date.now()}`;
    
    return Response.json({
      id: mockBriefId,
      status: 'processing',
      message: 'ARC request queued successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error submitting ARC request:', error);
    return Response.json(
      { error: 'Failed to submit ARC request' },
      { status: 500 }
    );
  }
}
