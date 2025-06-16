/*
  # Fix Organization Creation RLS Policy

  1. Policy Changes
    - Update the INSERT policy for organizations to allow any authenticated user to create organizations
    - The existing policies for SELECT, UPDATE, DELETE remain the same as they properly check organization membership

  2. Security
    - Users can create organizations (they become the admin of organizations they create)
    - Users can only read/update/delete organizations they belong to
    - The user record creation in ProjectContext.tsx handles the membership linking
*/

-- Drop the existing INSERT policy and recreate it with proper logic
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a new INSERT policy that allows any authenticated user to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the other policies remain intact for proper access control
-- (These should already exist based on the schema, but let's make sure they're correct)

-- Policy for reading organizations (user must be a member)
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

-- Policy for updating organizations (user must be a member)
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

-- Policy for deleting organizations (user must be a member)
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