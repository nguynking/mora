import 'server-only';
import postgres from 'postgres';
import { Database, postgresStatement, type Executor } from './database-adapter';

let database: Database | undefined;
export function getDatabase() {
  if (database) return database;
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Database is not configured.');
  const sql = postgres(url, {
    prepare: false, max: 3, idle_timeout: 20, connect_timeout: 10,
    // The existing API uses millisecond timestamps as JSON numbers.
    types: { timestampInteger: { to: 20, from: [20], serialize: String, parse: Number } },
  });
  const execute: Executor = async (query, values) => {
    const rows = await sql.unsafe(query, values as postgres.ParameterOrJSON<never>[]);
    return { rows: [...rows], count: rows.count };
  };
  database = new Database(execute, statements => sql.begin(async transaction => {
    const results = [];
    for (const statement of statements) {
      const rows = await transaction.unsafe(postgresStatement(statement.sql), statement.values as postgres.ParameterOrJSON<never>[]);
      results.push({ meta: { changes: rows.count } });
    }
    return results;
  }));
  return database;
}
