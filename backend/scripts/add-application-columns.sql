-- Add experience and current_job columns to applications table.
-- Run this in your PostgreSQL client (psql, pgAdmin, etc.) if you prefer SQL over the Node script.

ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS current_job TEXT;
