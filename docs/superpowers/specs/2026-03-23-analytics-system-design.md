# Analytics System Design
> zeyuli.net · Cloudflare Workers + D1 + KV
> Adapted from hins-hu.me design · Date: 2026-03-23

---

## Overview

A fully server-side, ad-blocker-proof analytics system for `zeyuli.net`. Built on Cloudflare Workers as a reverse proxy — all tracking happens at the CDN layer before the browser receives anything. No JavaScript beacon required.

---

## Architecture

```
User requests zeyuli.net/*
        │
        ▼
Cloudflare Worker (zeyuli.net route)
  1. Extract visitor info from request.cf + headers
  2. KV.get(hash(ip+ua)) → determine session
  3. Route:
     ├─ /_a/dashboard  → return Dashboard HTML (password protected)
     ├─ /_a/stats      → query D1 agg_* tables → return JSON
     ├─ /go?url=...    → record click event → 302 redirect
     └─ all other      → record pageview → proxy to GitHub Pages
        │
        ▼
  GitHub Pages (albanli0314.github.io) ← origin
        │
        ▼
  D1 Database          KV Store
  (all tables)         (sessions + dashboard cache)
```

**Key properties:**
- Tracking is server-side — cannot be blocked by ad blockers
- No JavaScript beacon on the site
- Session cookie-free — session state managed in KV
- `ctx.waitUntil()` for async D1 writes — zero added latency to page loads

---

## Data Model

### Primary Table: `events`

Permanent — never deleted.

```sql
CREATE TABLE events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            INTEGER NOT NULL,

  -- URL
  path          TEXT    NOT NULL,
  query         TEXT,
  method        TEXT,

  -- Event
  event_type    TEXT    NOT NULL,   -- 'pageview' | 'click'
  target_url    TEXT,               -- click events only

  -- Source
  referrer      TEXT,

  -- Network / Org
  ip            TEXT,               -- full IP (not truncated)
  asn           INTEGER,
  org           TEXT,               -- e.g. "Google LLC", "Cornell University"

  -- Geography
  country       TEXT,
  region        TEXT,
  region_code   TEXT,
  city          TEXT,
  postal_code   TEXT,
  latitude      TEXT,
  longitude     TEXT,
  timezone      TEXT,
  is_eu         INTEGER,

  -- Cloudflare edge
  colo          TEXT,

  -- Browser
  user_agent    TEXT,
  accept_lang   TEXT,

  -- Protocol
  http_protocol TEXT,
  tls_version   TEXT,

  -- Bot detection (request.cf.clientTrustScore, available on free tier)
  trust_score   INTEGER,
  dnt           INTEGER,

  -- Session
  session_id    TEXT,
  is_new_session INTEGER            -- 1 = new session entry, 0 = within session
);

CREATE INDEX idx_ts   ON events(ts);
CREATE INDEX idx_type ON events(event_type, ts);
CREATE INDEX idx_path ON events(path, ts);
```

**Event types:**
- `pageview`: any GET to `zeyuli.net/*` (first visit and internal navigation)
- `click`: `/go?url=...` redirect (external links only)

**Session logic:**
- Session ID generated server-side via KV, not cookies
- `hash(ip + user_agent)` as KV key, TTL 2 hours **fixed-window** (no renewal on activity — intentional)
- `is_new_session = 1` on first request of a session
- Known limitation: users on the same IP + user_agent share a session. Acceptable at this scale.

---

### Aggregation Tables

All in D1. Populated by daily Cron Job. Permanent — never deleted. Can be fully rebuilt from `events` at any time.

**`agg_daily`** — Daily PV / UV per path
```sql
CREATE TABLE agg_daily (
  date   TEXT    NOT NULL,
  path   TEXT    NOT NULL,
  pv     INTEGER DEFAULT 0,
  uv     INTEGER DEFAULT 0,   -- DISTINCT ip, pageview only
  PRIMARY KEY (date, path)
);
```

**`agg_referrer`** — Daily referrer source buckets
```sql
CREATE TABLE agg_referrer (
  date   TEXT    NOT NULL,
  source TEXT    NOT NULL,   -- 'google' | 'google_scholar' | 'twitter' | 'linkedin' | 'github' | 'arxiv' | 'direct' | 'other'
  count  INTEGER DEFAULT 0,
  PRIMARY KEY (date, source)
);
```

Bucketing rules (hardcoded in Cron Job, rebuildable):
- empty / null referrer → `direct`
- hostname ends with `google.com`, but NOT `scholar.google.com` → `google`
- hostname is `scholar.google.com` → `google_scholar`
- hostname ends with `twitter.com` or is `t.co` → `twitter`
- hostname ends with `linkedin.com` → `linkedin`
- hostname ends with `github.com` → `github`
- hostname ends with `arxiv.org` → `arxiv`
- hostname is `zeyuli.net` (self-referral) → excluded from agg_referrer
- everything else → `other`

**`agg_geo`** — Daily geography distribution
```sql
CREATE TABLE agg_geo (
  date    TEXT    NOT NULL,
  country TEXT    NOT NULL,
  region  TEXT    NOT NULL DEFAULT '',  -- state for US, province for CN; '' for all others
  count   INTEGER DEFAULT 0,
  PRIMARY KEY (date, country, region)
);
```

Cron Job stores `region = cf.region` for US/CN, `region = ''` for all other countries.

**`agg_org`** — Daily org / network distribution
```sql
CREATE TABLE agg_org (
  date  TEXT    NOT NULL,
  org   TEXT    NOT NULL,
  asn   INTEGER,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (date, org)
);
```

**`agg_page_visits`** — Daily visits per page
```sql
CREATE TABLE agg_page_visits (
  date  TEXT    NOT NULL,
  page  TEXT    NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (date, page)
);
```

Path-to-page mapping (applied in Cron Job):
- `/` → `home`
- `/research/` → `research`
- `/publications/` → `publications`
- `/teaching/` → `teaching`
- `/skills/` → `skills`
- `/cv/` → `cv`
- `/ai/` → `ai`
- `/contact/` → `contact`
- `/blog/*` → `blog`
- `/series/*` → `series`
- `/papers/` → `papers`
- `/cv/*.pdf`, `/cv/*.docx` → `cv_download`
- all other paths → `other`

**`agg_link_clicks`** — In-page external link clicks
```sql
CREATE TABLE agg_link_clicks (
  date       TEXT    NOT NULL,
  target_url TEXT    NOT NULL,
  count      INTEGER DEFAULT 0,
  PRIMARY KEY (date, target_url)
);
```

**`agg_lang`** — Browser language preference
```sql
CREATE TABLE agg_lang (
  date  TEXT    NOT NULL,
  lang  TEXT    NOT NULL,   -- primary language tag e.g. 'zh-CN', 'en-US', 'ja'
  count INTEGER DEFAULT 0,
  PRIMARY KEY (date, lang)
);
```

**`url_labels`** — Human-readable labels for link click URLs
```sql
CREATE TABLE url_labels (
  target_url TEXT PRIMARY KEY,
  label      TEXT NOT NULL
);
```

Initial seed (run once after deployment):
```sql
INSERT INTO url_labels VALUES
  ('https://doi.org/10.1021/acs.est.5c11071', 'eDNA Tracers ES&T'),
  ('https://doi.org/10.1016/j.xinn.2023.100389', 'Superhydrophobic The Innovation'),
  ('https://papers.cumincad.org/cgi-bin/works/paper/acadia24_v1_14', 'PolyTile ACADIA'),
  ('https://www.cell.com/the-innovation/fulltext/S2666-6758(23)00017-6?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS2666675823000176%3Fshowall%3Dtrue', 'Superhydrophobic Full Text'),
  ('https://patentimages.storage.googleapis.com/23/c1/2e/ae5d7a7ba0f149/US11839998.pdf', 'US Patent Crack Engineering'),
  ('https://patents.google.com/patent/CN107903925A/en', 'CN Patent Biomass Reactor'),
  ('https://github.com/AlbanLi0314/er-companion', 'ER Companion GitHub'),
  ('https://github.com/AlbanLi0314/resonance', 'Resonance GitHub'),
  ('https://resonance-aounkapvlodwxrz2n49wye.streamlit.app', 'Resonance Demo'),
  ('https://echo-app-ebon.vercel.app', 'Echo Demo'),
  ('https://www.sabinlab.com/polytile', 'PolyTile Project Page'),
  ('https://www.youtube.com/watch?v=sfNbcSTc1aE', 'ER Companion Software Demo'),
  ('https://www.youtube.com/watch?v=PdG9uu5Dodc', 'ER Companion Hardware Demo'),
  ('/cv/Alban_Resume_AI.pdf', 'CV AI PDF'),
  ('/cv/Alban_Resume_AI.docx', 'CV AI Word'),
  ('/cv/Alban_ATS_AI.docx', 'CV AI ATS'),
  ('/cv/Alban_Resume_M.pdf', 'CV Materials PDF'),
  ('/cv/Alban_Resume_M.docx', 'CV Materials Word'),
  ('/cv/Alban_ATS_M.docx', 'CV Materials ATS'),
  ('/cv/Alban_Resume_B.pdf', 'CV Biotech PDF'),
  ('/cv/Alban_Resume_B.docx', 'CV Biotech Word'),
  ('/cv/Alban_ATS_B.docx', 'CV Biotech ATS');
```

For new URLs with no label, dashboard displays raw URL as fallback.

---

## Worker Routes

### Shared: visitor info extraction

Runs on every request before routing:

```
visitorInfo = {
  ts, path, query, method,
  referrer: headers.get('Referer'),
  ip: headers.get('CF-Connecting-IP'),
  asn, org, country, region, region_code, city,
  postal_code, latitude, longitude, timezone, is_eu, colo,
  http_protocol, tls_version,
  user_agent: headers.get('User-Agent'),
  accept_lang: headers.get('Accept-Language'),
  trust_score, dnt: headers.get('DNT')
}
```

### Shared: session detection (KV)

```
key = hash(ip + user_agent)
entry = await KV.get(key)
if entry is null:
    session_id = new UUID
    is_new_session = 1
    await KV.put(key, session_id, { expirationTtl: 7200 })
else:
    session_id = entry
    is_new_session = 0
```

### Routing priority

The Worker matches paths in this order — first match wins:
1. `/_a/dashboard` → Dashboard
2. `/_a/stats` → Stats API
3. `/go` → Click redirect
4. Everything else → Proxy + pageview

### `/_a/dashboard` — Dashboard

1. Check KV for auth session token (key: `auth:<token>`)
2. Invalid → return login HTML (password form)
3. On login POST: verify password against Worker secret `DASHBOARD_PASSWORD` (set via `wrangler secret put`)
4. On success: generate token, `KV.put('auth:<token>', '1', { expirationTtl: 86400 })`, set cookie `_a_token=<token>`
5. Valid → return dashboard HTML (Chart.js, fetches `/_a/stats`)

### `/_a/stats?metric=<m>&range=<r>` — Stats API

1. Verify auth session token from `_a_token` cookie (401 if invalid)
2. Query appropriate `agg_*` table with date range
3. For cross-range UV: query `events` directly with `COUNT(DISTINCT ip)`
4. Return JSON (same-origin only, no CORS headers)

### `/go?url=<target>` — Click redirect

1. Extract `target_url` from query params
2. **Validate URL:** must start with `https://` or `http://` or `/` (relative). Reject `javascript:`, `data:`, or empty — return 400.
3. `ctx.waitUntil(writeEvent('click', visitorInfo, session_id, is_new_session, target_url))`
4. Return `Response.redirect(target_url, 302)`

### All other paths — Proxy + pageview

1. `ctx.waitUntil(writeEvent('pageview', visitorInfo, session_id, is_new_session, null))`
2. `fetch('https://albanli0314.github.io' + path, { headers: forwardedHeaders })`
3. Return proxied response

---

## Cron Job

**Schedule:** `5 0 * * *` (00:05 UTC daily)

Processes yesterday's data. All queries filter `WHERE trust_score IS NULL OR trust_score >= 50` to exclude bots. Each step runs independently:

1. **agg_daily**: GROUP BY path, COUNT(*) pv, COUNT(DISTINCT ip) uv WHERE event_type='pageview'
2. **agg_referrer**: extract hostname from referrer, apply bucketing rules, GROUP BY bucket; exclude self-referrals (zeyuli.net)
3. **agg_geo**: GROUP BY country + region (region=cf.region for US/CN, region='' for others)
4. **agg_org**: GROUP BY org, asn
5. **agg_page_visits**: map path to page enum, GROUP BY page WHERE event_type='pageview'
6. **agg_link_clicks**: WHERE event_type='click', GROUP BY target_url
7. **agg_lang**: extract primary tag from accept_lang, GROUP BY lang

All writes use UPSERT (`INSERT OR REPLACE`). Step failures are independent and logged to Cloudflare Workers logs.

**Rebuild:** To apply updated rules, clear affected `agg_*` tables and re-run Cron Job logic over all historical `events` data.

---

## Dashboard UI

URL: `zeyuli.net/_a/dashboard`
Auth: password → KV session token (24h TTL)
Stack: static HTML + Chart.js served directly from Worker

**Time range selector:** 7 days / 30 days / 90 days / All time

| Block | Chart Type | Data Source |
|-------|-----------|-------------|
| Daily visits / PV trend | Line chart | `agg_daily` (sum all paths) |
| Top paths ranking | Horizontal bar | `agg_daily` (raw path granularity) |
| Referrer source distribution | Pie chart | `agg_referrer` |
| Country / region distribution | Horizontal bar (US/CN expandable) | `agg_geo` |
| Org / network ranking | Horizontal bar | `agg_org` |
| Page visits distribution | Horizontal bar | `agg_page_visits` |
| Link click ranking | Horizontal bar (with labels) | `agg_link_clicks` JOIN `url_labels` |
| Language preference | Pie chart | `agg_lang` |

---

## Astro Site Changes

### External link rewriting

All tracked external links rewritten to go through `/go`:

```html
<!-- Before -->
<a href="https://doi.org/10.1021/acs.est.5c11071" target="_blank" rel="noopener noreferrer">

<!-- After -->
<a href="/go?url=https://doi.org/10.1021/acs.est.5c11071" target="_blank" rel="noopener noreferrer">
```

**Files to modify:**
- `src/pages/publications.astro` — paper DOIs, patent links
- `src/pages/research.astro` — paper full text link (Cell Press), PolyTile PDF (Squarespace). Collaborator profiles and funding agency links are NOT rewritten.
- `src/components/ai/ProductsSection.astro` — GitHub repos, demos, YouTube
- `src/pages/cv.astro` — all CV download links (PDF, Word, ATS)

**Not rewritten:**
- Social profile links (LinkedIn, GitHub profile, Google Scholar, ORCID) in sidebar/footer
- Collaborator faculty profile links on research page
- Funding agency links (SERDP, etc.)
- Internal navigation links (captured as pageviews automatically)

### Footer privacy notice

Add to `src/layouts/Layout.astro` footer:

> *This site collects server-side visit analytics. No cookies are used.*

---

## Deployment Steps

### 1. Cloudflare setup
- Create free Cloudflare account → add `zeyuli.net`
- Get Cloudflare nameservers
- At Porkbun: change nameservers to Cloudflare's
- Wait for DNS propagation
- Add DNS records pointing to GitHub Pages (same `CNAME` or `A` records as before)
- Ensure `CNAME` file containing `zeyuli.net` exists in repo root (already present) — GitHub Pages requires this to accept proxied requests

### 2. Cloudflare resource creation
- Create KV namespace: `ANALYTICS_KV`
- Create D1 database: `ANALYTICS_DB`
- Run all CREATE TABLE statements
- Insert `url_labels` seed data

### 3. Worker deployment
- `wrangler init` → write Worker code
- Set dashboard password: `wrangler secret put DASHBOARD_PASSWORD`
- Sample `wrangler.toml`:
  ```toml
  name = "zeyuli-analytics"
  main = "src/index.js"
  compatibility_date = "2024-01-01"

  routes = [{ pattern = "zeyuli.net/*", zone_name = "zeyuli.net" }]

  [[kv_namespaces]]
  binding = "KV"
  id = "<kv-namespace-id>"

  [[d1_databases]]
  binding = "DB"
  database_name = "ANALYTICS_DB"
  database_id = "<d1-database-id>"

  [triggers]
  crons = ["5 0 * * *"]
  ```
- Origin: `https://albanli0314.github.io`

### 4. Cron Job
- Configure in `wrangler.toml`: `[triggers] crons = ["5 0 * * *"]`
- Implement `scheduled` handler in Worker

### 5. Astro site changes
- Rewrite external links → commit → GitHub Actions auto-deploys
- Worker proxies updated GitHub Pages content

### 6. Verification
- Visit `zeyuli.net` — confirm pages load normally
- Visit `zeyuli.net/_a/dashboard` — confirm dashboard works
- Click `/go?url=...` links — confirm redirect and event recording
- Next day: confirm Cron Job populates `agg_*` tables

---

## KV Usage

| Operation | Daily writes | Daily reads |
|-----------|-------------|-------------|
| Session tracking | ~50–100 | ~300–500 |
| Dashboard cache (optional) | ~5–10 | ~10 |
| Dashboard auth | ~1–2 | ~5 |
| **Total** | **~60–115** | **~315–515** |
| Free tier limit | 1,000 | 100,000 |

## Storage Estimates

| Table | Rows/year | Size/year |
|-------|-----------|----------|
| `events` | ~36,500 | ~18 MB |
| All `agg_*` | ~50,000 | ~5 MB |
| D1 free tier | — | 5 GB |

Storage is negligible. No deletion policy needed.

---

## Compliance

- No cookies set by the site
- No JavaScript tracking beacon
- Full IP stored (personal academic site, low risk)
- Privacy notice in site footer: *"This site collects server-side visit analytics. No cookies are used."*
