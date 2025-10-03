-- Function to sync intermediary sector to coverage table
CREATE OR REPLACE FUNCTION sync_intermediary_coverage()
RETURNS TRIGGER AS $$
BEGIN
  -- If sector_id is set, upsert into intermediary_coverage
  IF NEW.sector_id IS NOT NULL THEN
    INSERT INTO intermediary_coverage (
      user_id, 
      intermediary_id, 
      sector_id,
      coverage_strength
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      NEW.sector_id,
      50
    )
    ON CONFLICT (intermediary_id, sector_id) 
    DO UPDATE SET
      sector_id = NEW.sector_id,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_intermediary_coverage_trigger ON intermediaries;

-- Trigger on insert or update
CREATE TRIGGER sync_intermediary_coverage_trigger
AFTER INSERT OR UPDATE OF sector_id ON intermediaries
FOR EACH ROW
EXECUTE FUNCTION sync_intermediary_coverage();