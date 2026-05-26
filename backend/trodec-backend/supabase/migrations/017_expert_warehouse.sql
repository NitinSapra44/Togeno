-- Expert Warehouse System
-- Adds warehouse address support for experts and eligibility flag for pitch gating

-- Add is_warehouse flag to addresses table
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_warehouse BOOLEAN NOT NULL DEFAULT FALSE;

-- Add has_warehouse_address to expert_details for quick pitch eligibility checks
ALTER TABLE expert_details ADD COLUMN IF NOT EXISTS has_warehouse_address BOOLEAN NOT NULL DEFAULT FALSE;

-- Sync existing experts: mark has_warehouse_address = true if they have any warehouse address
UPDATE expert_details
SET has_warehouse_address = TRUE
WHERE id IN (
  SELECT DISTINCT user_id FROM addresses WHERE is_warehouse = TRUE
);

-- Index for quick warehouse eligibility lookup
CREATE INDEX IF NOT EXISTS idx_addresses_warehouse ON addresses(user_id, is_warehouse);
CREATE INDEX IF NOT EXISTS idx_expert_warehouse ON expert_details(has_warehouse_address);
