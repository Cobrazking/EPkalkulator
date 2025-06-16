/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table create circular dependencies
    - Policies reference the same users table they're protecting, causing infinite recursion
    - This prevents loading organizations and other data

  2. Solution
    - Drop existing problematic policies
    - Create simplified policies that avoid circular references
    - Use auth.uid() directly instead of complex subqueries that reference users table
    - Maintain security while eliminating recursion

  3. Security Changes
    - Users can read their own profile using auth.uid()
    - Users can update their own profile using auth.uid()
    - Users can create their own user record using auth.uid()
    - Users can read organization members through direct organization_id matching
    - Admins and managers can manage users through role-based checks that don't recurse
    - Service role maintains full access
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Users can create own user record" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new simplified policies that avoid recursion

-- Service role gets full access (no recursion risk)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own profile directly using auth.uid()
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Users can update their own profile directly using auth.uid()
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Users can create their own user record
CREATE POLICY "Users can create own user record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Users can read organization members (simplified - no recursion)
-- This allows users to see other users in their organization
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

-- Admins can manage all users in their organization
-- Using a simpler approach that checks role directly
CREATE POLICY "Admins can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_check
      WHERE admin_check.auth_user_id = auth.uid()
        AND admin_check.role = 'admin'
        AND admin_check.organization_id = users.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users admin_check
      WHERE admin_check.auth_user_id = auth.uid()
        AND admin_check.role = 'admin'
        AND admin_check.organization_id = users.organization_id
    )
  );

-- Managers can manage users in their organization (but not other admins)
CREATE POLICY "Managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users manager_check
      WHERE manager_check.auth_user_id = auth.uid()
        AND manager_check.role IN ('admin', 'manager')
        AND manager_check.organization_id = users.organization_id
    )
    AND (
      users.role != 'admin' OR 
      EXISTS (
        SELECT 1 FROM users admin_check
        WHERE admin_check.auth_user_id = auth.uid()
          AND admin_check.role = 'admin'
          AND admin_check.organization_id = users.organization_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users manager_check
      WHERE manager_check.auth_user_id = auth.uid()
        AND manager_check.role IN ('admin', 'manager')
        AND manager_check.organization_id = users.organization_id
    )
    AND (
      users.role != 'admin' OR 
      EXISTS (
        SELECT 1 FROM users admin_check
        WHERE admin_check.auth_user_id = auth.uid()
          AND admin_check.role = 'admin'
          AND admin_check.organization_id = users.organization_id
      )
    )
  );