/*
  # Fix Organization RLS Policy

  1. Security Updates
    - Update organizations table RLS policies to allow proper organization creation
    - Ensure authenticated users can create organizations and then link themselves to them
    - Fix the circular dependency issue between organizations and users tables

  2. Changes
    - Drop existing restrictive INSERT policy on organizations
    - Create new INSERT policy that allows authenticated users to create organizations
    - Update other policies to work with the new user-organization relationship flow
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a new INSERT policy that allows any authenticated user to create an organization
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update the SELECT policy to allow users to read organizations they belong to
-- This policy should allow reading organizations where the user has a record in the users table
DROP POLICY IF EXISTS "Users can read their organizations" ON organizations;
CREATE POLICY "Users can read their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Update the UPDATE policy to allow users to update organizations they belong to
DROP POLICY IF EXISTS "Users can update their organizations" ON organizations;
CREATE POLICY "Users can update their organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Update the DELETE policy to allow users to delete organizations they belong to
DROP POLICY IF EXISTS "Users can delete their organizations" ON organizations;
CREATE POLICY "Users can delete their organizations"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );