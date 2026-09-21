/**
 * Run with:  npm test
 *
 * Validation had NO tests, on a health product, for rules that gate what a user
 * can store — including an XSS escape. It also had two copies that had all
 * drifted apart. These lock the unified behaviour so the split cannot recur
 * silently.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeString, validateName, validateEmail, validatePassword,
  validatePhone, validateBio, validateDateOfBirth,
} from '../../supabase/functions/server/validation-core.ts';

test('every shared validator survives a non-string, rather than throwing', () => {
  // THE DRIFT THIS FIXES. The browser copy lacked `typeof x !== 'string'`, so
  // each of these threw `x.trim is not a function` — a blank screen where the
  // server would have returned a message.
  const junk = [123, {}, [], true] as unknown[];
  for (const v of junk) {
    assert.doesNotThrow(() => validateName(v as string), `validateName(${typeof v})`);
    assert.doesNotThrow(() => validateEmail(v as string), `validateEmail(${typeof v})`);
    assert.doesNotThrow(() => validatePassword(v as string));
    assert.doesNotThrow(() => validatePhone(v as string));
    assert.doesNotThrow(() => validateBio(v as string));
    assert.doesNotThrow(() => validateDateOfBirth(v as string));
    assert.doesNotThrow(() => sanitizeString(v as string));
  }
});

test('sanitizeString escapes the five characters it claims to', () => {
  assert.equal(sanitizeString('<script>'), '&lt;script&gt;');
  assert.equal(sanitizeString('"quoted"'), '&quot;quoted&quot;');
  assert.equal(sanitizeString("it's"), 'it&#x27;s');
  assert.equal(sanitizeString('a/b'), 'a&#x2F;b');
  assert.equal(sanitizeString(''), '');
});

test('sanitizeString does NOT escape & — a known gap, pinned so it is deliberate', () => {
  // Documented in validation-core.ts. Without escaping `&` first, a user typing
  // `&lt;script&gt;` passes through unchanged and any consumer that HTML-decodes
  // once gets `<script>`. Not fixed here because it changes what is written for
  // every profile save. If you fix it, change this assertion in the same commit.
  assert.equal(sanitizeString('&lt;script&gt;'), '&amp;lt;script&amp;gt;'.replace(/&amp;/g, '&'));
  assert.equal(sanitizeString('Tom & Jerry'), 'Tom & Jerry');
});

test('required rules reject empty and accept valid', () => {
  assert.equal(validateName('Jo')?.field, undefined);
  assert.equal(validateName('J')?.field, 'name');
  assert.equal(validateName('')?.field, 'name');
  assert.equal(validateEmail('a@b.co'), null);
  assert.equal(validateEmail('not-an-email')?.field, 'email');
  assert.equal(validatePassword('12345678'), null);
  assert.equal(validatePassword('short')?.field, 'password');
});

test('optional rules return null when absent, and validate when present', () => {
  assert.equal(validatePhone(''), null);
  assert.equal(validatePhone('+91 98765 43210'), null);
  assert.equal(validatePhone('123')?.field, 'phone');
  assert.equal(validateBio(''), null);
  assert.equal(validateBio('x'.repeat(501))?.field, 'bio');
  assert.equal(validateDateOfBirth(''), null);
  assert.equal(validateDateOfBirth('not a date')?.field, 'dateOfBirth');
  assert.equal(validateDateOfBirth('3000-01-01')?.field, 'dateOfBirth');
});

// ── Scoring vocabulary ─────────────────────────────────────────────
// The severity terms were defined in four places. The values agreed, but the
// two `compareSeverity` implementations did not, and the browser's was wrong.
import { compareSeverity, isSeverityLevel, SEVERITY_LEVELS } from '../../supabase/functions/server/scoring-vocabulary.ts';

test('an unrecognised threshold is never one everybody clears', () => {
  // THE BUG. The browser copy was `indexOf(a) - indexOf(b)`, and indexOf gives
  // -1 for an unknown term, so this returned 4 - (-1) = 5 — "severe is greater
  // than typo", i.e. a mistyped rule threshold fired for every user.
  assert.equal(compareSeverity('severe', 'typo' as never), -1);
  assert.equal(compareSeverity('typo' as never, 'minimal' as never), -1);
  assert.equal(compareSeverity('minimal', 'typo' as never), -1);
});

test('severities order least to most severe', () => {
  assert.ok(compareSeverity('minimal', 'severe') < 0);
  assert.ok(compareSeverity('severe', 'minimal') > 0);
  assert.equal(compareSeverity('moderate', 'moderate'), 0);
  assert.ok(compareSeverity('moderately-severe', 'moderate') > 0);
});

test('the clinical vocabulary is the five ordered terms', () => {
  assert.deepEqual([...SEVERITY_LEVELS],
    ['minimal', 'mild', 'moderate', 'moderately-severe', 'severe']);
  assert.equal(isSeverityLevel('moderately-severe'), true);
  assert.equal(isSeverityLevel('low'), false);   // that is a response TIER
});
