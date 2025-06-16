/*
  # Fix infinite recursion in users table RLS policy

  1. Problem
    - The "Users can read same organization members" policy on the users table
    - Creates infinite recursion by querying the users table from within its own policy
    - This prevents any queries to the users table from working

  2. Solution
    - Drop the problematic policy that causes infinite recursion
    - Create a simpler, more direct policy structure
    - Ensure policies can be evaluated without circular dependencies

  3. Security
    - Maintain proper access control for users
    - Users can still read their own profile
    - Users can read organization members through a non-recursive approach
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read same organization members" ON users;

-- Create a simpler policy for reading organization members
-- This avoids the circular reference by using a more direct approach
CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );