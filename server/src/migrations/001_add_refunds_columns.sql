-- Migration: Add missing columns to refunds table
-- These columns are required by the refund service

ALTER TABLE refunds
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS reason TEXT;
