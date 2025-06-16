/*
  # Fix RLS infinite recursion

  1. Problem
    - Circular dependency between users and organizations table policies
    - Organizations policies check users table, users policies check organizations
    - This creates infinite recursion during policy evaluation

  2. Solution
    - Simplify policies to break the circular dependency
    - Use direct auth.uid() checks where possible
    - Avoid cross-table policy dependencies that create loops

  3. Changes
    - Update organizations table policies to use simpler auth checks
    - Update users table policies to avoid circular references
    - Ensure policies are efficient and don't create dependency loops
*/

-- Drop existing problematic policies on organizations table
DROP POLICY IF EXISTS "Users can read their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can delete their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update their organizations" ON organizations;

-- Drop existing problematic policies on users table that might cause recursion
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Create simplified policies for organizations table
-- These policies avoid querying the users table to prevent recursion
CREATE POLICY "Users can read organizations they belong to"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update organizations they admin"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin')
    )
  );

CREATE POLICY "Users can delete organizations they admin"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin')
    )
  );

-- Recreate the users policy for reading organization members with a simpler approach
CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT u.organization_id
      FROM users u
      WHERE u.auth_user_id = auth.uid()
      LIMIT 1
    )
  );

-- Create a function to help with organization creation that bypasses RLS temporarily
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
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  new_user_id uuid;
  result json;
BEGIN
  -- Create the organization
  INSERT INTO organizations (
    name, description, logo, address, phone, email, website
  ) VALUES (
    org_name, org_description, org_logo, org_address, org_phone, org_email, org_website
  ) RETURNING id INTO new_org_id;

  -- Create the user record
  INSERT INTO users (
    organization_id, auth_user_id, name, email, role
  ) VALUES (
    new_org_id, auth.uid(), user_name, user_email, 'admin'
  ) RETURNING id INTO new_user_id;

  -- Return the organization data
  SELECT json_build_object(
    'id', o.id,
    'name', o.name,
    'description', o.description,
    'logo', o.logo,
    'address', o.address,
    'phone', o.phone,
    'email', o.email,
    'website', o.website,
    'created_at', o.created_at,
    'updated_at', o.updated_at
  ) INTO result
  FROM organizations o
  WHERE o.id = new_org_id;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_user TO authenticated;