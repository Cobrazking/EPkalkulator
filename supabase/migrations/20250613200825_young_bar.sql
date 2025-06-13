/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations)
      - `customer_id` (uuid, foreign key to customers)
      - `name` (text, required)
      - `description` (text, optional)
      - `status` (enum: planning, active, on-hold, completed)
      - `start_date` (date, required)
      - `end_date` (date, optional)
      - `budget` (numeric, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for organization-based access
*/

-- Create project status enum
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed');

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status project_status NOT NULL DEFAULT 'planning',
  start_date date NOT NULL,
  end_date date,
  budget numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy for users to access projects in their organization
CREATE POLICY "Users can access organization projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();