-- Add priority field to tasks table
ALTER TABLE tasks ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low'));