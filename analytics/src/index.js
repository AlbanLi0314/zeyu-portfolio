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
