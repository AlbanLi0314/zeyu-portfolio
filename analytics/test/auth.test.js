import { describe, it, expect } from 'vitest';
import { verifyAuth, createAuthToken, getTokenFromCookie } from '../src/auth.js';

describe('auth', () => {
  function mockKV(store = {}) {
    return {
      get: async (key) => store[key] ?? null,
      put: async (key, value, opts) => { store[key] = value; },
    };
  }

  it('getTokenFromCookie extracts _a_token', () => {
    expect(getTokenFromCookie('_a_token=abc123; other=val')).toBe('abc123');
  });

  it('getTokenFromCookie returns null when missing', () => {
    expect(getTokenFromCookie('other=val')).toBeNull();
    expect(getTokenFromCookie(null)).toBeNull();
  });

  it('verifyAuth returns true for valid token', async () => {
    const kv = mockKV({ 'auth:abc123': '1' });
    expect(await verifyAuth(kv, 'abc123')).toBe(true);
  });

  it('verifyAuth returns false for invalid token', async () => {
    const kv = mockKV();
    expect(await verifyAuth(kv, 'bad')).toBe(false);
    expect(await verifyAuth(kv, null)).toBe(false);
  });

  it('createAuthToken stores token in KV and returns it', async () => {
    const store = {};
    const kv = mockKV(store);
    const token = await createAuthToken(kv);
    expect(token).toMatch(/^[0-9a-f-]{36}$/);
    expect(store[`auth:${token}`]).toBe('1');
  });
});
