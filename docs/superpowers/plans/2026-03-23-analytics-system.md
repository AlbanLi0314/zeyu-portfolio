# Analytics System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a server-side analytics system for zeyuli.net using Cloudflare Workers as a reverse proxy to GitHub Pages, with D1 for storage, KV for sessions, and an inline dashboard.

**Architecture:** Cloudflare Worker intercepts all requests to zeyuli.net, records events to D1 via `ctx.waitUntil()`, proxies to GitHub Pages origin. A daily Cron Job aggregates raw events into summary tables. Dashboard served inline from the Worker.

**Tech Stack:** Cloudflare Workers (ES modules), D1 (SQLite), KV, Wrangler CLI, Chart.js (CDN), Astro 5

**Spec:** `docs/superpowers/specs/2026-03-23-analytics-system-design.md`

---

## File Structure

```
analytics/                         # New directory — Worker project (separate from Astro)
├── wrangler.toml                  # Bindings, routes, cron triggers
├── package.json                   # wrangler dev dependency
├── schema.sql                     # All CREATE TABLE + seed data
├── src/
│   ├── index.js                   # Worker entry: fetch + scheduled handlers
│   ├── visitor.js                 # Extract visitor info from request
│   ├── session.js                 # KV session detection
│   ├── events.js                  # D1 event write helper
│   ├── proxy.js                   # Proxy to GitHub Pages origin
│   ├── redirect.js                # /go click redirect with URL validation
│   ├── auth.js                    # Dashboard password auth (KV tokens)
│   ├── stats.js                   # /_a/stats API — query agg_* tables
│   ├── cron.js                    # Scheduled handler — 7 aggregation steps
│   └── dashboard.js               # Return dashboard HTML string
└── test/
    ├── visitor.test.js            # Unit tests for visitor extraction
    ├── session.test.js            # Unit tests for session logic
    ├── redirect.test.js           # URL validation tests
    ├── auth.test.js               # Auth flow tests
    ├── cron.test.js               # Aggregation logic tests
    └── integration.test.js        # Full request flow tests

src/                               # Existing Astro project (modify only)
├── pages/publications.astro       # Rewrite paper/patent links
├── pages/research.astro           # Rewrite Cell Press + PolyTile PDF links
├── pages/cv.astro                 # Rewrite all download links
├── components/ai/ProductsSection.astro  # Rewrite GitHub/demo/YouTube links
└── components/ui/Footer.astro     # Add privacy notice
```

---

### Task 1: Scaffold Worker Project

**Files:**
- Create: `analytics/package.json`
- Create: `analytics/wrangler.toml`
- Create: `analytics/schema.sql`

- [ ] **Step 1: Create analytics directory and package.json**

```json
{
  "name": "zeyuli-analytics",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "db:init": "wrangler d1 execute ANALYTICS_DB --local --file=schema.sql"
  },
  "devDependencies": {
    "wrangler": "^4",
    "vitest": "^3",
    "@cloudflare/vitest-pool-workers": "^0.8"
  }
}
```

- [ ] **Step 2: Create wrangler.toml**

```toml
name = "zeyuli-analytics"
main = "src/index.js"
compatibility_date = "2024-12-01"

routes = [{ pattern = "zeyuli.net/*", zone_name = "zeyuli.net" }]

[[kv_namespaces]]
binding = "KV"
id = "<fill-after-creating>"

[[d1_databases]]
binding = "DB"
database_name = "ANALYTICS_DB"
database_id = "<fill-after-creating>"

[triggers]
crons = ["5 0 * * *"]
```

- [ ] **Step 3: Create schema.sql with all tables and seed data**

Combine all CREATE TABLE statements from the spec (events + 7 agg tables + url_labels + indexes), plus the INSERT INTO url_labels seed data. Single file, idempotent with `CREATE TABLE IF NOT EXISTS`.

- [ ] **Step 4: Create vitest config**

Create `analytics/vitest.config.js`:
```js
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          kvNamespaces: ['KV'],
          d1Databases: ['DB'],
        },
      },
    },
  },
});
```

- [ ] **Step 5: Install dependencies**

Run: `cd analytics && npm install`

- [ ] **Step 6: Commit**

```bash
git add analytics/
git commit -m "feat(analytics): scaffold Worker project with wrangler, vitest, schema"
```

---

### Task 2: Visitor Info Extraction

**Files:**
- Create: `analytics/src/visitor.js`
- Create: `analytics/test/visitor.test.js`

- [ ] **Step 1: Write test for visitor extraction**

```js
// test/visitor.test.js
import { describe, it, expect } from 'vitest';
import { extractVisitor } from '../src/visitor.js';

describe('extractVisitor', () => {
  it('extracts all fields from request', () => {
    const request = new Request('https://zeyuli.net/research/?q=test', {
      method: 'GET',
      headers: {
        'Referer': 'https://google.com/search',
        'CF-Connecting-IP': '1.2.3.4',
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'zh-CN,en;q=0.9',
        'DNT': '1',
      },
    });
    // Simulate request.cf
    request.cf = {
      asn: 1234, asOrganization: 'Cornell University',
      country: 'US', region: 'New York', regionCode: 'NY',
      city: 'Ithaca', postalCode: '14850',
      latitude: '42.44', longitude: '-76.50',
      timezone: 'America/New_York', isEUCountry: '0',
      colo: 'EWR', httpProtocol: 'HTTP/2', tlsVersion: 'TLSv1.3',
      clientTrustScore: 90,
    };

    const v = extractVisitor(request);
    expect(v.path).toBe('/research/');
    expect(v.query).toBe('q=test');
    expect(v.method).toBe('GET');
    expect(v.referrer).toBe('https://google.com/search');
    expect(v.ip).toBe('1.2.3.4');
    expect(v.org).toBe('Cornell University');
    expect(v.country).toBe('US');
    expect(v.region).toBe('New York');
    expect(v.accept_lang).toBe('zh-CN,en;q=0.9');
    expect(v.dnt).toBe(1);
    expect(v.trust_score).toBe(90);
    expect(v.ts).toBeTypeOf('number');
  });

  it('handles missing cf and headers gracefully', () => {
    const request = new Request('https://zeyuli.net/');
    request.cf = {};
    const v = extractVisitor(request);
    expect(v.path).toBe('/');
    expect(v.ip).toBeNull();
    expect(v.trust_score).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd analytics && npx vitest run test/visitor.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement visitor.js**

```js
// src/visitor.js
export function extractVisitor(request) {
  const url = new URL(request.url);
  const cf = request.cf || {};
  return {
    ts: Math.floor(Date.now() / 1000),
    path: url.pathname,
    query: url.search ? url.search.slice(1) : null,
    method: request.method,
    referrer: request.headers.get('Referer') || null,
    ip: request.headers.get('CF-Connecting-IP') || null,
    asn: cf.asn ?? null,
    org: cf.asOrganization ?? null,
    country: cf.country ?? null,
    region: cf.region ?? null,
    region_code: cf.regionCode ?? null,
    city: cf.city ?? null,
    postal_code: cf.postalCode ?? null,
    latitude: cf.latitude ?? null,
    longitude: cf.longitude ?? null,
    timezone: cf.timezone ?? null,
    is_eu: cf.isEUCountry === '1' ? 1 : 0,
    colo: cf.colo ?? null,
    http_protocol: cf.httpProtocol ?? null,
    tls_version: cf.tlsVersion ?? null,
    user_agent: request.headers.get('User-Agent') || null,
    accept_lang: request.headers.get('Accept-Language') || null,
    trust_score: cf.clientTrustScore ?? null,
    dnt: request.headers.get('DNT') ? parseInt(request.headers.get('DNT')) : null,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd analytics && npx vitest run test/visitor.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add analytics/src/visitor.js analytics/test/visitor.test.js
git commit -m "feat(analytics): add visitor info extraction from request.cf + headers"
```

---

### Task 3: Session Detection

**Files:**
- Create: `analytics/src/session.js`
- Create: `analytics/test/session.test.js`

- [ ] **Step 1: Write test for session logic**

```js
// test/session.test.js
import { describe, it, expect } from 'vitest';
import { detectSession } from '../src/session.js';

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
    // Pre-populate with known hash
    const { hashKey } = await import('../src/session.js');
    const key = await hashKey('1.2.3.4', 'Mozilla/5.0');
    kv.put(key, existingId);

    const result = await detectSession(kv, '1.2.3.4', 'Mozilla/5.0');
    expect(result.is_new_session).toBe(0);
    expect(result.session_id).toBe(existingId);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd analytics && npx vitest run test/session.test.js`

- [ ] **Step 3: Implement session.js**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd analytics && npx vitest run test/session.test.js`

- [ ] **Step 5: Commit**

```bash
git add analytics/src/session.js analytics/test/session.test.js
git commit -m "feat(analytics): add KV-based session detection with SHA-256 hashing"
```

---

### Task 4: Event Writing

**Files:**
- Create: `analytics/src/events.js`

- [ ] **Step 1: Implement D1 event write helper**

```js
// src/events.js
export async function writeEvent(db, eventType, visitor, sessionId, isNewSession, targetUrl) {
  await db.prepare(`
    INSERT INTO events (
      ts, path, query, method, event_type, target_url,
      referrer, ip, asn, org,
      country, region, region_code, city, postal_code,
      latitude, longitude, timezone, is_eu, colo,
      user_agent, accept_lang, http_protocol, tls_version,
      trust_score, dnt, session_id, is_new_session
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `).bind(
    visitor.ts, visitor.path, visitor.query, visitor.method, eventType, targetUrl,
    visitor.referrer, visitor.ip, visitor.asn, visitor.org,
    visitor.country, visitor.region, visitor.region_code, visitor.city, visitor.postal_code,
    visitor.latitude, visitor.longitude, visitor.timezone, visitor.is_eu, visitor.colo,
    visitor.user_agent, visitor.accept_lang, visitor.http_protocol, visitor.tls_version,
    visitor.trust_score, visitor.dnt, sessionId, isNewSession
  ).run();
}
```

- [ ] **Step 2: Commit**

```bash
git add analytics/src/events.js
git commit -m "feat(analytics): add D1 event write helper"
```

---

### Task 5: Proxy and Click Redirect

**Files:**
- Create: `analytics/src/proxy.js`
- Create: `analytics/src/redirect.js`
- Create: `analytics/test/redirect.test.js`

- [ ] **Step 1: Write test for URL validation in redirect**

```js
// test/redirect.test.js
import { describe, it, expect } from 'vitest';
import { validateRedirectUrl } from '../src/redirect.js';

describe('validateRedirectUrl', () => {
  it('accepts https URLs', () => {
    expect(validateRedirectUrl('https://arxiv.org/abs/123')).toBe(true);
  });
  it('accepts http URLs', () => {
    expect(validateRedirectUrl('http://example.com')).toBe(true);
  });
  it('accepts relative URLs starting with /', () => {
    expect(validateRedirectUrl('/cv/resume.pdf')).toBe(true);
  });
  it('rejects javascript: scheme', () => {
    expect(validateRedirectUrl('javascript:alert(1)')).toBe(false);
  });
  it('rejects data: scheme', () => {
    expect(validateRedirectUrl('data:text/html,<h1>hi</h1>')).toBe(false);
  });
  it('rejects protocol-relative URLs', () => {
    expect(validateRedirectUrl('//evil.com')).toBe(false);
  });
  it('rejects empty string', () => {
    expect(validateRedirectUrl('')).toBe(false);
  });
  it('rejects null/undefined', () => {
    expect(validateRedirectUrl(null)).toBe(false);
    expect(validateRedirectUrl(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd analytics && npx vitest run test/redirect.test.js`

- [ ] **Step 3: Implement redirect.js and proxy.js**

```js
// src/redirect.js
export function validateRedirectUrl(url) {
  if (!url) return false;
  if (url.startsWith('https://') || url.startsWith('http://')) return true;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  return false;
}

export function handleRedirect(request, ctx, visitor, session, writeEventFn, db) {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  if (!validateRedirectUrl(target)) {
    return new Response('Bad Request: invalid redirect URL', { status: 400 });
  }
  ctx.waitUntil(writeEventFn(db, 'click', visitor, session.session_id, session.is_new_session, target));
  return Response.redirect(target, 302);
}
```

```js
// src/proxy.js
const ORIGIN = 'https://albanli0314.github.io';

export async function proxyToOrigin(request, ctx, visitor, session, writeEventFn, db) {
  ctx.waitUntil(writeEventFn(db, 'pageview', visitor, session.session_id, session.is_new_session, null));

  const url = new URL(request.url);
  const originUrl = ORIGIN + url.pathname + url.search;

  const response = await fetch(originUrl, {
    method: request.method,
    headers: request.headers,
  });

  // Return response with original headers, removing any CORS restrictions from origin
  const newResponse = new Response(response.body, response);
  return newResponse;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd analytics && npx vitest run test/redirect.test.js`

- [ ] **Step 5: Commit**

```bash
git add analytics/src/redirect.js analytics/src/proxy.js analytics/test/redirect.test.js
git commit -m "feat(analytics): add proxy to GitHub Pages and /go click redirect with URL validation"
```

---

### Task 6: Dashboard Auth

**Files:**
- Create: `analytics/src/auth.js`
- Create: `analytics/test/auth.test.js`

- [ ] **Step 1: Write test for auth logic**

```js
// test/auth.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd analytics && npx vitest run test/auth.test.js`

- [ ] **Step 3: Implement auth.js**

```js
// src/auth.js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd analytics && npx vitest run test/auth.test.js`

- [ ] **Step 5: Commit**

```bash
git add analytics/src/auth.js analytics/test/auth.test.js
git commit -m "feat(analytics): add dashboard auth with KV session tokens"
```

---

### Task 7: Stats API

**Files:**
- Create: `analytics/src/stats.js`

- [ ] **Step 1: Implement stats API handler**

```js
// src/stats.js
export async function handleStats(request, db) {
  const url = new URL(request.url);
  const metric = url.searchParams.get('metric');
  const range = parseInt(url.searchParams.get('range') || '30');

  const dateFrom = range > 0
    ? new Date(Date.now() - range * 86400000).toISOString().slice(0, 10)
    : '2000-01-01';

  const queries = {
    daily: () => db.prepare(
      'SELECT date, SUM(pv) as pv, SUM(uv) as uv FROM agg_daily WHERE date >= ? GROUP BY date ORDER BY date'
    ).bind(dateFrom).all(),

    paths: () => db.prepare(
      'SELECT path, SUM(pv) as pv FROM agg_daily WHERE date >= ? GROUP BY path ORDER BY pv DESC LIMIT 20'
    ).bind(dateFrom).all(),

    referrer: () => db.prepare(
      'SELECT source, SUM(count) as count FROM agg_referrer WHERE date >= ? GROUP BY source ORDER BY count DESC'
    ).bind(dateFrom).all(),

    geo: () => db.prepare(
      'SELECT country, region, SUM(count) as count FROM agg_geo WHERE date >= ? GROUP BY country, region ORDER BY count DESC LIMIT 30'
    ).bind(dateFrom).all(),

    org: () => db.prepare(
      'SELECT org, SUM(count) as count FROM agg_org WHERE date >= ? GROUP BY org ORDER BY count DESC LIMIT 20'
    ).bind(dateFrom).all(),

    pages: () => db.prepare(
      'SELECT page, SUM(count) as count FROM agg_page_visits WHERE date >= ? GROUP BY page ORDER BY count DESC'
    ).bind(dateFrom).all(),

    clicks: () => db.prepare(`
      SELECT a.target_url, SUM(a.count) as count, u.label
      FROM agg_link_clicks a LEFT JOIN url_labels u ON a.target_url = u.target_url
      WHERE a.date >= ? GROUP BY a.target_url ORDER BY count DESC LIMIT 20
    `).bind(dateFrom).all(),

    lang: () => db.prepare(
      'SELECT lang, SUM(count) as count FROM agg_lang WHERE date >= ? GROUP BY lang ORDER BY count DESC LIMIT 15'
    ).bind(dateFrom).all(),

    // Cross-range UV from raw events
    uv_total: () => db.prepare(
      "SELECT COUNT(DISTINCT ip) as uv FROM events WHERE ts >= ? AND event_type = 'pageview' AND (trust_score IS NULL OR trust_score >= 50)"
    ).bind(Math.floor(new Date(dateFrom).getTime() / 1000)).all(),
  };

  if (metric && queries[metric]) {
    const result = await queries[metric]();
    return Response.json(result.results);
  }

  // Return all metrics (concurrent reads)
  const entries = Object.entries(queries);
  const results = await Promise.all(entries.map(([, fn]) => fn()));
  const all = {};
  entries.forEach(([key], i) => { all[key] = results[i].results; });
  return Response.json(all);
}
```

- [ ] **Step 2: Commit**

```bash
git add analytics/src/stats.js
git commit -m "feat(analytics): add stats API with all metric queries"
```

---

### Task 8: Cron Job Aggregation

**Files:**
- Create: `analytics/src/cron.js`
- Create: `analytics/test/cron.test.js`

- [ ] **Step 1: Write test for referrer bucketing**

```js
// test/cron.test.js
import { describe, it, expect } from 'vitest';
import { bucketReferrer, extractPrimaryLang, mapPathToPage } from '../src/cron.js';

describe('bucketReferrer', () => {
  it('empty referrer → direct', () => expect(bucketReferrer(null)).toBe('direct'));
  it('google.com → google', () => expect(bucketReferrer('https://www.google.com/search?q=test')).toBe('google'));
  it('scholar.google.com → google_scholar', () => expect(bucketReferrer('https://scholar.google.com/scholar?q=test')).toBe('google_scholar'));
  it('t.co → twitter', () => expect(bucketReferrer('https://t.co/abc')).toBe('twitter'));
  it('linkedin.com → linkedin', () => expect(bucketReferrer('https://www.linkedin.com/feed')).toBe('linkedin'));
  it('github.com → github', () => expect(bucketReferrer('https://github.com/user/repo')).toBe('github'));
  it('arxiv.org → arxiv', () => expect(bucketReferrer('https://arxiv.org/abs/2506.07972')).toBe('arxiv'));
  it('zeyuli.net → self (excluded)', () => expect(bucketReferrer('https://zeyuli.net/research/')).toBe('self'));
  it('unknown → other', () => expect(bucketReferrer('https://random-site.org')).toBe('other'));
});

describe('extractPrimaryLang', () => {
  it('extracts primary lang tag', () => expect(extractPrimaryLang('zh-CN,en;q=0.9')).toBe('zh-CN'));
  it('handles simple lang', () => expect(extractPrimaryLang('en-US')).toBe('en-US'));
  it('returns unknown for null', () => expect(extractPrimaryLang(null)).toBe('unknown'));
});

describe('mapPathToPage', () => {
  it('/ → home', () => expect(mapPathToPage('/')).toBe('home'));
  it('/research/ → research', () => expect(mapPathToPage('/research/')).toBe('research'));
  it('/publications/ → publications', () => expect(mapPathToPage('/publications/')).toBe('publications'));
  it('/cv/ → cv', () => expect(mapPathToPage('/cv/')).toBe('cv'));
  it('/cv/Resume.pdf → cv_download', () => expect(mapPathToPage('/cv/Resume.pdf')).toBe('cv_download'));
  it('/cv/Resume.docx → cv_download', () => expect(mapPathToPage('/cv/Resume.docx')).toBe('cv_download'));
  it('/blog/my-post → blog', () => expect(mapPathToPage('/blog/my-post')).toBe('blog'));
  it('/series/my-series → series', () => expect(mapPathToPage('/series/my-series')).toBe('series'));
  it('/random → other', () => expect(mapPathToPage('/random')).toBe('other'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd analytics && npx vitest run test/cron.test.js`

- [ ] **Step 3: Implement cron.js**

```js
// src/cron.js

export function bucketReferrer(referrer) {
  if (!referrer) return 'direct';
  let hostname;
  try { hostname = new URL(referrer).hostname; } catch { return 'other'; }

  if (hostname === 'zeyuli.net') return 'self';
  if (hostname === 'scholar.google.com') return 'google_scholar';
  if (hostname.endsWith('google.com')) return 'google';
  if (hostname.endsWith('twitter.com') || hostname === 't.co') return 'twitter';
  if (hostname.endsWith('linkedin.com')) return 'linkedin';
  if (hostname.endsWith('github.com')) return 'github';
  if (hostname.endsWith('arxiv.org')) return 'arxiv';
  return 'other';
}

export function extractPrimaryLang(acceptLang) {
  if (!acceptLang) return 'unknown';
  return acceptLang.split(',')[0].split(';')[0].trim();
}

export function mapPathToPage(path) {
  if (path === '/') return 'home';
  if (path === '/research/' || path === '/research') return 'research';
  if (path === '/publications/' || path === '/publications') return 'publications';
  if (path === '/teaching/' || path === '/teaching') return 'teaching';
  if (path === '/skills/' || path === '/skills') return 'skills';
  if (path === '/ai/' || path === '/ai') return 'ai';
  if (path === '/contact/' || path === '/contact') return 'contact';
  if (path === '/papers/' || path === '/papers') return 'papers';
  if (/^\/cv\/.*\.(pdf|docx)$/i.test(path)) return 'cv_download';
  if (path === '/cv/' || path === '/cv') return 'cv';
  if (path.startsWith('/blog/') || path === '/blog') return 'blog';
  if (path.startsWith('/series/') || path === '/series') return 'series';
  return 'other';
}

export async function runAggregation(db) {
  // Yesterday's date range in epoch seconds
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);
  const dayStart = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / 1000);
  const dayEnd = dayStart + 86400;

  const botFilter = 'AND (trust_score IS NULL OR trust_score >= 50)';

  // 1. agg_daily
  try {
    const rows = (await db.prepare(`
      SELECT path, COUNT(*) as pv, COUNT(DISTINCT ip) as uv
      FROM events WHERE ts >= ? AND ts < ? AND event_type = 'pageview' ${botFilter}
      GROUP BY path
    `).bind(dayStart, dayEnd).all()).results;
    for (const r of rows) {
      await db.prepare('INSERT OR REPLACE INTO agg_daily (date, path, pv, uv) VALUES (?, ?, ?, ?)')
        .bind(dateStr, r.path, r.pv, r.uv).run();
    }
  } catch (e) { console.error('agg_daily failed:', e); }

  // 2. agg_referrer
  try {
    const rows = (await db.prepare(`
      SELECT referrer, COUNT(*) as count FROM events
      WHERE ts >= ? AND ts < ? ${botFilter} GROUP BY referrer
    `).bind(dayStart, dayEnd).all()).results;
    const buckets = {};
    for (const r of rows) {
      const b = bucketReferrer(r.referrer);
      if (b === 'self') continue;
      buckets[b] = (buckets[b] || 0) + r.count;
    }
    for (const [source, count] of Object.entries(buckets)) {
      await db.prepare('INSERT OR REPLACE INTO agg_referrer (date, source, count) VALUES (?, ?, ?)')
        .bind(dateStr, source, count).run();
    }
  } catch (e) { console.error('agg_referrer failed:', e); }

  // 3. agg_geo
  try {
    const rows = (await db.prepare(`
      SELECT country, CASE WHEN country IN ('US','CN') THEN region ELSE '' END as region, COUNT(*) as count
      FROM events WHERE ts >= ? AND ts < ? ${botFilter}
      GROUP BY country, CASE WHEN country IN ('US','CN') THEN region ELSE '' END
    `).bind(dayStart, dayEnd).all()).results;
    for (const r of rows) {
      await db.prepare('INSERT OR REPLACE INTO agg_geo (date, country, region, count) VALUES (?, ?, ?, ?)')
        .bind(dateStr, r.country || 'unknown', r.region || '', r.count).run();
    }
  } catch (e) { console.error('agg_geo failed:', e); }

  // 4. agg_org
  try {
    const rows = (await db.prepare(`
      SELECT org, asn, COUNT(*) as count FROM events
      WHERE ts >= ? AND ts < ? AND org IS NOT NULL ${botFilter}
      GROUP BY org
    `).bind(dayStart, dayEnd).all()).results;
    for (const r of rows) {
      await db.prepare('INSERT OR REPLACE INTO agg_org (date, org, asn, count) VALUES (?, ?, ?, ?)')
        .bind(dateStr, r.org, r.asn, r.count).run();
    }
  } catch (e) { console.error('agg_org failed:', e); }

  // 5. agg_page_visits
  try {
    const rows = (await db.prepare(`
      SELECT path, COUNT(*) as count FROM events
      WHERE ts >= ? AND ts < ? AND event_type = 'pageview' ${botFilter}
      GROUP BY path
    `).bind(dayStart, dayEnd).all()).results;
    const pages = {};
    for (const r of rows) {
      const page = mapPathToPage(r.path);
      pages[page] = (pages[page] || 0) + r.count;
    }
    for (const [page, count] of Object.entries(pages)) {
      await db.prepare('INSERT OR REPLACE INTO agg_page_visits (date, page, count) VALUES (?, ?, ?)')
        .bind(dateStr, page, count).run();
    }
  } catch (e) { console.error('agg_page_visits failed:', e); }

  // 6. agg_link_clicks
  try {
    const rows = (await db.prepare(`
      SELECT target_url, COUNT(*) as count FROM events
      WHERE ts >= ? AND ts < ? AND event_type = 'click' ${botFilter}
      GROUP BY target_url
    `).bind(dayStart, dayEnd).all()).results;
    for (const r of rows) {
      await db.prepare('INSERT OR REPLACE INTO agg_link_clicks (date, target_url, count) VALUES (?, ?, ?)')
        .bind(dateStr, r.target_url, r.count).run();
    }
  } catch (e) { console.error('agg_link_clicks failed:', e); }

  // 7. agg_lang
  try {
    const rows = (await db.prepare(`
      SELECT accept_lang, COUNT(*) as count FROM events
      WHERE ts >= ? AND ts < ? ${botFilter}
      GROUP BY accept_lang
    `).bind(dayStart, dayEnd).all()).results;
    const langs = {};
    for (const r of rows) {
      const lang = extractPrimaryLang(r.accept_lang);
      langs[lang] = (langs[lang] || 0) + r.count;
    }
    for (const [lang, count] of Object.entries(langs)) {
      await db.prepare('INSERT OR REPLACE INTO agg_lang (date, lang, count) VALUES (?, ?, ?)')
        .bind(dateStr, lang, count).run();
    }
  } catch (e) { console.error('agg_lang failed:', e); }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd analytics && npx vitest run test/cron.test.js`

- [ ] **Step 5: Commit**

```bash
git add analytics/src/cron.js analytics/test/cron.test.js
git commit -m "feat(analytics): add cron aggregation with referrer bucketing, path mapping, lang extraction"
```

---

### Task 9: Dashboard HTML

**Files:**
- Create: `analytics/src/dashboard.js`

- [ ] **Step 1: Implement dashboard HTML generator**

This returns a self-contained HTML string with Chart.js (from CDN) that fetches `/_a/stats` and renders 8 chart blocks. The HTML includes:
- Time range selector (7/30/90/all)
- Line chart: daily PV trend
- Horizontal bar: top paths
- Pie chart: referrer sources
- Horizontal bar: geo distribution
- Horizontal bar: org ranking
- Horizontal bar: page visits
- Horizontal bar: link clicks (with labels)
- Pie chart: language preference

```js
// src/dashboard.js
export function dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analytics — zeyuli.net</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;padding:1rem}
h1{font-size:1.5rem;margin-bottom:1rem}
.controls{display:flex;gap:.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
.controls button{padding:.4rem .8rem;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer;font-size:.85rem}
.controls button.active{background:#115e59;color:#fff;border-color:#115e59}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1rem}
.card{background:#fff;border-radius:8px;padding:1rem;border:1px solid #e2e8f0}
.card h2{font-size:.95rem;margin-bottom:.75rem;color:#334155}
canvas{width:100%!important;max-height:300px}
.stat{font-size:2rem;font-weight:700;color:#115e59}
.stat-label{font-size:.85rem;color:#64748b}
.summary{display:flex;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
@media(max-width:500px){.grid{grid-template-columns:1fr}}
</style></head><body>
<h1>Analytics — zeyuli.net</h1>
<div class="controls">
  <button onclick="load(7)" id="b7">7 days</button>
  <button onclick="load(30)" id="b30" class="active">30 days</button>
  <button onclick="load(90)" id="b90">90 days</button>
  <button onclick="load(0)" id="b0">All time</button>
</div>
<div class="summary" id="summary"></div>
<div class="grid">
  <div class="card"><h2>Daily Visits</h2><canvas id="c-daily"></canvas></div>
  <div class="card"><h2>Top Paths</h2><canvas id="c-paths"></canvas></div>
  <div class="card"><h2>Referrer Sources</h2><canvas id="c-ref"></canvas></div>
  <div class="card"><h2>Geography</h2><canvas id="c-geo"></canvas></div>
  <div class="card"><h2>Organizations</h2><canvas id="c-org"></canvas></div>
  <div class="card"><h2>Page Visits</h2><canvas id="c-pages"></canvas></div>
  <div class="card"><h2>Link Clicks</h2><canvas id="c-clicks"></canvas></div>
  <div class="card"><h2>Language</h2><canvas id="c-lang"></canvas></div>
</div>
<script>
const charts={};const teal='#115e59';const colors=['#115e59','#0d9488','#14b8a6','#2dd4bf','#5eead4','#99f6e4','#134e4a','#042f2e'];
function destroy(){Object.values(charts).forEach(c=>c.destroy&&c.destroy())}
function bar(id,labels,data,horizontal=true){
  charts[id]=new Chart(document.getElementById(id),{type:'bar',
    data:{labels,datasets:[{data,backgroundColor:teal}]},
    options:{indexAxis:horizontal?'y':'x',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});
}
function pie(id,labels,data){
  charts[id]=new Chart(document.getElementById(id),{type:'doughnut',
    data:{labels,datasets:[{data,backgroundColor:colors}]},
    options:{plugins:{legend:{position:'right'}}}});
}
async function load(range){
  destroy();
  document.querySelectorAll('.controls button').forEach(b=>b.classList.remove('active'));
  document.getElementById('b'+range).classList.add('active');
  const d=await(await fetch('/_a/stats?range='+range)).json();
  // Summary
  const totalPV=d.daily.reduce((s,r)=>s+r.pv,0);
  const totalUV=d.uv_total?.[0]?.uv||0;
  document.getElementById('summary').innerHTML=
    '<div><div class="stat">'+totalPV+'</div><div class="stat-label">Page Views</div></div>'+
    '<div><div class="stat">'+totalUV+'</div><div class="stat-label">Unique Visitors</div></div>';
  // Daily line
  charts['c-daily']=new Chart(document.getElementById('c-daily'),{type:'line',
    data:{labels:d.daily.map(r=>r.date),datasets:[
      {label:'PV',data:d.daily.map(r=>r.pv),borderColor:teal,tension:.3},
      {label:'UV',data:d.daily.map(r=>r.uv),borderColor:'#2dd4bf',tension:.3}
    ]},options:{plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true}}}});
  bar('c-paths',d.paths.map(r=>r.path),d.paths.map(r=>r.pv));
  pie('c-ref',d.referrer.map(r=>r.source),d.referrer.map(r=>r.count));
  bar('c-geo',d.geo.map(r=>r.region?r.country+'/'+r.region:r.country),d.geo.map(r=>r.count));
  bar('c-org',d.org.map(r=>r.org),d.org.map(r=>r.count));
  bar('c-pages',d.pages.map(r=>r.page),d.pages.map(r=>r.count));
  bar('c-clicks',d.clicks.map(r=>r.label||r.target_url),d.clicks.map(r=>r.count));
  pie('c-lang',d.lang.map(r=>r.lang),d.lang.map(r=>r.count));
}
load(30);
</script></body></html>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add analytics/src/dashboard.js
git commit -m "feat(analytics): add dashboard HTML with Chart.js visualizations"
```

---

### Task 10: Worker Entry Point

**Files:**
- Create: `analytics/src/index.js`

- [ ] **Step 1: Implement the main Worker entry combining all modules**

```js
// src/index.js
import { extractVisitor } from './visitor.js';
import { detectSession } from './session.js';
import { writeEvent } from './events.js';
import { proxyToOrigin } from './proxy.js';
import { handleRedirect } from './redirect.js';
import { getTokenFromCookie, verifyAuth, createAuthToken, loginHTML, loginErrorHTML } from './auth.js';
import { handleStats } from './stats.js';
import { dashboardHTML } from './dashboard.js';
import { runAggregation } from './cron.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Dashboard
    if (path === '/_a/dashboard' || path === '/_a/dashboard/') {
      const token = getTokenFromCookie(request.headers.get('Cookie'));
      const authed = await verifyAuth(env.KV, token);

      if (request.method === 'POST') {
        const form = await request.formData();
        const password = form.get('password');
        if (password === env.DASHBOARD_PASSWORD) {
          const newToken = await createAuthToken(env.KV);
          return new Response(dashboardHTML(), {
            headers: {
              'Content-Type': 'text/html',
              'Set-Cookie': `_a_token=${newToken}; Path=/_a; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
            },
          });
        }
        return new Response(loginErrorHTML(), { status: 401, headers: { 'Content-Type': 'text/html' } });
      }

      if (!authed) {
        return new Response(loginHTML(), { headers: { 'Content-Type': 'text/html' } });
      }
      return new Response(dashboardHTML(), { headers: { 'Content-Type': 'text/html' } });
    }

    // 2. Stats API
    if (path === '/_a/stats' || path === '/_a/stats/') {
      const token = getTokenFromCookie(request.headers.get('Cookie'));
      if (!await verifyAuth(env.KV, token)) {
        return new Response('Unauthorized', { status: 401 });
      }
      return handleStats(request, env.DB);
    }

    // Extract visitor + session for tracking routes
    const visitor = extractVisitor(request);
    const session = await detectSession(env.KV, visitor.ip, visitor.user_agent);

    // 3. Click redirect
    if (path === '/go' || path === '/go/') {
      return handleRedirect(request, ctx, visitor, session, writeEvent, env.DB);
    }

    // 4. Proxy + pageview
    return proxyToOrigin(request, ctx, visitor, session, writeEvent, env.DB);
  },

  async scheduled(event, env, ctx) {
    await runAggregation(env.DB);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add analytics/src/index.js
git commit -m "feat(analytics): add Worker entry point wiring all modules"
```

---

### Task 11: Rewrite External Links in Astro Site

**Files:**
- Modify: `src/pages/publications.astro` (lines 53, 71, 80, 98, 101, 110, 129, 144, 160, 169, 185)
- Modify: `src/pages/research.astro` (lines 35, 63, 115)
- Modify: `src/components/ai/ProductsSection.astro` (lines 24, 26, 28, 42, 44, 57)
- Modify: `src/pages/cv.astro` (lines 11-13, 20-22, 29-31)

- [ ] **Step 1: Rewrite publications.astro links**

For each external href in this file, prepend `/go?url=`. Example transformation:
```
href='https://doi.org/10.1021/acs.est.5c11071'
→ href='/go?url=https://doi.org/10.1021/acs.est.5c11071'
```

Apply to all 11 matching hrefs (DOIs, patent links, sabinlab). Use `replace_all` where a URL appears twice.

- [ ] **Step 2: Rewrite research.astro links**

Links in this file are **data-driven** — they live in the frontmatter `projects` array as `url` properties in `links` sub-arrays, rendered dynamically via `{project.links.map(link => <a href={link.url}>)}`. Rewrite only these `url` values in the data objects:

- Line ~35: `https://doi.org/10.1021/acs.est.5c11071` (tracers project, DOI link)
- Line ~63: `https://static1.squarespace.com/...PolyTile4.0_Paper.pdf` (hydrogels project, paper PDF)
- Line ~115: `https://www.cell.com/the-innovation/fulltext/S2666-6758(23)...` (superhydrophobic project, full text)

Do NOT rewrite other URLs in the same `links` arrays (collaborator profiles, funding agencies like SERDP, journal homepages like pubs.acs.org, conference sites like acadia.org).

- [ ] **Step 3: Rewrite ProductsSection.astro links**

Rewrite all 6 GitHub repo, demo, and YouTube links.

- [ ] **Step 4: Rewrite cv.astro download links**

Rewrite all 9 CV download hrefs (`/cv/Alban_*.pdf` and `/cv/Alban_*.docx`). Example:
```
href='/cv/Alban_Resume_AI.pdf'
→ href='/go?url=/cv/Alban_Resume_AI.pdf'
```

**Important:** Remove the `download` attribute from these `<a>` tags after rewriting. The `download` attribute is ignored on redirect responses and would try to download the 302 response itself. The `/go` redirect will send the browser to the actual file, which will trigger a download naturally based on the Content-Type header.

- [ ] **Step 5: Verify no broken links by building the Astro site**

Run: `cd /Users/lizy0314/zeyu-portfolio && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/publications.astro src/pages/research.astro src/components/ai/ProductsSection.astro src/pages/cv.astro
git commit -m "feat(analytics): rewrite tracked external links to /go?url= format"
```

---

### Task 12: Add Footer Privacy Notice

**Files:**
- Modify: `src/components/ui/Footer.astro`

- [ ] **Step 1: Add privacy notice to footer**

After the copyright `<p>` tag (line 10), add:

```html
<p class="text-xs opacity-60 mt-1">
  This site collects server-side visit analytics. No cookies are used.
</p>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/lizy0314/zeyu-portfolio && npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Footer.astro
git commit -m "feat(analytics): add privacy notice to footer"
```

---

### Task 13: Cloudflare Setup & Deployment (Manual Steps)

These are manual steps the user performs in Cloudflare dashboard and Porkbun:

- [ ] **Step 1: Create Cloudflare account and add zone**
  - Go to dash.cloudflare.com → Add site → `zeyuli.net` → Free plan
  - Note the two nameservers Cloudflare assigns

- [ ] **Step 2: Update Porkbun nameservers**
  - Go to porkbun.com → Domain management → `zeyuli.net` → Nameservers
  - Replace with Cloudflare's nameservers
  - Wait for propagation (check: `dig zeyuli.net NS`)

- [ ] **Step 3: Add DNS records in Cloudflare**
  - Add the same GitHub Pages DNS records (CNAME `zeyuli.net` → `albanli0314.github.io` or A records for GitHub Pages IPs)
  - Enable proxy (orange cloud) on the record

- [ ] **Step 4: Create KV and D1 resources**

```bash
cd analytics
npx wrangler kv namespace create ANALYTICS_KV
# Note the ID, put in wrangler.toml

npx wrangler d1 create ANALYTICS_DB
# Note the ID, put in wrangler.toml
```

- [ ] **Step 5: Initialize D1 schema**

```bash
npx wrangler d1 execute ANALYTICS_DB --remote --file=schema.sql
```

- [ ] **Step 6: Set dashboard password**

```bash
npx wrangler secret put DASHBOARD_PASSWORD
# Enter your chosen password at the prompt
```

- [ ] **Step 7: Deploy Worker**

```bash
npx wrangler deploy
```

- [ ] **Step 8: Verify**
  - Visit `https://zeyuli.net` — page loads normally
  - Visit `https://zeyuli.net/_a/dashboard` — login page appears
  - Login with password → dashboard renders
  - Click a `/go?url=...` link → redirects correctly
  - Check D1 via `wrangler d1 execute ANALYTICS_DB --remote --command="SELECT COUNT(*) FROM events"` — should show events
