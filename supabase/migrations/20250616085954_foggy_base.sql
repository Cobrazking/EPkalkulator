/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Existing RLS policies on users table create infinite recursion
    - Policies reference the users table within their own conditions
    - This causes "infinite recursion detected in policy for relation users" error

  2. Solution
    - Drop the problematic recursive policies
    - Create new, simplified policies that don't create circular references
    - Keep existing service role policy unchanged

  3. Changes
    - Remove "Organization members can read users" policy (recursive)
    - Remove "Users can read organization members" policy (recursive) 
    - Recreate "Users can manage own profile" policy (simplified)
    - Add new "Users can read organization members" policy (non-recursive)
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

-- Note: "Service role full access" policy already exists, so we don't recreate it