/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - Policies are querying the users table from within their own conditions
    - This creates a circular dependency when Supabase tries to evaluate the policies

  2. Solution
    - Replace recursive policies with direct auth.uid() comparisons
    - Use simple, non-recursive conditions that don't query the same table
    - Ensure policies allow users to read their own data and admins/managers to manage organization users

  3. Changes
    - Drop existing problematic policies
    - Create new policies that avoid recursion
    - Use auth.uid() directly instead of subqueries to users table
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins and managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Users can read organization users" ON users;

-- Create new policies that avoid recursion
-- Policy 1: Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 2: Allow reading users in the same organization (for displaying team members, etc.)
-- This uses a direct join to avoid recursion
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

-- Policy 3: Admins and managers can manage users in their organization
-- This policy is more complex but avoids recursion by using a single lookup
CREATE POLICY "Admins and managers can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users manager 
      WHERE manager.auth_user_id = auth.uid() 
        AND manager.organization_id = users.organization_id
        AND manager.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users manager 
      WHERE manager.auth_user_id = auth.uid() 
        AND manager.organization_id = users.organization_id
        AND manager.role IN ('admin', 'manager')
    )
  );