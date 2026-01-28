-- Add created_by columns to projects and calculators
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dpqrzlxsfurcjrkuhcjo/sql

-- Add created_by to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE projects ADD COLUMN created_by uuid REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to projects table';
  ELSE
    RAISE NOTICE 'created_by column already exists in projects table';
  END IF;
END $$;

-- Add created_by to calculators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calculators' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE calculators ADD COLUMN created_by uuid REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to calculators table';
  ELSE
    RAISE NOTICE 'created_by column already exists in calculators table';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_calculators_created_by ON calculators(created_by);
