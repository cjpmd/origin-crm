-- Enable required extensions for cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule auto-fetch-news to run every 4 hours
SELECT cron.schedule(
  'auto-fetch-news-job',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url:='https://cgqnunehtsnayelvznbj.supabase.co/functions/v1/auto-fetch-news',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncW51bmVodHNuYXllbHZ6bmJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMjQyMSwiZXhwIjoyMDc0Nzk4NDIxfQ.uUcxI0uqgLU8VuWCh29y3yRVF3W81Oe5vhT-jTLu94I"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);