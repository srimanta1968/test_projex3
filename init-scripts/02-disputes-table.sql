-- Migration: Add disputes table
-- For handling charge disputes for uncompleted rides

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_id UUID NOT NULL,
  trip_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE disputes IS 'Schema: Ride Share Schema - Entity: Disputes - Charge disputes for uncompleted rides';

-- Add cancelled status support for refunds (already supports via VARCHAR)
-- No migration needed since status is VARCHAR(255)
