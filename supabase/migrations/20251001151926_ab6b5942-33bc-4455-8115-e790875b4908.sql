-- Add currency preference to company profiles
ALTER TABLE company_profiles 
ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'USD';

-- Add comment
COMMENT ON COLUMN company_profiles.currency_preference IS 'Preferred currency for displaying monetary values (USD, EUR, GBP, etc.)';

-- Ensure profiles table has avatar_url (it already exists based on schema)
-- Add index for better performance on currency lookups
CREATE INDEX IF NOT EXISTS idx_company_profiles_currency ON company_profiles(currency_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_avatar ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;