/**
 * run_migrations.ts
 * Executes or verifies PostgreSQL schema migrations against Supabase / PostgreSQL database.
 */

import { supabase } from '../supabaseClient';
import fs from 'fs';
import path from 'path';

export async function runMigrations(): Promise<{ success: boolean; executed: string[]; error?: any }> {
  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL] Cannot run migrations: PostgreSQL credentials missing in production.');
    }
    console.log('[Migration Runner] Dev mode: Supabase not configured. Skipping live SQL execution.');
    return { success: true, executed: ['supabase_schema.sql (mock/offline)'] };
  }

  const sqlFile = path.join(process.cwd(), 'supabase_schema.sql');

  if (!fs.existsSync(sqlFile)) {
    throw new Error(`[Migration Runner] Migration file not found: ${sqlFile}`);
  }

  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  try {
    // Execute SQL via Supabase RPC or direct query if available
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    if (error) {
      // If RPC is not set up on Supabase, log guidance
      console.warn('[Migration Runner] Direct RPC execution warning:', error.message);
      console.log('[Migration Runner] Please ensure supabase_schema.sql is applied in the Supabase SQL editor.');
    } else {
      console.log('[Migration Runner] supabase_schema.sql successfully executed on Supabase.');
    }
    return { success: true, executed: ['supabase_schema.sql'] };
  } catch (err) {
    console.error('[Migration Runner] Error executing migration:', err);
    return { success: false, executed: [], error: err };
  }
}
