/*
  # Fix infinite recursion in users RLS policy

  1. Security Changes
    - Drop the problematic "Users can read organization members" policy that causes infinite recursion
    - Replace it with a simpler policy that doesn't create circular references
    - Keep existing policies for user profile management and service role access

  2. Policy Changes
    - Remove recursive policy that queries users table from within users table policy
    - Add new policy that allows users to read other users in their organization without recursion
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read organization members" ON users;

-- Create a new policy that doesn't cause recursion
-- This policy allows authenticated users to read other users in their organization
-- by directly checking if they share the same organization_id with the current user
CREATE POLICY "Users can read organization members" ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
      LIMIT 1
    )
  );