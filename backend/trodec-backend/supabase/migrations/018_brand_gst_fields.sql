-- =====================================================
-- 018 – Brand GST / billing fields
-- =====================================================
-- Adds GST and billing information fields to brand_details
-- so brands can generate compliant invoices.

ALTER TABLE brand_details
  ADD COLUMN IF NOT EXISTS gst_number          TEXT,
  ADD COLUMN IF NOT EXISTS business_name       TEXT,
  ADD COLUMN IF NOT EXISTS registered_address  TEXT,
  ADD COLUMN IF NOT EXISTS billing_state       TEXT,
  ADD COLUMN IF NOT EXISTS billing_pincode     TEXT,
  ADD COLUMN IF NOT EXISTS billing_email       TEXT,
  ADD COLUMN IF NOT EXISTS contact_number      TEXT,
  ADD COLUMN IF NOT EXISTS pan_number          TEXT;
