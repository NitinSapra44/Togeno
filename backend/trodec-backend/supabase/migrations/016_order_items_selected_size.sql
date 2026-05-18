-- Migration: add selected_size to order_items
-- Stores the size variant chosen by the consumer at the time of purchase.

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS selected_size TEXT DEFAULT NULL;
