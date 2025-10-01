-- Add relationship_strength to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship_strength INTEGER DEFAULT 50 CHECK (relationship_strength >= 0 AND relationship_strength <= 100);

-- Create investor_contacts junction table for managing multiple contacts per investor
CREATE TABLE IF NOT EXISTS investor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(investor_id, contact_id)
);

-- Enable RLS on investor_contacts
ALTER TABLE investor_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for investor_contacts
CREATE POLICY "Users can view their investor contacts"
  ON investor_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_contacts.investor_id
      AND investors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their investor contacts"
  ON investor_contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_contacts.investor_id
      AND investors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their investor contacts"
  ON investor_contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_contacts.investor_id
      AND investors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their investor contacts"
  ON investor_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_contacts.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Create funds table
CREATE TABLE IF NOT EXISTS funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fund_size NUMERIC,
  vintage_year INTEGER,
  strategy TEXT,
  status TEXT DEFAULT 'Active',
  close_date DATE,
  final_close_date DATE,
  target_irr NUMERIC,
  target_moic NUMERIC,
  management_fee_rate NUMERIC,
  carried_interest_rate NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on funds
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;

-- RLS policies for funds
CREATE POLICY "Users can view their own funds"
  ON funds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funds"
  ON funds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funds"
  ON funds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funds"
  ON funds FOR DELETE
  USING (auth.uid() = user_id);

-- Create fund_commitments table
CREATE TABLE IF NOT EXISTS fund_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  commitment_amount NUMERIC NOT NULL,
  committed_date DATE,
  called_amount NUMERIC DEFAULT 0,
  distributed_amount NUMERIC DEFAULT 0,
  remaining_commitment NUMERIC GENERATED ALWAYS AS (commitment_amount - called_amount) STORED,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on fund_commitments
ALTER TABLE fund_commitments ENABLE ROW LEVEL SECURITY;

-- RLS policies for fund_commitments
CREATE POLICY "Users can view commitments for their funds"
  ON fund_commitments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = fund_commitments.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert commitments for their funds"
  ON fund_commitments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = fund_commitments.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update commitments for their funds"
  ON fund_commitments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = fund_commitments.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete commitments for their funds"
  ON fund_commitments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = fund_commitments.fund_id
      AND funds.user_id = auth.uid()
    )
  );

-- Create capital_calls table
CREATE TABLE IF NOT EXISTS capital_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  commitment_id UUID NOT NULL REFERENCES fund_commitments(id) ON DELETE CASCADE,
  call_number INTEGER NOT NULL,
  call_amount NUMERIC NOT NULL,
  call_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on capital_calls
ALTER TABLE capital_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for capital_calls
CREATE POLICY "Users can view capital calls for their funds"
  ON capital_calls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = capital_calls.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert capital calls for their funds"
  ON capital_calls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = capital_calls.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update capital calls for their funds"
  ON capital_calls FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = capital_calls.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete capital calls for their funds"
  ON capital_calls FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = capital_calls.fund_id
      AND funds.user_id = auth.uid()
    )
  );

-- Create distributions table
CREATE TABLE IF NOT EXISTS distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  commitment_id UUID NOT NULL REFERENCES fund_commitments(id) ON DELETE CASCADE,
  distribution_number INTEGER NOT NULL,
  distribution_amount NUMERIC NOT NULL,
  distribution_date DATE NOT NULL,
  distribution_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on distributions
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;

-- RLS policies for distributions
CREATE POLICY "Users can view distributions for their funds"
  ON distributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = distributions.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert distributions for their funds"
  ON distributions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = distributions.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update distributions for their funds"
  ON distributions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = distributions.fund_id
      AND funds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete distributions for their funds"
  ON distributions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM funds
      WHERE funds.id = distributions.fund_id
      AND funds.user_id = auth.uid()
    )
  );

-- Create trigger for funds updated_at
CREATE TRIGGER update_funds_updated_at
  BEFORE UPDATE ON funds
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create trigger for fund_commitments updated_at
CREATE TRIGGER update_fund_commitments_updated_at
  BEFORE UPDATE ON fund_commitments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create trigger for capital_calls updated_at
CREATE TRIGGER update_capital_calls_updated_at
  BEFORE UPDATE ON capital_calls
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create trigger for distributions updated_at
CREATE TRIGGER update_distributions_updated_at
  BEFORE UPDATE ON distributions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();