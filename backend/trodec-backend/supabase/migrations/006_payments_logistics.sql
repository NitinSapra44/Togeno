-- =====================================================
-- Payments, Shipments, Commissions
-- Migration 006
-- =====================================================

-- -------------------------
-- 1. Extend orders table
-- -------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS shipment_id UUID;

-- -------------------------
-- 2. Payments table
-- -------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  gateway_id TEXT,                          -- razorpay payment id
  razorpay_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  webhook_event_id TEXT,                    -- for idempotency
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
-- Unique index on webhook_event_id to prevent duplicate processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_webhook_event_id
  ON payments(webhook_event_id) WHERE webhook_event_id IS NOT NULL;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------
-- 3. Shipments table
-- -------------------------
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
  pitch_id UUID REFERENCES pitches(id) ON DELETE RESTRICT, -- for sample shipments
  tracking_id TEXT NOT NULL UNIQUE,
  carrier TEXT NOT NULL DEFAULT 'Shiprocket',
  type TEXT NOT NULL DEFAULT 'FORWARD'
    CHECK (type IN ('FORWARD', 'RETURN', 'SAMPLE')),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'RTO')),
  from_address JSONB NOT NULL,
  to_address JSONB NOT NULL,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_pitch_id ON shipments(pitch_id);

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FK from orders.shipment_id → shipments.id (add after table exists)
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_shipment_id
  FOREIGN KEY (shipment_id) REFERENCES shipments(id)
  ON DELETE SET NULL
  NOT VALID; -- mark NOT VALID to skip locking full table scan

-- -------------------------
-- 4. Commissions table
-- -------------------------
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_amount DECIMAL(10,2) NOT NULL,
  total_commission DECIMAL(10,2) NOT NULL,  -- platform cut %
  expert_payout DECIMAL(10,2) NOT NULL,
  platform_margin DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'reversed')),
  reversed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON commissions(order_id);

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------
-- 5. Service role policies
-- -------------------------
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Service role bypass (backend uses service key)
CREATE POLICY "Service role bypass payments" ON payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass shipments" ON shipments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass commissions" ON commissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can read their own order payments
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Users can read their own order shipments
CREATE POLICY "Users can read own shipments" ON shipments
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );
