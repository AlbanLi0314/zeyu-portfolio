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
