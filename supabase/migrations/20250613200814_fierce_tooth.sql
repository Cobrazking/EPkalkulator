/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations)
      - `auth_user_id` (uuid, foreign key to auth.users, optional)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `role` (enum: admin, manager, user)
      - `is_active` (boolean, default true)
      - `avatar` (text, optional - base64 or URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for organization-based access
*/

-- Create role enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role user_role NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, email)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read users in their organization
CREATE POLICY "Users can read organization users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Policy for admins and managers to manage users in their organization
CREATE POLICY "Admins and managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();