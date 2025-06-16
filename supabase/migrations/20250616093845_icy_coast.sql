/*
  # Fix infinite recursion in users table RLS policy

  1. Problem
    - The "Users can read organization members" policy on the users table creates infinite recursion
    - It tries to query the users table from within a policy on the users table
    
  2. Solution
    - Drop the problematic policy
    - Create a new policy that avoids recursion by using a different approach
    - Allow users to read organization members by checking auth.uid() directly against auth_user_id
    - Use a separate policy for reading organization members that doesn't create circular dependencies

  3. Security
    - Maintain the same security level
    - Users can still only read members of their own organization
    - Avoid the recursive query pattern
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Create a new policy that allows users to read other users in the same organization
-- This avoids recursion by using a more direct approach
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

-- Alternative approach: Create a simpler policy structure
-- Drop the above policy and use this simpler approach instead
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Create a policy that allows users to read all users in their organization
-- by first getting the current user's organization_id through a function
CREATE OR REPLACE FUNCTION get_current_user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM users 
  WHERE auth_user_id = auth.uid() 
  LIMIT 1;
$$;

-- Now create the policy using the function to avoid recursion
CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (organization_id = get_current_user_organization_id());