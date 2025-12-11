-- Migration: Add email and phone verification fields to users table
-- This adds columns needed for email and phone verification functionality

-- Add email verification fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE;

-- Add phone verification fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP WITH TIME ZONE;

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
ON users(email_verification_token)
WHERE email_verification_token IS NOT NULL;

-- Create index for phone verification code lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_verification_code
ON users(phone_verification_code)
WHERE phone_verification_code IS NOT NULL;
