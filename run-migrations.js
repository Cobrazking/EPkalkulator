import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('SUPABASE_URL:', SUPABASE_URL);
  console.error('Has key:', !!SUPABASE_SERVICE_KEY);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration(filename, sql) {
  console.log(`\n🔄 Running migration: ${filename}`);

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error(`❌ Error in ${filename}:`, error);
      return false;
    }

    console.log(`✅ Successfully ran ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${filename}:`, err);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting migration runner...');

  const migrationsDir = join(__dirname, 'supabase', 'migrations');

  try {
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files`);

    // Focus on the created_by migration
    const targetFile = files.find(f => f.includes('add_created_by_columns'));

    if (!targetFile) {
      console.error('❌ Could not find add_created_by_columns migration');
      process.exit(1);
    }

    const filePath = join(migrationsDir, targetFile);
    const sql = readFileSync(filePath, 'utf8');

    // Try to run it directly using supabase client
    console.log(`\n📝 Executing SQL directly...`);

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('/*') && !s.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_string: statement + ';' });
        if (error) {
          console.log('⚠️  RPC error (trying alternative):', error.message);
          // Try alternative: use the PostgreSQL REST API directly
          // This won't work with DDL, so we'll provide manual instructions
        }
      } catch (err) {
        console.log('⚠️  Exception (trying alternative):', err.message);
      }
    }

  } catch (err) {
    console.error('❌ Failed to read migrations:', err);
  }

  console.log('\n📌 Manual steps required:');
  console.log('Since automated migrations are restricted, please run this SQL manually:');
  console.log('\n1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dpqrzlxsfurcjrkuhcjo');
  console.log('2. Click on "SQL Editor" in the left sidebar');
  console.log('3. Click "New Query"');
  console.log('4. Paste and run this SQL:\n');

  const migrationsDir2 = join(__dirname, 'supabase', 'migrations');
  const targetFile2 = readdirSync(migrationsDir2)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .find(f => f.includes('add_created_by_columns'));

  if (targetFile2) {
    const sql = readFileSync(join(migrationsDir2, targetFile2), 'utf8');
    console.log('--- SQL START ---');
    console.log(sql);
    console.log('--- SQL END ---\n');
  }
}

main().catch(console.error);
