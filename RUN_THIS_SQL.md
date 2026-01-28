# Database Migration Required

For å få prosjekteier-funksjonaliteten til å fungere, må du kjøre denne SQL-en i Supabase Dashboard.

## Steg 1: Åpne Supabase SQL Editor

1. Gå til: https://supabase.com/dashboard/project/dpqrzlxsfurcjrkuhcjo
2. Klikk på "SQL Editor" i venstre sidebar
3. Klikk "New Query"
4. Lim inn SQL-en nedenfor
5. Klikk "Run" (eller trykk Ctrl+Enter)

## Steg 2: Kjør denne SQL-en

```sql
-- Add created_by column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE projects ADD COLUMN created_by uuid REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to projects table';
  ELSE
    RAISE NOTICE 'created_by column already exists in projects table';
  END IF;
END $$;

-- Add created_by column to calculators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calculators' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE calculators ADD COLUMN created_by uuid REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to calculators table';
  ELSE
    RAISE NOTICE 'created_by column already exists in calculators table';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_calculators_created_by ON calculators(created_by);
```

## Steg 3: Refresh applikasjonen

Etter at SQL-en er kjørt, refresh nettsiden og prosjekteier-dropdown skal fungere!

## Feilsøking

Hvis du får en feil om at `users` tabellen ikke eksisterer, kan det være fordi kolonnen skal referere til en annen tabell. I så fall, kjør denne SQL-en i stedet:

```sql
-- Alternative: No foreign key constraint
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_calculators_created_by ON calculators(created_by);
```
