-- Add INSERT policy for evidence_items
CREATE POLICY "Users can insert evidence from their jobs"
ON evidence_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM research_jobs
    WHERE research_jobs.id = evidence_items.research_job_id
    AND research_jobs.initiated_by = auth.uid()
  )
);

-- Add INSERT policy for research_reports
CREATE POLICY "Users can insert reports from their jobs"
ON research_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM research_jobs
    WHERE research_jobs.id = research_reports.research_job_id
    AND research_jobs.initiated_by = auth.uid()
  )
);