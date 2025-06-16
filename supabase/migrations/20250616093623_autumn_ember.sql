/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "users"
    - Circular dependencies between user access policies

  2. Solution
    - Simplify RLS policies to avoid circular references
    - Use auth.uid() directly instead of complex subqueries where possible
    - Ensure policies don't create loops between tables

  3. Changes
    - Update users table policies to be more direct
    - Simplify organization access policies
    - Fix other table policies to avoid recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Drop and recreate policies on other tables to ensure consistency
DROP POLICY IF EXISTS "Users can access their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can access organization customers" ON customers;
DROP POLICY IF EXISTS "Users can access organization projects" ON projects;
DROP POLICY IF EXISTS "Users can access organization calculators" ON calculators;
DROP POLICY IF EXISTS "Users can access their own settings" ON user_settings;

-- Create simplified policies for users table
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

CREATE POLICY "Users can read same organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for organizations
CREATE POLICY "Users can access their organizations"
  ON organizations
  FOR ALL
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

-- Create policies for customers
CREATE POLICY "Users can access organization customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Create policies for projects
CREATE POLICY "Users can access organization projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Create policies for calculators
CREATE POLICY "Users can access organization calculators"
  ON calculators
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Create policies for user_settings
CREATE POLICY "Users can access their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT u.id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT u.id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  );