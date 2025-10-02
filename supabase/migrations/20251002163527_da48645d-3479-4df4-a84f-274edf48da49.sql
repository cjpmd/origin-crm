-- Add sub_stage column to deals table
ALTER TABLE deals ADD COLUMN sub_stage TEXT;

COMMENT ON COLUMN deals.sub_stage IS 'Sub-stage within the main stage: Qualified, Meeting, Proposal, Negotiation, Closing';