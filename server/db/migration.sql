-- Add status column to project_employees table
ALTER TABLE project_employees 
ADD COLUMN IF NOT EXISTS status VARCHAR(10) NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Update any existing records to have 'pending' status
UPDATE project_employees SET status = 'pending' WHERE status IS NULL; 