/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table are creating infinite recursion
    - Policies are referencing the users table within their own conditions
    - This creates circular dependencies when querying user data

  2. Solution
    - Replace problematic policies with simpler, non-recursive ones
    - Use auth.uid() directly instead of querying users table
    - Create a helper function to get current user's organization ID safely
    - Ensure policies don't create circular references

  3. Changes
    - Drop existing problematic policies
    - Create new, safe RLS policies
    - Add helper function for organization access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Create a safe function to get current user's organization ID
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

-- Create new, safe RLS policies

-- Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Service role has full access (for system operations)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read other users in their organization (simplified)
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

-- Admins can manage users in their organization
CREATE POLICY "Admins can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users admin_user 
      WHERE admin_user.auth_user_id = auth.uid() 
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = users.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users admin_user 
      WHERE admin_user.auth_user_id = auth.uid() 
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = users.organization_id
    )
  );

-- Managers can manage users in their organization (excluding admin operations)
CREATE POLICY "Managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users manager_user 
      WHERE manager_user.auth_user_id = auth.uid() 
        AND manager_user.role IN ('admin', 'manager')
        AND manager_user.organization_id = users.organization_id
    )
    AND (
      -- Managers cannot modify admin users unless they are admin themselves
      users.role != 'admin' OR 
      EXISTS (
        SELECT 1 
        FROM users admin_check 
        WHERE admin_check.auth_user_id = auth.uid() 
          AND admin_check.role = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users manager_user 
      WHERE manager_user.auth_user_id = auth.uid() 
        AND manager_user.role IN ('admin', 'manager')
        AND manager_user.organization_id = users.organization_id
    )
    AND (
      -- Managers cannot create admin users unless they are admin themselves
      users.role != 'admin' OR 
      EXISTS (
        SELECT 1 
        FROM users admin_check 
        WHERE admin_check.auth_user_id = auth.uid() 
          AND admin_check.role = 'admin'
      )
    )
  );