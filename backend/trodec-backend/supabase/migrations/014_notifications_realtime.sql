-- Enable Supabase Realtime for the notifications table.
-- Clients can subscribe to INSERT events on this table filtered by user_id
-- to receive live push notifications without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
