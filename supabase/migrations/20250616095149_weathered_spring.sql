/*
  # Fix Organization Creation RLS Policy

  1. Security Changes
    - Update the INSERT policy on organizations table to allow authenticated users to create organizations
    - This fixes the chicken-and-egg problem where users can't create their first organization
    
  2. Policy Changes
    - Replace the existing INSERT policy with one that allows any authenticated user to create organizations
    - Keep other policies (SELECT, UPDATE, DELETE) unchanged as they work correctly
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Create a new INSERT policy that allows any authenticated user to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);