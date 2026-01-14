-- Migration: Create disputes table
-- Required for the dispute service to function

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID,
  user_id UUID,
  payment_id UUID,
  trip_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status VARCHAR(255) DEFAULT 'pending',
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE disputes IS 'Schema: Ride Share Schema - Entity: Disputes';
