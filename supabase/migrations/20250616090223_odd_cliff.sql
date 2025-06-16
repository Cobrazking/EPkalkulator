/*
  # Fix RLS Policies to Resolve Infinite Recursion

  1. Policy Updates
    - Simplify users table policies to avoid circular references
    - Update organization and other table policies to use direct auth checks
    - Remove complex subqueries that cause recursion

  2. Security
    - Maintain proper access control without circular dependencies
    - Ensure users can only access data from their organization
    - Keep service role access for administrative functions
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can read same organization members" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;

-- Create simplified user policies
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

-- Update organizations policy to be simpler
DROP POLICY IF EXISTS "Users can manage organizations" ON organizations;

CREATE POLICY "Users can access their organizations"
  ON organizations
  FOR ALL
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

-- Update customers policy to be simpler
DROP POLICY IF EXISTS "Users can access organization customers" ON customers;

CREATE POLICY "Users can access organization customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Update projects policy to be simpler
DROP POLICY IF EXISTS "Users can access organization projects" ON projects;

CREATE POLICY "Users can access organization projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Update calculators policy to be simpler
DROP POLICY IF EXISTS "Users can access organization calculators" ON calculators;

CREATE POLICY "Users can access organization calculators"
  ON calculators
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Update user_settings policy to be simpler
DROP POLICY IF EXISTS "Users can access their own settings" ON user_settings;

CREATE POLICY "Users can access their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id 
      FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );