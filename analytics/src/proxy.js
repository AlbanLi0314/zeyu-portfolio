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

  const newResponse = new Response(response.body, response);
  return newResponse;
}
