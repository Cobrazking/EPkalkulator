/*
  # Fix Organization INSERT Policy

  1. Security Changes
    - Update the INSERT policy for organizations table to allow authenticated users to create organizations
    - The current policy requires uid() IS NOT NULL but doesn't properly handle organization creation
    - New policy allows any authenticated user to create an organization

  2. Changes Made
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows authenticated users to create organizations
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a new INSERT policy that allows authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);