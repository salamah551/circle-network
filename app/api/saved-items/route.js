import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get authenticated user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { itemType, itemId, notes } = await request.json();

    if (!itemType || !itemId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine which ID column to use
    const idColumn = itemType === 'member' ? 'member_id' :
                     itemType === 'event' ? 'event_id' :
                     itemType === 'request' ? 'request_id' : null;

    if (!idColumn) {
      return Response.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq(idColumn, itemId)
      .single();

    if (existing) {
      return Response.json(
        { message: 'Item already saved', isSaved: true },
        { status: 200 }
      );
    }

    // Save the item
    const saveData = {
      user_id: userId,
      item_type: itemType,
      [idColumn]: itemId,
      notes: notes || null
    };

    const { data, error } = await supabase
      .from('saved_items')
      .insert(saveData)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ 
      success: true, 
      data,
      isSaved: true 
    });
  } catch (error) {
    console.error('Error saving item:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get authenticated user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');

    if (!itemType || !itemId) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Determine which ID column to use
    const idColumn = itemType === 'member' ? 'member_id' :
                     itemType === 'event' ? 'event_id' :
                     itemType === 'request' ? 'request_id' : null;

    if (!idColumn) {
      return Response.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq(idColumn, itemId);

    if (error) throw error;

    return Response.json({ 
      success: true,
      isSaved: false 
    });
  } catch (error) {
    console.error('Error deleting saved item:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Check if an item is saved
export async function GET(request) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Get authenticated user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');

    if (!itemType || !itemId) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const idColumn = itemType === 'member' ? 'member_id' :
                     itemType === 'event' ? 'event_id' :
                     itemType === 'request' ? 'request_id' : null;

    if (!idColumn) {
      return Response.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    const { data } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq(idColumn, itemId)
      .single();

    return Response.json({ isSaved: !!data });
  } catch (error) {
    return Response.json({ isSaved: false });
  }
}
