-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  plan_name TEXT NOT NULL DEFAULT 'puma-ai-pro',
  seats_purchased INTEGER NOT NULL DEFAULT 1,
  seats_used INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add subscription fields to company_profiles
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'none')),
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions table
-- Company owners can view their subscription
CREATE POLICY "Company owners can view subscription"
ON public.subscriptions
FOR SELECT
USING (
  company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- Company owners can update their subscription
CREATE POLICY "Company owners can update subscription"
ON public.subscriptions
FOR UPDATE
USING (
  company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create updated_at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Initialize subscriptions for existing companies (7-day trial)
INSERT INTO public.subscriptions (company_id, status, seats_purchased, trial_end)
SELECT 
  id, 
  'trialing', 
  5, 
  now() + INTERVAL '7 days'
FROM public.company_profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions WHERE company_id = company_profiles.id
);

-- Update company_profiles with initial subscription status
UPDATE public.company_profiles
SET subscription_status = 'trialing', max_users = 5
WHERE subscription_status IS NULL;