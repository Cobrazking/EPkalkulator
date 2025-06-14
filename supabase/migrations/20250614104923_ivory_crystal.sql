/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current policies on users table create infinite recursion
    - Policies reference the users table while being applied to the users table
    - This causes circular dependency when checking permissions

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that don't cause recursion
    - Use auth.uid() directly instead of querying users table within policies

  3. New Policies
    - Users can read their own profile using auth.uid()
    - Users can update their own profile using auth.uid()
    - Service role can manage all users (for admin operations)
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Create new simplified policies that don't cause recursion

-- Policy 1: Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 2: Users can read other users in their organization
-- This uses a function to get organization ID without recursion
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

-- Policy 3: Service role can manage all users (for system operations)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a helper function to get user's organization ID safely
CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Policy 4: Admin users can manage users in their organization
CREATE POLICY "Admins can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    organization_id = get_current_user_org_id()
    AND EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.role = 'admin'
      AND admin_user.organization_id = get_current_user_org_id()
    )
  )
  WITH CHECK (
    organization_id = get_current_user_org_id()
    AND EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.auth_user_id = auth.uid()
      AND admin_user.role = 'admin'
      AND admin_user.organization_id = get_current_user_org_id()
    )
  );

-- Policy 5: Manager users can manage users in their organization
CREATE POLICY "Managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    organization_id = get_current_user_org_id()
    AND EXISTS (
      SELECT 1 FROM users manager_user
      WHERE manager_user.auth_user_id = auth.uid()
      AND manager_user.role IN ('admin', 'manager')
      AND manager_user.organization_id = get_current_user_org_id()
    )
  )
  WITH CHECK (
    organization_id = get_current_user_org_id()
    AND EXISTS (
      SELECT 1 FROM users manager_user
      WHERE manager_user.auth_user_id = auth.uid()
      AND manager_user.role IN ('admin', 'manager')
      AND manager_user.organization_id = get_current_user_org_id()
    )
  );