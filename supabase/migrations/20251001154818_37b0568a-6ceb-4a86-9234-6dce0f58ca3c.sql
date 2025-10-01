-- Add image/logo URL fields for LinkedIn integration
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE portfolio_companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add daily stock price change tracking
ALTER TABLE market_data ADD COLUMN IF NOT EXISTS change_percent NUMERIC;
ALTER TABLE market_data ADD COLUMN IF NOT EXISTS change_amount NUMERIC;

-- Update portfolio_companies to track last stock update
ALTER TABLE portfolio_companies ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP WITH TIME ZONE;

-- Create activity_types table for standardized icons
CREATE TABLE IF NOT EXISTS activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert standard activity types
INSERT INTO activity_types (name, icon_name, color) VALUES
  ('call', 'Phone', 'blue'),
  ('email', 'Mail', 'green'),
  ('meeting', 'Users', 'purple'),
  ('note', 'FileText', 'gray'),
  ('task', 'CheckSquare', 'orange'),
  ('linkedin', 'Linkedin', 'blue')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on activity_types
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity types viewable by all authenticated users"
  ON activity_types FOR SELECT
  USING (auth.uid() IS NOT NULL);