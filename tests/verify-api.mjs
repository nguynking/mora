// Compatibility entry point for the PostgreSQL integration suite.
import { spawnSync } from 'node:child_process';
const result = spawnSync('pnpm', ['exec', 'vitest', 'run', 'tests/api.test.mjs'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
