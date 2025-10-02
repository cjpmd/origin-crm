-- Fix infinite recursion in news_entity_matches RLS policy
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view matches for their entities" ON news_entity_matches;

-- Create a new, simpler non-recursive policy
CREATE POLICY "Users can view matches for their entities" ON news_entity_matches
FOR SELECT USING (
  -- Check if user owns the entity based on entity_type
  (entity_type = 'company' AND EXISTS (
    SELECT 1 FROM portfolio_companies 
    WHERE portfolio_companies.id = news_entity_matches.entity_id 
    AND portfolio_companies.user_id = auth.uid()
  ))
  OR
  (entity_type = 'deal' AND EXISTS (
    SELECT 1 FROM deals 
    WHERE deals.id = news_entity_matches.entity_id 
    AND deals.user_id = auth.uid()
  ))
  OR
  (entity_type = 'investor' AND EXISTS (
    SELECT 1 FROM investors 
    WHERE investors.id = news_entity_matches.entity_id 
    AND investors.user_id = auth.uid()
  ))
  OR
  (entity_type = 'contact' AND EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = news_entity_matches.entity_id 
    AND contacts.user_id = auth.uid()
  ))
  OR
  (entity_type = 'intermediary' AND EXISTS (
    SELECT 1 FROM intermediaries 
    WHERE intermediaries.id = news_entity_matches.entity_id 
    AND intermediaries.user_id = auth.uid()
  ))
  OR
  (entity_type = 'sector' AND EXISTS (
    SELECT 1 FROM sectors 
    WHERE sectors.id = news_entity_matches.entity_id
  ))
);