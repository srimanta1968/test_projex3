-- Disputes Migration
-- Adds dispute resolution functionality

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID REFERENCES users(id) NOT NULL,
  disputed_user_id UUID REFERENCES users(id),
  dispute_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create dispute_messages table for communication
CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);

-- Add constraints
ALTER TABLE disputes
  DROP CONSTRAINT IF EXISTS disputes_type_check,
  ADD CONSTRAINT disputes_type_check
    CHECK (dispute_type IN ('payment', 'ride', 'service', 'driver', 'passenger', 'other'));

ALTER TABLE disputes
  DROP CONSTRAINT IF EXISTS disputes_status_check,
  ADD CONSTRAINT disputes_status_check
    CHECK (status IN ('open', 'under_review', 'awaiting_response', 'resolved', 'closed', 'escalated'));

COMMENT ON TABLE disputes IS 'Stores user dispute tickets for resolution';
COMMENT ON TABLE dispute_messages IS 'Stores messages/communication for each dispute';
