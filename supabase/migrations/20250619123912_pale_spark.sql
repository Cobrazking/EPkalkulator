/*
  # In-App Invitation System

  1. New Functions
    - `create_in_app_invitation` - Creates invitation without sending email
    - `get_user_pending_invitations` - Gets pending invitations for a user
    - `accept_in_app_invitation` - Accepts invitation and creates user record
    - `decline_in_app_invitation` - Declines invitation

  2. Changes
    - Modified invitation system to work without email sending
    - Added functions for in-app invitation management
*/

-- Function to create in-app invitation (no email sending)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_in_app_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_pending_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION accept_in_app_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION decline_in_app_invitation TO authenticated;