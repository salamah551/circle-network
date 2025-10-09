-- Saved Items Table
-- Allows users to bookmark members, events, and requests for later reference

CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type varchar(20) NOT NULL CHECK (item_type IN ('member', 'event', 'request')),
  member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  request_id uuid REFERENCES requests(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, member_id),
  UNIQUE(user_id, item_type, event_id),
  UNIQUE(user_id, item_type, request_id)
);

-- Indexes for better query performance
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
CREATE INDEX idx_saved_items_type ON saved_items(item_type);
CREATE INDEX idx_saved_items_member ON saved_items(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX idx_saved_items_event ON saved_items(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_saved_items_request ON saved_items(request_id) WHERE request_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved items
CREATE POLICY "Users can view own saved items"
  ON saved_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create their own saved items
CREATE POLICY "Users can create own saved items"
  ON saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved items
CREATE POLICY "Users can delete own saved items"
  ON saved_items FOR DELETE
  USING (auth.uid() = user_id);
