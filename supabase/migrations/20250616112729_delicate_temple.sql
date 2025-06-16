-- Drop ALL existing policies on users table to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage non-admin organization users" ON users;
DROP POLICY IF EXISTS "Managers can manage non-admin users" ON users;
DROP POLICY IF EXISTS "Users can read organization members" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own user record" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS get_user_organization_id(uuid);
DROP FUNCTION IF EXISTS is_user_admin(uuid, uuid);
DROP FUNCTION IF EXISTS is_user_manager_or_admin(uuid, uuid);

-- Create helper functions to avoid recursion in policies
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
  );
$$;

-- Create new simplified policies that avoid recursion

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

-- Users can read organization members (using a function to avoid recursion)
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
    AND (role != 'admin' OR is_user_admin(auth.uid(), organization_id))
  )
  WITH CHECK (
    is_user_manager_or_admin(auth.uid(), organization_id) 
    AND (role != 'admin' OR is_user_admin(auth.uid(), organization_id))
  );

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_user_organization_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_manager_or_admin(uuid, uuid) TO authenticated;