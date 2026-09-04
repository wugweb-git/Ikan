/**
 * Validation core — the single source for rules shared by client and server.
 *
 * There were two copies: `src/lib/validation.ts` (browser) and
 * `server/validation.tsx` (Deno). **All seven shared functions had drifted**,
 * systematically: the server guards `typeof x !== 'string'` and the client does
 * not, so the client validators THROW on non-string input
 * (`input.trim is not a function`) where the server returns a clean error. On a
 * form that is a blank screen instead of a message.
 *
 * The server's semantics won because they are strictly safer. The email regex
 * was checked and was identical in both, so no rule changed meaning here.
 *
 * WHY THIS FILE LIVES UNDER `server/`: the edge function is deployed by copying
 * `src/supabase/functions/server/*` into a staging directory (BUILD.md), so a
 * module outside that directory is not deployed. Living here means it ships with
 * the function automatically and the browser bundle imports it by relative path.
 * It is pure TypeScript with no imports and no Deno or DOM APIs, so both
 * runtimes can load it.
 *
 * ── TWO KNOWN ISSUES, deliberately NOT fixed here ────────────────────────────
 *
 * 1. `sanitizeString` does not escape `&`, which is the first rule of HTML
 *    escaping: without it, a user typing `&lt;script&gt;` passes through
 *    unchanged and any consumer that HTML-decodes once gets `<script>`.
 *
 * 2. More fundamentally, HTML-escaping on the way IN is the wrong layer for a
 *    React app. React escapes at render, so a profile stored as `a &lt; b` is
 *    displayed to the user as the literal text `a &lt; b`. Every name, bio and
 *    location containing `<`, `>`, `"`, `'` or `/` is already double-escaped in
 *    the store today.
 *
 * Fixing either changes what is written for every profile save and how existing
 * stored values render, so it is a data decision rather than a refactor. This
 * commit unifies the drift and nothing else; the fix is recorded in blocks.md
 * so it is not lost.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Escape a string for HTML contexts. See the two known issues above before
 * changing this: its output is already stored in production profiles.
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';

  return String(input)          // the coercion the client copy lacked
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateName = (name: string): ValidationError | null => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { field: 'name', message: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { field: 'name', message: 'Name must be less than 100 characters' };
  }
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { field: 'email', message: 'Email is required' };
  }
  // Identical in both copies before unification — verified, not assumed.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password || typeof password !== 'string') {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  return null;
};

export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || typeof phone !== 'string') return null;   // optional
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }
  return null;
};

export const validateBio = (bio: string): ValidationError | null => {
  if (!bio || typeof bio !== 'string') return null;       // optional
  if (bio.trim().length > 500) {
    return { field: 'bio', message: 'Bio must be less than 500 characters' };
  }
  return null;
};

export const validateDateOfBirth = (dateOfBirth: string): ValidationError | null => {
  if (!dateOfBirth || typeof dateOfBirth !== 'string') return null;  // optional
  const date = new Date(dateOfBirth);
  if (isNaN(date.getTime())) {
    return { field: 'dateOfBirth', message: 'Please enter a valid date' };
  }
  const today = new Date();
  if (date > today) {
    return { field: 'dateOfBirth', message: 'Date of birth cannot be in the future' };
  }
  const age = today.getFullYear() - date.getFullYear();
  if (age > 120) {
    return { field: 'dateOfBirth', message: 'Please enter a valid date of birth' };
  }
  return null;
};
