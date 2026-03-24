export function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)_a_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function verifyAuth(kv, token) {
  if (!token) return false;
  const val = await kv.get(`auth:${token}`);
  return val !== null;
}

export async function createAuthToken(kv) {
  const token = crypto.randomUUID();
  await kv.put(`auth:${token}`, '1', { expirationTtl: 86400 });
  return token;
}

export function loginHTML() {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analytics Login</title>
<style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}
form{background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
input{display:block;margin:.5rem 0;padding:.5rem;border:1px solid #ddd;border-radius:4px;width:200px}
button{padding:.5rem 1rem;background:#115e59;color:#fff;border:none;border-radius:4px;cursor:pointer}
.error{color:red;font-size:.9rem}</style></head>
<body><form method="POST">
<h2>Analytics</h2>
<input type="password" name="password" placeholder="Password" required>
<button type="submit">Login</button>
</form></body></html>`;
}

export function loginErrorHTML() {
  return loginHTML().replace('</form>', '<p class="error">Wrong password</p></form>');
}
