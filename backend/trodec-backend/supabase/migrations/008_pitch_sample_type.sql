-- =====================================================
-- Add sample_type to pitches table
-- Migration 008
-- =====================================================
-- sample_type:
--   KEEP_SAMPLE  → expert keeps the product, no reverse logistics
--   RETURN_SAMPLE → platform creates return shipment after delivery

ALTER TABLE pitches
  ADD COLUMN IF NOT EXISTS sample_type TEXT
    CHECK (sample_type IN ('KEEP_SAMPLE', 'RETURN_SAMPLE'))
    DEFAULT 'KEEP_SAMPLE';
