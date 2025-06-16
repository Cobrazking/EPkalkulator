/*
  # Fix organization creation with proper function parameters

  1. Functions
    - `get_current_user_organization_id()` - Helper function to get current user's organization ID
    - `create_organization_with_user()` - Function to create organization and user record in one transaction

  2. Security
    - Enable RLS on organizations and users tables
    - Add policies for authenticated users to create organizations and user records
    - Grant execute permissions on functions

  3. Changes
    - Fixed function parameter ordering to avoid default value conflicts
    - Proper RLS policies for organization and user creation
*/

-- Create helper function to get current user's organization ID
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Create the missing RPC function to create organization with user
-- Fixed parameter ordering: required parameters first, then optional ones with defaults
CREATE OR REPLACE FUNCTION create_organization_with_user(
  org_name text,
  user_name text,
  user_email text,
  org_description text DEFAULT NULL,
  org_logo text DEFAULT NULL,
  org_address text DEFAULT NULL,
  org_phone text DEFAULT NULL,
  org_email text DEFAULT NULL,
  org_website text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id uuid;
  new_org organizations%ROWTYPE;
  new_user_id uuid;
BEGIN
  -- Create the organization
  INSERT INTO organizations (name, description, logo, address, phone, email, website)
  VALUES (org_name, org_description, org_logo, org_address, org_phone, org_email, org_website)
  RETURNING * INTO new_org;
  
  new_org_id := new_org.id;
  
  -- Create the user record
  INSERT INTO users (organization_id, auth_user_id, name, email, role)
  VALUES (new_org_id, auth.uid(), user_name, user_email, 'admin')
  RETURNING id INTO new_user_id;
  
  -- Return the organization data as JSON
  RETURN row_to_json(new_org);
END;
$$;

-- Ensure RLS is enabled on organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Create INSERT policy for organizations - allow authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create user records" ON users;
DROP POLICY IF EXISTS "Authenticated users can create user records" ON users;

-- Create INSERT policy for users - allow authenticated users to create their own user records
CREATE POLICY "Users can create user records"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Grant execute permission on the RPC function to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_organization_id TO authenticated;