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
