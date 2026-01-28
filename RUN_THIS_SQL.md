# ⚠️ VIKTIG: Kjør denne SQL-en for å aktivere prosjekteier-funksjonalitet

Koden er nå oppdatert og klar, men kolonnen `created_by` mangler fortsatt i databasen.

## 📋 Instruksjoner

### Steg 1: Åpne Supabase SQL Editor
Gå til: **https://supabase.com/dashboard/project/dpqrzlxsfurcjrkuhcjo/sql/new**

### Steg 2: Kopier og lim inn denne SQL-en

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

### Steg 3: Kjør SQL-en
Klikk på **"Run"** knappen (eller trykk `Ctrl+Enter`)

### Steg 4: Refresh applikasjonen
Gå tilbake til applikasjonen og refresh siden. Prosjekteier-feltet skal nå fungere!

---

## 🔧 Feilsøking

Hvis du får feil, prøv denne alternative SQL-en (uten foreign key constraint):

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE calculators ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_calculators_created_by ON calculators(created_by);
```
