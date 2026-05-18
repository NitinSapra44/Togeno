-- =====================================================
-- Fix addresses table to match backend service expectations
-- Migration 007
-- =====================================================

-- The existing addresses table has:
--   phone         (backend expects: phone_number)
--   is_default    (backend expects: is_default_shipping + is_default_billing)
--
-- We add the expected columns and copy existing data across.

-- 1. Add phone_number (copy from phone)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS phone_number TEXT;
UPDATE addresses SET phone_number = phone WHERE phone_number IS NULL;
ALTER TABLE addresses ALTER COLUMN phone_number SET NOT NULL;

-- 2. Add is_default_shipping (copy from is_default)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_default_shipping BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE addresses SET is_default_shipping = is_default WHERE is_default = TRUE;

-- 3. Add is_default_billing (copy from is_default)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_default_billing BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE addresses SET is_default_billing = is_default WHERE is_default = TRUE;

-- 4. Keep old columns for backwards compat (don't drop — safe migration)
-- phone and is_default remain but are no longer used by the backend service
