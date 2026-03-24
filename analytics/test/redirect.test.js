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
