/*
  # Fix RLS policies for users table to avoid recursion

  1. Security Changes
    - Drop all existing problematic policies on users table
    - Create helper functions to avoid recursion in RLS policies
    - Implement new simplified policies with proper access control
    
  2. New Functions
    - get_user_organization_id: Get user's organization without recursion
    - is_user_admin: Check if user is admin in organization
    - is_user_manager_or_admin: Check if user is manager or admin
    
  3. New Policies
    - Service role gets full access
    - Users can read/update their own profile
    - Users can create their own user record
    - Users can read organization members
    - Admins can manage all organization users
    - Managers can manage non-admin users
*/

-- Drop ALL existing policies on users table to ensure clean slate
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
    END LOOP;
END $$;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_organization_id(uuid);
DROP FUNCTION IF EXISTS is_user_admin(uuid, uuid);
DROP FUNCTION IF EXISTS is_user_manager_or_admin(uuid, uuid);

-- Create helper function to get user's organization ID (avoids recursion)
CREATE OR REPLACE FUNCTION get_user_organization_id(user_auth_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id 
  FROM users 
  WHERE auth_user_id = user_auth_id 
  LIMIT 1;
$$;

-- Function to check if user is admin (avoids recursion in policies)
CREATE OR REPLACE FUNCTION is_user_admin(user_auth_id uuid, org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE auth_user_id = user_auth_id 
      AND organization_id = org_id 
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Function to check if user is manager or admin (avoids recursion in policies)
CREATE OR REPLACE FUNCTION is_user_manager_or_admin(user_auth_id uuid, org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE auth_user_id = user_auth_id 
      AND organization_id = org_id 
      AND role IN ('admin', 'manager')
      AND is_active = true
  );
$$;

-- Service role gets full access (no recursion risk)
CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own profile (direct auth check, no recursion)
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Users can update their own profile (direct auth check, no recursion)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Users can create their own user record (direct auth check, no recursion)
CREATE POLICY "Users can create own user record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Users can read organization members (using function to avoid recursion)
CREATE POLICY "Users can read organization members"
  ON users
  FOR SELECT
  TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Admins can manage all organization users
CREATE POLICY "Admins can manage organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid(), organization_id))
  WITH CHECK (is_user_admin(auth.uid(), organization_id));

-- Managers can manage non-admin users in their organization
CREATE POLICY "Managers can manage non-admin organization users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    is_user_manager_or_admin(auth.uid(), organization_id) 
    AND (role <> 'admin' OR is_user_admin(auth.uid(), organization_id))
  )
  WITH CHECK (
    is_user_manager_or_admin(auth.uid(), organization_id) 
    AND (role <> 'admin' OR is_user_admin(auth.uid(), organization_id))
  );