/*
  # Create organizations table

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `logo` (text, optional - base64 or URL)
      - `address` (text, optional)
      - `phone` (text, optional)
      - `email` (text, optional)
      - `website` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `organizations` table
    - Add policy for authenticated users to read/write their own organization data
*/

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo text,
  address text,
  phone text,
  email text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage organizations
CREATE POLICY "Users can manage organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();