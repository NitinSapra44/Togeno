-- Add created_by column to communities table to track which expert created each community
ALTER TABLE communities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill: for communities that already have an expert member, use the earliest one as creator
UPDATE communities c
SET created_by = (
  SELECT cm.user_id
  FROM community_members cm
  WHERE cm.community_id = c.id
    AND cm.is_expert = TRUE
  ORDER BY cm.joined_at ASC
  LIMIT 1
)
WHERE c.created_by IS NULL;
