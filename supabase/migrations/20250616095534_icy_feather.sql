/*
  # Fix Organizations INSERT Policy

  1. Security Policy Update
    - Drop the existing INSERT policy that uses incorrect uid() function
    - Create new INSERT policy using proper auth.uid() function
    - Ensure authenticated users can create organizations

  This fixes the RLS violation error when creating new organizations.
*/

-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a new INSERT policy with the correct auth function
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);