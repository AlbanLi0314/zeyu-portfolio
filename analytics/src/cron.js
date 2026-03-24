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
