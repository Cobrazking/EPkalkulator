/*
  # Fix organization creation issues

  1. Security Updates
    - Ensure organizations can be created by authenticated users
    - Fix any remaining RLS policy issues
    - Allow users to create organizations they will be admin of

  2. Changes
    - Update organization policies to allow creation
    - Ensure proper user creation flow
*/

-- Drop existing organization policies to recreate them properly
DROP POLICY IF EXISTS "Users can access their organizations" ON organizations;

-- Create a policy that allows users to read organizations they belong to
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

-- Create a policy that allows authenticated users to create organizations
CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a policy that allows users to update organizations they belong to
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

-- Create a policy that allows users to delete organizations they belong to (admin only in app logic)
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

-- Ensure users can be created for new organizations
-- Drop existing user policies and recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Create user policies that work properly
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow authenticated users to create user records (for organization creation)
CREATE POLICY "Users can create user records"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Allow users to read other users in their organization using the helper function
CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (organization_id = get_current_user_organization_id());

-- Service role has full access
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);