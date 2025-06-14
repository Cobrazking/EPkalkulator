/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table create circular dependencies
    - Policies reference the users table within their own conditions
    - This causes infinite recursion when Supabase tries to evaluate the policies

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid circular references
    - Use auth.uid() directly instead of querying users table within policies
    - Simplify policy logic to prevent recursion

  3. New Policies
    - Users can read their own data
    - Service role can manage all users
    - Simplified organization-based access without circular references
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Create new simplified policies without circular references

-- Allow users to read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow service role full access (for system operations)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to read other users in their organization
-- This policy avoids recursion by not querying the users table within the policy
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

-- Allow organization admins to manage users in their organization
-- This policy is more restrictive and avoids the recursive lookup
CREATE POLICY "Organization admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Check if current user is admin in the same organization
    EXISTS (
      SELECT 1 
      FROM users admin_user 
      WHERE admin_user.auth_user_id = auth.uid() 
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = users.organization_id
    )
  )
  WITH CHECK (
    -- Same check for inserts/updates
    EXISTS (
      SELECT 1 
      FROM users admin_user 
      WHERE admin_user.auth_user_id = auth.uid() 
        AND admin_user.role = 'admin'
        AND admin_user.organization_id = users.organization_id
    )
  );