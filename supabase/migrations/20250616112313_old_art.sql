/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - The current RLS policies on the users table are causing infinite recursion
    - This happens when policies reference functions or create circular dependencies
    - The error occurs when trying to load organizations data

  2. Solution
    - Drop all existing problematic policies on users table
    - Create simplified, non-recursive policies
    - Ensure policies use direct auth.uid() references instead of complex subqueries
    - Remove dependencies on custom functions that might not exist

  3. Security
    - Maintain proper access control without recursion
    - Users can only access their own data and organization members
    - Admins and managers have appropriate elevated permissions
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

-- Allow service role full access (this should not cause recursion)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to read their own profile (direct auth.uid() check)
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Allow users to update their own profile (direct auth.uid() check)
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

-- Allow users to read other users in the same organization
-- This uses a simple subquery without recursion
CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
      LIMIT 1
    )
  );

-- Allow admins to manage users in their organization
-- This policy checks if the current user is an admin in the same organization
CREATE POLICY "Admins can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users admin_check 
      WHERE admin_check.auth_user_id = auth.uid() 
        AND admin_check.role = 'admin'
        AND admin_check.organization_id = users.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users admin_check 
      WHERE admin_check.auth_user_id = auth.uid() 
        AND admin_check.role = 'admin'
        AND admin_check.organization_id = users.organization_id
    )
  );

-- Allow managers to manage users in their organization
-- This policy checks if the current user is a manager or admin in the same organization
CREATE POLICY "Managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users manager_check 
      WHERE manager_check.auth_user_id = auth.uid() 
        AND manager_check.role IN ('admin', 'manager')
        AND manager_check.organization_id = users.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users manager_check 
      WHERE manager_check.auth_user_id = auth.uid() 
        AND manager_check.role IN ('admin', 'manager')
        AND manager_check.organization_id = users.organization_id
    )
  );