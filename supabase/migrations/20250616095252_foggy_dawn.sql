/*
  # Fix Organization Creation RLS Policy

  1. Security Changes
    - Update the INSERT policy on `organizations` table to properly allow authenticated users to create organizations
    - The current policy has `with_check: "true"` but no proper qualification for who can insert
    - Add proper policy that allows any authenticated user to create an organization

  2. Changes Made
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows authenticated users to create organizations
    - Ensure the policy works with the current application flow
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a new INSERT policy that allows authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the existing SELECT policy allows users to read organizations they have access to
-- (This should already exist based on the schema, but let's make sure it's correct)
DROP POLICY IF EXISTS "Users can read their organizations" ON organizations;

CREATE POLICY "Users can read their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT u.organization_id
      FROM users u
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Ensure the UPDATE policy is correct
DROP POLICY IF EXISTS "Users can update their organizations" ON organizations;

CREATE POLICY "Users can update their organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT u.organization_id
      FROM users u
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT u.organization_id
      FROM users u
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Ensure the DELETE policy is correct
DROP POLICY IF EXISTS "Users can delete their organizations" ON organizations;

CREATE POLICY "Users can delete their organizations"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT u.organization_id
      FROM users u
      WHERE u.auth_user_id = auth.uid()
    )
  );