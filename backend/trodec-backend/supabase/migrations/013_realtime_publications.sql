-- Enable Supabase Realtime for pitches and shipments tables.
-- Clients subscribe to row-level changes for live UI updates:
--   - Brands see pitch status change when expert accepts/declines
--   - Experts see sample shipment appear after brand accepts their pitch
ALTER PUBLICATION supabase_realtime ADD TABLE pitches;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
