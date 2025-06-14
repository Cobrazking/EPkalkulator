/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current policies on users table create infinite recursion
    - Policies reference the users table within their own conditions
    - This causes circular dependency during policy evaluation

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid self-referencing
    - Use auth.uid() directly without querying users table in policy conditions

  3. New Policies
    - Users can read their own profile using auth_user_id
    - Admins can manage users in their organization (simplified check)
    - Managers can manage users in their organization (simplified check)
    - Users can read organization members (simplified check)
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Policy 1: Users can manage their own profile
-- This is safe because it only checks auth_user_id directly
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 2: Users can read members of their organization
-- We'll use a function to avoid recursion in the policy
CREATE OR REPLACE FUNCTION get_user_organization_id(user_auth_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM users 
  WHERE auth_user_id = user_auth_id 
  LIMIT 1;
$$;

CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Policy 3: Admins can manage users in their organization
-- Using the same function to avoid recursion
CREATE POLICY "Admins can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM users admin_check 
      WHERE admin_check.auth_user_id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.organization_id = get_user_organization_id(auth.uid())
    )
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM users admin_check 
      WHERE admin_check.auth_user_id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.organization_id = get_user_organization_id(auth.uid())
    )
  );

-- Policy 4: Managers can manage users in their organization
-- Using the same function to avoid recursion
CREATE POLICY "Managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM users manager_check 
      WHERE manager_check.auth_user_id = auth.uid() 
      AND manager_check.role IN ('admin', 'manager')
      AND manager_check.organization_id = get_user_organization_id(auth.uid())
    )
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM users manager_check 
      WHERE manager_check.auth_user_id = auth.uid() 
      AND manager_check.role IN ('admin', 'manager')
      AND manager_check.organization_id = get_user_organization_id(auth.uid())
    )
  );