// @ts-check
/**
 * ESLint, introduced 2026-09-04. There was no linter in this repo at all —
 * `package.json` had `dev`, `build`, `typecheck`, `test` and nothing else, and
 * `.github/` held only `dependabot.yml`, so nothing ran on a PR either.
 *
 * Ratcheted, not zero-based: `scripts/lint-ratchet.sh` fails only when the
 * count RISES, exactly like `typecheck-ratchet.sh`. A repo this size cannot go
 * to zero in one commit, and a lint gate nobody can pass is a lint gate people
 * disable.
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'src/supabase/functions/**', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // The service worker runs in a worker scope with its own globals
    // (`self`, `caches`, `clients`, `Response`, `fetch`). Without this the
    // linter reported 63 undefined-variable errors in a file that is correct.
    files: ['**/sw.js', '**/service-worker.js'],
    languageOptions: {
      globals: { self: 'readonly', caches: 'readonly', clients: 'readonly',
                 Response: 'readonly', Request: 'readonly', fetch: 'readonly',
                 console: 'readonly', URL: 'readonly', location: 'readonly',
                 skipWaiting: 'readonly', importScripts: 'readonly' },
    },
    rules: { 'no-undef': 'off' },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { window: 'readonly', document: 'readonly', console: 'readonly',
                 fetch: 'readonly', localStorage: 'readonly', sessionStorage: 'readonly',
                 setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly',
                 clearInterval: 'readonly', navigator: 'readonly', location: 'readonly',
                 alert: 'readonly', confirm: 'readonly', HTMLElement: 'readonly',
                 JSX: 'readonly', React: 'readonly', process: 'readonly' },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // The codebase is mid-migration and `any` is load-bearing in the KV
      // layer, which is genuinely untyped. Warn, ratchet, do not block.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none',
      }],

      // These two would each have caught a real defect in the blocks module:
      //   no-unneeded-ternary  ->  DayEditor's `scoringEnabled ? true : true`
      //   no-constant-binary-expression -> the same class
      'no-unneeded-ternary': 'error',
      'no-constant-binary-expression': 'error',

      // `case` fallthrough in resolveInteraction's switches is deliberate and
      // typed; tsconfig's noFallthroughCasesInSwitch already covers the rest.
      'no-fallthrough': 'off',

      // TypeScript already reports undefined identifiers, and it knows about
      // DOM/worker lib types that ESLint's globals list does not (`caches`,
      // `Response`, `self` in the service worker). Leaving this on produced 81
      // errors that tsc correctly does not report. Standard practice in TS.
      'no-undef': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
);
