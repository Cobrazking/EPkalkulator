/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations)
      - `name` (text, required)
      - `email` (text, optional)
      - `phone` (text, optional)
      - `address` (text, optional)
      - `company` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customers` table
    - Add policies for organization-based access
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for users to access customers in their organization
CREATE POLICY "Users can access organization customers"
  ON customers
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
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();