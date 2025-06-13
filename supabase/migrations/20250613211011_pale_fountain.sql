/*
  # Initial Database Schema

  1. New Tables
    - `organizations` - Company/organization data
    - `users` - User profiles linked to auth.users
    - `customers` - Customer information
    - `projects` - Project management
    - `calculators` - Calculation data
    - `user_settings` - User preferences and settings

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control
    - Users can only access data from their organization

  3. Features
    - Automatic timestamp updates
    - Proper foreign key relationships
    - JSONB storage for flexible data
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo text,
  address text,
  phone text,
  email text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role user_role DEFAULT 'user',
  is_active boolean DEFAULT true,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status project_status DEFAULT 'planning',
  start_date date NOT NULL,
  end_date date,
  budget numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calculators table
CREATE TABLE IF NOT EXISTS calculators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  entries jsonb DEFAULT '[]',
  summary jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_info jsonb DEFAULT '{}',
  calculation_settings jsonb DEFAULT '{"defaultPaslag": 20, "defaultKostpris": 700, "defaultTimepris": 995}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_calculators_updated_at ON calculators;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calculators_updated_at BEFORE UPDATE ON calculators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read organization users" ON users;
DROP POLICY IF EXISTS "Admins and managers can manage organization users" ON users;
DROP POLICY IF EXISTS "Users can access organization customers" ON customers;
DROP POLICY IF EXISTS "Users can access organization projects" ON projects;
DROP POLICY IF EXISTS "Users can access organization calculators" ON calculators;
DROP POLICY IF EXISTS "Users can access their own settings" ON user_settings;

-- Organizations policies (allow all for now, can be restricted later)
CREATE POLICY "Users can manage organizations" ON organizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Users policies
CREATE POLICY "Users can read organization users" ON users
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins and managers can manage organization users" ON users
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  ));

-- Customers policies
CREATE POLICY "Users can access organization customers" ON customers
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Projects policies
CREATE POLICY "Users can access organization projects" ON projects
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Calculators policies
CREATE POLICY "Users can access organization calculators" ON calculators
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ));

-- User settings policies
CREATE POLICY "Users can access their own settings" ON user_settings
  FOR ALL TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));