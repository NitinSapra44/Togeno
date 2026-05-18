-- =====================================================
-- Track which post and expert referred an order
-- Migration 009
-- =====================================================
-- When a consumer orders after reading an expert's post review,
-- the order stores the post_id and expert_id so commission
-- is attributed only to that expert.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_source_post ON orders(source_post_id);
CREATE INDEX IF NOT EXISTS idx_orders_expert ON orders(expert_id);

-- Also add expert_id to commissions so we know who to pay
ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
