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
