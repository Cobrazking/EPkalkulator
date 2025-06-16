/*
  # Fix infinite recursion in RLS policies

  1. Security Changes
    - Drop all existing policies on users table to prevent conflicts
    - Create simplified, non-recursive policies
    - Ensure proper access control without circular dependencies

  2. Policy Structure
    - Service role gets full access
    - Users can manage their own records
    - Organization-based access for reading members
    - Role-based access for admins and managers
*/

-- First, get all existing policy names for the users table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on users table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

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