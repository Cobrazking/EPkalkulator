/*
  # Fix invitation system

  1. Ensure all required functions exist
  2. Fix RLS policies
  3. Add proper indexes
  4. Test invitation flow
*/

-- Ensure the invitation status enum exists
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure organization_invitations table exists with correct structure
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_expires_at ON organization_invitations(expires_at);

-- Unique constraint to prevent duplicate pending invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_invitations_unique_pending 
ON organization_invitations(organization_id, email) 
WHERE status = 'pending';

-- Enable RLS
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view organization invitations" ON organization_invitations;
DROP POLICY IF EXISTS "Admins and managers can create invitations" ON organization_invitations;
DROP POLICY IF EXISTS "Admins and managers can update invitations" ON organization_invitations;
DROP POLICY IF EXISTS "Admins and managers can delete invitations" ON organization_invitations;
DROP POLICY IF EXISTS "Service role full access on invitations" ON organization_invitations;

-- Recreate RLS policies
CREATE POLICY "Users can view organization invitations"
  ON organization_invitations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can create invitations"
  ON organization_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_user_manager_or_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Admins and managers can update invitations"
  ON organization_invitations
  FOR UPDATE
  TO authenticated
  USING (
    is_user_manager_or_admin(auth.uid(), organization_id)
  )
  WITH CHECK (
    is_user_manager_or_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Admins and managers can delete invitations"
  ON organization_invitations
  FOR DELETE
  TO authenticated
  USING (
    is_user_manager_or_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Service role full access on invitations"
  ON organization_invitations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token text;
BEGIN
  token := encode(gen_random_bytes(32), 'base64');
  token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
  RETURN token;
END;
$$;

-- Function to create in-app invitation
CREATE OR REPLACE FUNCTION create_in_app_invitation(
  p_organization_id uuid,
  p_email text,
  p_name text,
  p_role user_role,
  p_invited_by_auth_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invited_by_user_id uuid;
  v_invitation_id uuid;
  v_token text;
BEGIN
  -- Get the user ID of the inviter
  SELECT id INTO v_invited_by_user_id
  FROM users
  WHERE auth_user_id = p_invited_by_auth_id
    AND organization_id = p_organization_id;

  IF v_invited_by_user_id IS NULL THEN
    RAISE EXCEPTION 'Inviter not found in organization';
  END IF;

  -- Check if user has permission to invite
  IF NOT is_user_manager_or_admin(p_invited_by_auth_id, p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions to create invitation';
  END IF;

  -- Check if there's already a pending invitation for this email
  IF EXISTS (
    SELECT 1 FROM organization_invitations
    WHERE organization_id = p_organization_id
      AND email = lower(p_email)
      AND status = 'pending'
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Pending invitation already exists for this email';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM users
    WHERE organization_id = p_organization_id
      AND email = lower(p_email)
  ) THEN
    RAISE EXCEPTION 'User is already a member of this organization';
  END IF;

  -- Generate token
  v_token := generate_invitation_token();

  -- Create the invitation
  INSERT INTO organization_invitations (
    organization_id,
    email,
    name,
    role,
    invited_by,
    token
  ) VALUES (
    p_organization_id,
    lower(p_email),
    p_name,
    p_role,
    v_invited_by_user_id,
    v_token
  ) RETURNING id INTO v_invitation_id;

  RETURN v_invitation_id;
END;
$$;

-- Function to get pending invitations for a user by email
CREATE OR REPLACE FUNCTION get_user_pending_invitations(p_user_email text)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  organization_name text,
  email text,
  name text,
  role user_role,
  invited_by_name text,
  expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.organization_id,
    o.name as organization_name,
    i.email,
    i.name,
    i.role,
    u.name as invited_by_name,
    i.expires_at,
    i.created_at
  FROM organization_invitations i
  JOIN organizations o ON i.organization_id = o.id
  JOIN users u ON i.invited_by = u.id
  WHERE i.email = lower(p_user_email)
    AND i.status = 'pending'
    AND i.expires_at > now()
  ORDER BY i.created_at DESC;
END;
$$;

-- Function to accept in-app invitation
CREATE OR REPLACE FUNCTION accept_in_app_invitation(
  p_invitation_id uuid,
  p_auth_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation organization_invitations%ROWTYPE;
  v_user_id uuid;
  v_auth_user auth.users%ROWTYPE;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM organization_invitations
  WHERE id = p_invitation_id
    AND status = 'pending'
    AND expires_at > now();

  IF v_invitation.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Get auth user details
  SELECT * INTO v_auth_user
  FROM auth.users
  WHERE id = p_auth_user_id;

  IF v_auth_user.id IS NULL THEN
    RAISE EXCEPTION 'Invalid user';
  END IF;

  -- Verify email matches
  IF lower(v_auth_user.email) != lower(v_invitation.email) THEN
    RAISE EXCEPTION 'Email address does not match invitation';
  END IF;

  -- Check if user already exists in this organization
  SELECT id INTO v_user_id
  FROM users
  WHERE auth_user_id = p_auth_user_id
    AND organization_id = v_invitation.organization_id;

  IF v_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'User is already a member of this organization';
  END IF;

  -- Create user record
  INSERT INTO users (
    organization_id,
    auth_user_id,
    name,
    email,
    role,
    is_active
  ) VALUES (
    v_invitation.organization_id,
    p_auth_user_id,
    COALESCE(v_auth_user.raw_user_meta_data->>'full_name', v_invitation.name),
    v_auth_user.email,
    v_invitation.role,
    true
  ) RETURNING id INTO v_user_id;

  -- Mark invitation as accepted
  UPDATE organization_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    updated_at = now()
  WHERE id = v_invitation.id;

  RETURN v_user_id;
END;
$$;

-- Function to decline in-app invitation
CREATE OR REPLACE FUNCTION decline_in_app_invitation(p_invitation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark invitation as cancelled
  UPDATE organization_invitations
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE id = p_invitation_id
    AND status = 'pending';

  RETURN FOUND;
END;
$$;

-- Function to get organization invitations (for the invitation list modal)
CREATE OR REPLACE FUNCTION get_organization_invitations(p_organization_id uuid, p_auth_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role user_role,
  status invitation_status,
  invited_by_name text,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has permission to view invitations
  IF NOT is_user_manager_or_admin(p_auth_user_id, p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions to view invitations';
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.name,
    i.role,
    i.status,
    u.name as invited_by_name,
    i.expires_at,
    i.accepted_at,
    i.created_at,
    i.updated_at
  FROM organization_invitations i
  JOIN users u ON i.invited_by = u.id
  WHERE i.organization_id = p_organization_id
  ORDER BY i.created_at DESC;
END;
$$;

-- Function to cancel invitation
CREATE OR REPLACE FUNCTION cancel_invitation(
  p_invitation_id uuid,
  p_auth_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation organization_invitations%ROWTYPE;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM organization_invitations
  WHERE id = p_invitation_id;

  IF v_invitation.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  -- Check permissions
  IF NOT is_user_manager_or_admin(p_auth_user_id, v_invitation.organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions to cancel invitation';
  END IF;

  -- Cancel the invitation
  UPDATE organization_invitations
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE id = p_invitation_id
    AND status = 'pending';

  RETURN FOUND;
END;
$$;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organization_invitations_updated_at ON organization_invitations;
CREATE TRIGGER update_organization_invitations_updated_at
  BEFORE UPDATE ON organization_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organization_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION create_in_app_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_pending_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION accept_in_app_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION decline_in_app_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_invitation TO authenticated;