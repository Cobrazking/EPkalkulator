/*
  # Email Verification System for Organization Invitations

  1. New Tables
    - `organization_invitations`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `email` (text, email address)
      - `name` (text, invitee name)
      - `role` (user_role, intended role)
      - `invited_by` (uuid, foreign key to users)
      - `token` (text, verification token)
      - `status` (invitation_status, pending/accepted/expired/cancelled)
      - `expires_at` (timestamp, expiration time)
      - `accepted_at` (timestamp, when accepted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. New Types
    - `invitation_status` enum

  3. Security
    - Enable RLS on `organization_invitations` table
    - Add policies for invitation management
    - Add functions for invitation handling

  4. Functions
    - Function to create invitation
    - Function to verify invitation token
    - Function to accept invitation
    - Function to cleanup expired invitations
*/

-- Create invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Create organization invitations table
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

-- Create indexes for better performance
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

-- RLS Policies for organization_invitations

-- Users can view invitations for their organization
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

-- Admins and managers can create invitations
CREATE POLICY "Admins and managers can create invitations"
  ON organization_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_user_manager_or_admin(auth.uid(), organization_id)
  );

-- Admins and managers can update invitations (cancel, etc.)
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

-- Admins and managers can delete invitations
CREATE POLICY "Admins and managers can delete invitations"
  ON organization_invitations
  FOR DELETE
  TO authenticated
  USING (
    is_user_manager_or_admin(auth.uid(), organization_id)
  );

-- Service role full access
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
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'base64');
  -- Remove URL-unsafe characters
  token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');
  RETURN token;
END;
$$;

-- Function to create an invitation
CREATE OR REPLACE FUNCTION create_organization_invitation(
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

-- Function to verify invitation token
CREATE OR REPLACE FUNCTION verify_invitation_token(p_token text)
RETURNS TABLE (
  invitation_id uuid,
  organization_id uuid,
  organization_name text,
  email text,
  name text,
  role user_role,
  invited_by_name text,
  expires_at timestamptz,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.organization_id,
    o.name,
    i.email,
    i.name,
    i.role,
    u.name,
    i.expires_at,
    (i.status = 'pending' AND i.expires_at > now()) as is_valid
  FROM organization_invitations i
  JOIN organizations o ON i.organization_id = o.id
  JOIN users u ON i.invited_by = u.id
  WHERE i.token = p_token;
END;
$$;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(
  p_token text,
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
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();

  IF v_invitation.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
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

-- Function to cleanup expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE organization_invitations
  SET 
    status = 'expired',
    updated_at = now()
  WHERE status = 'pending'
    AND expires_at <= now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to resend invitation (creates new token)
CREATE OR REPLACE FUNCTION resend_invitation(
  p_invitation_id uuid,
  p_auth_user_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation organization_invitations%ROWTYPE;
  v_new_token text;
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
    RAISE EXCEPTION 'Insufficient permissions to resend invitation';
  END IF;

  -- Only allow resending pending invitations
  IF v_invitation.status != 'pending' THEN
    RAISE EXCEPTION 'Can only resend pending invitations';
  END IF;

  -- Generate new token
  v_new_token := generate_invitation_token();

  -- Update invitation with new token and extended expiry
  UPDATE organization_invitations
  SET 
    token = v_new_token,
    expires_at = now() + interval '7 days',
    updated_at = now()
  WHERE id = p_invitation_id;

  RETURN v_new_token;
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organization_invitations_updated_at
  BEFORE UPDATE ON organization_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organization_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION create_organization_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION verify_invitation_token TO authenticated;
GRANT EXECUTE ON FUNCTION accept_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION resend_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations TO authenticated;