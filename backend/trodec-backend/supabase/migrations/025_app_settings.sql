-- Generic key-value store for server-side system settings.
-- Used to persist the Shiprocket auth token across server restarts.

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only the service role (backend) can read/write this table.
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only" ON app_settings
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
