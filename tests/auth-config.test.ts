import { it, expect, vi, afterEach } from 'vitest';
vi.mock('server-only', () => ({}));
import { allowedEmail } from '../lib/supabase';
afterEach(() => vi.unstubAllEnvs());
it('keeps workspace access closed unless an exact email is invited', () => {
  vi.stubEnv('MORA_ALLOWED_EMAILS', '');
  expect(allowedEmail('king@example.test')).toBe(false);
  vi.stubEnv('MORA_ALLOWED_EMAILS', ' King@example.test , coworker@example.test ');
  expect(allowedEmail('king@example.test')).toBe(true);
  expect(allowedEmail('coworker@example.test')).toBe(true);
  expect(allowedEmail('king@example.test.attacker.test')).toBe(false);
  expect(allowedEmail('someone@example.test')).toBe(false);
  vi.stubEnv('MORA_ALLOWED_EMAILS', '*');
  expect(allowedEmail('anyone@example.test')).toBe(false);
});
