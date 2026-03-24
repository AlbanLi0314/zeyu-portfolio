import { describe, it, expect } from 'vitest';
import { bucketReferrer, extractPrimaryLang, mapPathToPage } from '../src/cron.js';

describe('bucketReferrer', () => {
  it('empty referrer -> direct', () => expect(bucketReferrer(null)).toBe('direct'));
  it('google.com -> google', () => expect(bucketReferrer('https://www.google.com/search?q=test')).toBe('google'));
  it('scholar.google.com -> google_scholar', () => expect(bucketReferrer('https://scholar.google.com/scholar?q=test')).toBe('google_scholar'));
  it('t.co -> twitter', () => expect(bucketReferrer('https://t.co/abc')).toBe('twitter'));
  it('linkedin.com -> linkedin', () => expect(bucketReferrer('https://www.linkedin.com/feed')).toBe('linkedin'));
  it('github.com -> github', () => expect(bucketReferrer('https://github.com/user/repo')).toBe('github'));
  it('arxiv.org -> arxiv', () => expect(bucketReferrer('https://arxiv.org/abs/2506.07972')).toBe('arxiv'));
  it('zeyuli.net -> self (excluded)', () => expect(bucketReferrer('https://zeyuli.net/research/')).toBe('self'));
  it('unknown -> other', () => expect(bucketReferrer('https://random-site.org')).toBe('other'));
});

describe('extractPrimaryLang', () => {
  it('extracts primary lang tag', () => expect(extractPrimaryLang('zh-CN,en;q=0.9')).toBe('zh-CN'));
  it('handles simple lang', () => expect(extractPrimaryLang('en-US')).toBe('en-US'));
  it('returns unknown for null', () => expect(extractPrimaryLang(null)).toBe('unknown'));
});

describe('mapPathToPage', () => {
  it('/ -> home', () => expect(mapPathToPage('/')).toBe('home'));
  it('/research/ -> research', () => expect(mapPathToPage('/research/')).toBe('research'));
  it('/publications/ -> publications', () => expect(mapPathToPage('/publications/')).toBe('publications'));
  it('/cv/ -> cv', () => expect(mapPathToPage('/cv/')).toBe('cv'));
  it('/cv/Resume.pdf -> cv_download', () => expect(mapPathToPage('/cv/Resume.pdf')).toBe('cv_download'));
  it('/cv/Resume.docx -> cv_download', () => expect(mapPathToPage('/cv/Resume.docx')).toBe('cv_download'));
  it('/blog/my-post -> blog', () => expect(mapPathToPage('/blog/my-post')).toBe('blog'));
  it('/series/my-series -> series', () => expect(mapPathToPage('/series/my-series')).toBe('series'));
  it('/random -> other', () => expect(mapPathToPage('/random')).toBe('other'));
});
