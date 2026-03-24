// test/session.test.js
import { describe, it, expect } from 'vitest';
import { detectSession, hashKey } from '../src/session.js';

describe('detectSession', () => {
  function mockKV(store = {}) {
    return {
      get: async (key) => store[key] ?? null,
      put: async (key, value, opts) => { store[key] = value; },
    };
  }

  it('creates new session when KV miss', async () => {
    const kv = mockKV();
    const result = await detectSession(kv, '1.2.3.4', 'Mozilla/5.0');
    expect(result.is_new_session).toBe(1);
    expect(result.session_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('reuses existing session from KV', async () => {
    const existingId = 'abc-123';
    const kv = mockKV();
    const key = await hashKey('1.2.3.4', 'Mozilla/5.0');
    await kv.put(key, existingId);

    const result = await detectSession(kv, '1.2.3.4', 'Mozilla/5.0');
    expect(result.is_new_session).toBe(0);
    expect(result.session_id).toBe(existingId);
  });
});
