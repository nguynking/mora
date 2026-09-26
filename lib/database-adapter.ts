export type QueryResult = { rows: Record<string, unknown>[]; count: number };
export type Executor = (sql: string, values: unknown[]) => Promise<QueryResult>;

// Only application-owned SQL enters this adapter. Values remain protocol parameters.
export function postgresStatement(statement: string) {
  let index = 0;
  let sql = statement.replace(/'(?:''|[^'])*'|\?/g, token => token === '?' ? `$${++index}` : token);
  if (/^INSERT OR IGNORE /i.test(sql)) sql = sql.replace(/^INSERT OR IGNORE /i, 'INSERT ') + ' ON CONFLICT DO NOTHING';
  // Explicit schema names also work with transaction poolers that reject startup search_path.
  return sql.replace(/'(?:''|[^'])*'|\b(FROM|JOIN|INTO|UPDATE)\s+(members|rooms|contexts|messages|tasks|reactions|files|bots|room_members|bot_replies|uploads)\b/gi,
    (token, keyword, table) => keyword ? `${keyword} mora.${table}` : token);
}

export class Statement {
  constructor(readonly sql: string, readonly execute: Executor, readonly values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Statement(this.sql, this.execute, values); }
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const result = await this.execute(postgresStatement(this.sql), this.values);
    return (result.rows[0] as T) ?? null;
  }
  async all<T = Record<string, unknown>>() {
    const result = await this.execute(postgresStatement(this.sql), this.values);
    return { results: result.rows as T[] };
  }
  async run() {
    const result = await this.execute(postgresStatement(this.sql), this.values);
    return { meta: { changes: result.count } };
  }
}

export class Database {
  constructor(private execute: Executor, private transaction: (statements: Statement[]) => Promise<unknown>) {}
  prepare(sql: string) { return new Statement(sql, this.execute); }
  batch(statements: Statement[]) { return this.transaction(statements); }
}
