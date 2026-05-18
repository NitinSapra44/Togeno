-- Add shiprocket_pickup_location to brand_details
-- Brands configure their named pickup location in the Shiprocket dashboard,
-- then set this field so orders are picked up from their address.
ALTER TABLE brand_details ADD COLUMN IF NOT EXISTS shiprocket_pickup_location TEXT;
