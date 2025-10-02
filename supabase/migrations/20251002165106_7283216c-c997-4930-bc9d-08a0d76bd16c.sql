-- Add sector_id column to intermediaries table
ALTER TABLE intermediaries 
ADD COLUMN sector_id UUID REFERENCES sectors(id);

-- Create index for better query performance
CREATE INDEX idx_intermediaries_sector_id ON intermediaries(sector_id);