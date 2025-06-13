/*
  # Create calculators table

  1. New Tables
    - `calculators`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations)
      - `project_id` (uuid, foreign key to projects)
      - `name` (text, required)
      - `description` (text, optional)
      - `entries` (jsonb, calculation entries)
      - `summary` (jsonb, calculation summary)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `calculators` table
    - Add policies for organization-based access
*/

CREATE TABLE IF NOT EXISTS calculators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  entries jsonb DEFAULT '[]'::jsonb,
  summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;

-- Policy for users to access calculators in their organization
CREATE POLICY "Users can access organization calculators"
  ON calculators
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
CREATE TRIGGER update_calculators_updated_at
  BEFORE UPDATE ON calculators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();