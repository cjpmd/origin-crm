-- Add website field to deals table for better news matching
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS website TEXT;