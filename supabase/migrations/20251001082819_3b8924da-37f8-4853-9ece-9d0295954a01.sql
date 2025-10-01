-- Add assigned_to field to tasks table
ALTER TABLE tasks ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for assigned_to lookups
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);