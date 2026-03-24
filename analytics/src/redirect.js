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
  // Resolve relative paths to absolute URLs (Response.redirect requires absolute)
  const absoluteTarget = target.startsWith('/') ? `${url.origin}${target}` : target;
  ctx.waitUntil(writeEventFn(db, 'click', visitor, session.session_id, session.is_new_session, target));
  return Response.redirect(absoluteTarget, 302);
}
