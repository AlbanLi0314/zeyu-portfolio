// src/session.js
export async function hashKey(ip, ua) {
  const data = new TextEncoder().encode((ip || '') + (ua || ''));
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function detectSession(kv, ip, ua) {
  const key = await hashKey(ip, ua);
  const existing = await kv.get(key);
  if (existing) {
    return { session_id: existing, is_new_session: 0 };
  }
  const session_id = crypto.randomUUID();
  await kv.put(key, session_id, { expirationTtl: 7200 });
  return { session_id, is_new_session: 1 };
}
