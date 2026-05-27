-- =====================================================
-- 019 – Invoices
-- =====================================================
-- Brand invoice records generated against fulfilled orders.

CREATE TABLE IF NOT EXISTS invoices (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    TEXT        NOT NULL UNIQUE,  -- e.g. TRD-2026-00001
  brand_id          UUID        NOT NULL REFERENCES brand_details(id) ON DELETE CASCADE,
  order_id          UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status            TEXT        NOT NULL DEFAULT 'generated'
                                CHECK (status IN ('generated', 'sent', 'downloaded')),

  -- Snapshot of brand billing details at invoice time
  brand_name        TEXT,
  gst_number        TEXT,
  pan_number        TEXT,
  registered_address TEXT,
  billing_email     TEXT,
  contact_number    TEXT,

  -- Financials
  subtotal          NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Snapshots (JSONB for flexibility)
  items             JSONB,   -- [{name, qty, size, price, subtotal}]
  shipping_address  JSONB,   -- {name, phone, line1, line2, city, state, postal, country}
  billing_address   JSONB,   -- same shape

  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_brand_id  ON invoices(brand_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id  ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status    ON invoices(status);

-- Auto-increment invoice sequence per calendar year
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand sees own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Brand creates own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brand updates own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = brand_id);

CREATE POLICY "Service role full access to invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');
