-- =====================================================
-- Add selected_size support to cart_items
-- Migration 015
-- =====================================================
-- The cart_items table originally had UNIQUE(user_id, product_id).
-- Products now support size variants, so we need:
--   1. A selected_size TEXT column (nullable = no size required)
--   2. A UNIQUE constraint on (user_id, product_id, selected_size)
--      that treats NULL as a single value (one row per user+product
--      when no size is chosen; one row per user+product+size when a
--      size IS chosen).
-- Using a functional unique index with COALESCE treats NULL as '' so
-- two "no-size" rows for the same user+product are rejected.

-- 1. Add column (idempotent)
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS selected_size TEXT DEFAULT NULL;

-- 2. Drop the old simple unique constraint if it still exists
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- 3. Drop any previous version of this index so we can recreate cleanly
DROP INDEX IF EXISTS cart_items_user_product_size_idx;

-- 4. Create functional unique index:
--    COALESCE(selected_size, '') turns NULL → '' so two NULL-size rows
--    for the same user+product ARE considered duplicates.
CREATE UNIQUE INDEX cart_items_user_product_size_idx
  ON cart_items (user_id, product_id, COALESCE(selected_size, ''));
