/**
 * Run with:  npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APP_ORIGIN, crossHostSignInUrl, isMarketingHost } from './app-host.ts';

test('marketing hosts send sign-in to the app host', () => {
  assert.equal(crossHostSignInUrl('ikanhealth.in'), `${APP_ORIGIN}/login`);
  assert.equal(crossHostSignInUrl('www.ikanhealth.in'), `${APP_ORIGIN}/login`);
  assert.equal(crossHostSignInUrl('IKANHEALTH.IN'), `${APP_ORIGIN}/login`);
});

test('the app host, localhost and previews stay in-app', () => {
  for (const h of ['app.ikanhealth.in', 'localhost', '127.0.0.1', 'ikan-abc123-wugweb.vercel.app', 'ikan-2.vercel.app']) {
    assert.equal(crossHostSignInUrl(h), null, h);
    assert.equal(isMarketingHost(h), false, h);
  }
});

test('lookalike hosts are not treated as marketing', () => {
  assert.equal(isMarketingHost('ikanhealth.in.evil.com'), false);
  assert.equal(isMarketingHost('notikanhealth.in'), false);
});
