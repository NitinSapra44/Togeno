-- Migration 011: Add Shiprocket columns to shipments table
-- =========================================================

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS awb_code TEXT;

CREATE INDEX IF NOT EXISTS idx_shipments_shiprocket_order_id ON shipments(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb_code ON shipments(awb_code);
