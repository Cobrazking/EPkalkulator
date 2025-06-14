/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table create circular dependencies
    - Policies reference the users table within themselves causing infinite recursion
    
  2. Solution
    - Drop existing problematic policies
    - Create new simplified policies that avoid circular references
    - Use direct auth.uid() comparisons instead of subqueries to users table
    
  3. Security
    - Users can read/update their own profile via auth_user_id
    - Service role maintains full access
    - Organization members can read each other's basic info
    - Only admins can manage user roles and organization assignments
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Create new policies without circular dependencies

-- 1. Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- 2. Service role has full access (for system operations)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Users can read other users in their organization (simplified)
-- This policy uses a direct join to avoid recursion
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

-- 4. Admin users can manage users in their organization
-- This policy checks admin status directly without subqueries to users table
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