-- Add logo_url to deals table for company logos
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS logo_url TEXT;