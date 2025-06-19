/*
  # Add leave organization functionality

  1. New Functions
    - `leave_organization()` - Function for users to leave an organization
    - `can_user_leave_organization()` - Check if user can leave (not the last admin)

  2. Security
    - Users can only leave organizations they are members of
    - Last admin cannot leave (must transfer admin role first)
    - Proper cleanup of user data when leaving
*/

-- Function to check if user can leave organization
CREATE OR REPLACE FUNCTION can_user_leave_organization(
  p_auth_user_id uuid,
  p_organization_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role user_role;
  v_admin_count integer;
BEGIN
  -- Get user's role in the organization
  SELECT role INTO v_user_role
  FROM users
  WHERE auth_user_id = p_auth_user_id
    AND organization_id = p_organization_id;

  IF v_user_role IS NULL THEN
    RETURN false; -- User is not a member
  END IF;

  -- If user is not an admin, they can always leave
  IF v_user_role != 'admin' THEN
    RETURN true;
  END IF;

  -- Count total admins in the organization
  SELECT COUNT(*) INTO v_admin_count
  FROM users
  WHERE organization_id = p_organization_id
    AND role = 'admin'
    AND is_active = true;

  -- Admin can leave only if there are other admins
  RETURN v_admin_count > 1;
END;
$$;

-- Function for user to leave organization
CREATE OR REPLACE FUNCTION leave_organization(
  p_auth_user_id uuid,
  p_organization_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_role user_role;
BEGIN
  -- Check if user can leave
  IF NOT can_user_leave_organization(p_auth_user_id, p_organization_id) THEN
    RAISE EXCEPTION 'Cannot leave organization. You may be the last administrator.';
  END IF;

  -- Get user details
  SELECT id, role INTO v_user_id, v_user_role
  FROM users
  WHERE auth_user_id = p_auth_user_id
    AND organization_id = p_organization_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member of this organization';
  END IF;

  -- Cancel any pending invitations sent by this user
  UPDATE organization_invitations
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE invited_by = v_user_id
    AND status = 'pending';

  -- Delete user's settings for this organization
  DELETE FROM user_settings
  WHERE user_id = v_user_id;

  -- Remove user from organization
  DELETE FROM users
  WHERE id = v_user_id;

  RETURN true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION can_user_leave_organization TO authenticated;
GRANT EXECUTE ON FUNCTION leave_organization TO authenticated;