import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) throw new Error('POSTGRES_URL is required for migrations.');
const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 10 });
try {
  await sql.begin(async tx => {
    await tx`SELECT pg_advisory_xact_lock(724006091)`;
    await tx`CREATE SCHEMA IF NOT EXISTS mora`;
    await tx`SET LOCAL search_path TO mora,public`;
    await tx`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL)`;
    for (const name of (await readdir('db/postgres')).filter(n => n.endsWith('.sql')).sort()) {
      const source = await readFile(`db/postgres/${name}`, 'utf8');
      const checksum = createHash('sha256').update(source).digest('hex');
      const [applied] = await tx`SELECT checksum FROM schema_migrations WHERE name=${name}`;
      if (applied && applied.checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
      if (applied) continue;
      await tx.unsafe(source);
      await tx`INSERT INTO schema_migrations(name,checksum) VALUES(${name},${checksum})`;
      console.log(`Applied ${name}`);
    }
  });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !endpoint) throw new Error('Private file storage must be configured.');
  const storage = createClient(endpoint, key, { auth: { persistSession: false } }).storage;
  const { data, error } = await storage.getBucket('mora-files');
  if (!data) {
    const result = await storage.createBucket('mora-files', { public: false, fileSizeLimit: 5242880, allowedMimeTypes: ['application/octet-stream'] });
    if (result.error) throw result.error;
  } else if (data.public || Number(data.file_size_limit) !== 5242880) {
    throw new Error('mora-files must be private with a 5 MB file size limit.');
  }
  if (error && data) throw error;
} finally { await sql.end(); }
