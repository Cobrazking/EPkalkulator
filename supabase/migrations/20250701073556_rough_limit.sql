/*
  # Make settings user-specific instead of organization-wide

  1. Changes
    - Update user_settings table to ensure it's properly linked to users
    - Add unique constraint on user_id to ensure one settings record per user
    - Ensure RLS policies are correct for user-specific access

  2. Security
    - Users can only access their own settings
    - Settings are tied to specific users, not shared across organization
*/

-- Ensure user_settings table has the correct structure
DO $$ 
BEGIN
  -- Check if the user_settings table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_settings') THEN
    -- Table exists, make sure it has the right structure
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'user_settings_user_id_key' 
      AND conrelid = 'user_settings'::regclass
    ) THEN
      ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
    END IF;
  ELSE
    -- Create the table if it doesn't exist
    CREATE TABLE user_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_info jsonb DEFAULT '{}',
      calculation_settings jsonb DEFAULT '{"defaultPaslag": 20, "defaultKostpris": 700, "defaultTimepris": 995}',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(user_id)
    );

    -- Create trigger for updated_at
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON user_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can access their own settings" ON user_settings;

-- Create policy for user-specific settings access
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

-- Create helper function to get current user's settings ID
CREATE OR REPLACE FUNCTION get_current_user_settings_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT us.id
  FROM user_settings us
  JOIN users u ON us.user_id = u.id
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_user_settings_id TO authenticated;