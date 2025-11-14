-- Add reminded_at column to track when reminder was sent
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMP WITH TIME ZONE;