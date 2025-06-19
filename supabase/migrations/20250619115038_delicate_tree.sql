/*
  # Update invitation functions to return tokens for email sending

  1. Changes
    - Drop and recreate create_organization_invitation function to return text (token)
    - Drop and recreate resend_invitation function to return text (token)
    - These functions now return tokens that can be used by the client to send emails

  2. Security
    - Functions maintain existing security checks
    - SECURITY DEFINER ensures proper permission handling
*/

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS create_organization_invitation(uuid,text,text,user_role,uuid);
DROP FUNCTION IF EXISTS resend_invitation(uuid,uuid);

-- Recreate the create_organization_invitation function to return token
CREATE OR REPLACE FUNCTION create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_name text,
  p_role user_role,
  p_invited_by_auth_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invited_by_user_id uuid;
  v_invited_by_name text;
  v_organization_name text;
  v_invitation_id uuid;
  v_token text;
  v_invitation_url text;
BEGIN
  -- Get the user ID and name of the inviter
  SELECT u.id, u.name INTO v_invited_by_user_id, v_invited_by_name
  FROM users u
  WHERE u.auth_user_id = p_invited_by_auth_id
    AND u.organization_id = p_organization_id;

  IF v_invited_by_user_id IS NULL THEN
    RAISE EXCEPTION 'Inviter not found in organization';
  END IF;

  -- Get organization name
  SELECT name INTO v_organization_name
  FROM organizations
  WHERE id = p_organization_id;

  IF v_organization_name IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
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

  -- Return the token so the client can send the email
  RETURN v_token;
END;
$$;

-- Recreate the resend_invitation function to return the new token
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