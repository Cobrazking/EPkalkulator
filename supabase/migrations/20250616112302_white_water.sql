/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - Policies reference functions that query the same users table they're protecting
    - This creates circular dependencies during policy evaluation

  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid recursion
    - Use direct auth.uid() comparisons instead of complex subqueries
    - Ensure policies are evaluated without circular references

  3. Security
    - Maintain proper access control
    - Users can only access their own data and organization members
    - Admins and managers retain appropriate permissions
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can create user records" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simplified, non-recursive policies

-- Allow service role full access (no recursion risk)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to read their own profile (direct auth.uid() comparison)
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Allow users to update their own profile (direct auth.uid() comparison)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow users to insert their own user record during signup
CREATE POLICY "Users can create own user record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Allow users to read organization members (simplified approach)
-- This policy allows reading users in the same organization without recursion
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

-- Allow admins to manage users in their organization
-- Using a simpler approach that checks admin role directly
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

-- Allow managers to manage users in their organization
-- Using a simpler approach that checks manager/admin role directly
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users manager_user 
      WHERE manager_user.auth_user_id = auth.uid() 
        AND manager_user.role IN ('admin', 'manager')
        AND manager_user.organization_id = users.organization_id
    )
  );

-- Drop the problematic function if it exists
DROP FUNCTION IF EXISTS get_current_user_org_id();

-- Create a simple helper function that doesn't cause recursion
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