-- Phase 1: Enhance sectors table for management
ALTER TABLE sectors 
ADD COLUMN is_active boolean DEFAULT true,
ADD COLUMN display_order integer DEFAULT 0;

-- Add index for active sectors ordering
CREATE INDEX idx_sectors_active_order ON sectors(is_active, display_order, name);

-- Update RLS policies for sectors to allow management
DROP POLICY IF EXISTS "Sectors are viewable by authenticated users" ON sectors;

CREATE POLICY "Authenticated users can view sectors"
ON sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sectors"
ON sectors FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sectors"
ON sectors FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sectors"
ON sectors FOR DELETE
TO authenticated
USING (true);

-- Phase 2: Migrate deals.sector from text to UUID
ALTER TABLE deals 
ADD COLUMN sector_id uuid REFERENCES sectors(id);

-- Create index for sector_id lookups
CREATE INDEX idx_deals_sector_id ON deals(sector_id);

-- Phase 3: Add deal-company tracking fields
ALTER TABLE deals
ADD COLUMN promoted_to_company_id uuid REFERENCES portfolio_companies(id),
ADD COLUMN promoted_at timestamp with time zone;

-- Create index for promoted deals
CREATE INDEX idx_deals_promoted ON deals(promoted_to_company_id) WHERE promoted_to_company_id IS NOT NULL;