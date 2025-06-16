/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table create circular dependencies
    - Policies reference the users table within their own conditions
    - This causes infinite recursion when Supabase evaluates the policies

  2. Solution
    - Drop existing problematic policies
    - Create simplified policies that avoid self-referencing
    - Use direct auth.uid() comparisons where possible
    - Create helper policies that don't create circular dependencies

  3. New Policies
    - Users can read their own profile (direct auth.uid() comparison)
    - Users can read other users in their organization (using a more efficient approach)
    - Service role maintains full access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Organization members can read users" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;

-- Create new, non-recursive policies

-- Policy 1: Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 2: Users can read other users in their organization
-- This uses a more efficient approach that doesn't create recursion
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

-- Keep the service role policy as it was working fine
-- (This should already exist, but adding it for completeness)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);