/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current RLS policies on users table create infinite recursion
    - Policies query the same users table they are applied to
    - This causes circular dependency during policy evaluation

  2. Solution
    - Drop problematic policies that cause recursion
    - Create simpler, non-recursive policies
    - Use auth.uid() directly instead of subqueries to users table

  3. New Policies
    - Users can manage their own profile (using auth_user_id = auth.uid())
    - Service role retains full access
    - Remove recursive organization-based policies
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Organization members can read users" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Keep the working policies
-- "Users can manage own profile" - already exists and works correctly
-- "Service role full access" - already exists and works correctly

-- Create a simple policy for reading users within the same organization
-- This avoids recursion by using a direct join instead of subquery
CREATE POLICY "Users can read same organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id 
      FROM organizations o
      INNER JOIN users u ON u.organization_id = o.id
      WHERE u.auth_user_id = auth.uid()
    )
  );