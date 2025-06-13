/*
  # Create user settings table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `company_info` (jsonb, company information)
      - `calculation_settings` (jsonb, default calculation settings)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for user-specific access
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_info jsonb DEFAULT '{}'::jsonb,
  calculation_settings jsonb DEFAULT '{"defaultKostpris": 700, "defaultTimepris": 995, "defaultPaslag": 20}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own settings
CREATE POLICY "Users can access their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();