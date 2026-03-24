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
