# CI — lint ratchet is red. Plan, not yet executed.

**Status: PLANNED, NOT EXECUTED.** Written 2026-09-08. Nothing in this document
has been applied to the codebase. The bug in §1 is live on
`equip-carry-forward`.

---

## What is failing

CI has failed on every push on 2026-09-08. Three of the four gates pass:

| gate | result |
|---|---|
| Tests | **pass** — 160/160 |
| Typecheck ratchet | **pass** — 183 against a baseline of 183 |
| Build | **pass** |
| Lint ratchet | **FAIL** — 917 problems against a baseline of 905, incl. **2 errors** |

It has been red since `a156cd9c` (914), not only on the most recent push. The
baseline has stayed at 905 throughout.

The failure is entirely in **pushed** code. The working tree holds only
`SESSIONS.md` (another session's) and an untracked planning document;
`AdminWidget.tsx`, `MobileHeader.tsx` and `globals.css` were all committed in
`842de494`.

---

## 1. The two errors are a real bug, not lint noise

`src/components/admin/AdminWidget.tsx`

```js
export function AdminWidget({ onNavigate }: AdminWidgetProps) {
  const { user } = useAuth();

  if (!user || !user.is_admin) {
    return null;              // ← line 14
  }
  ...
  const [overFooter, setOverFooter] = useState(false);   // ← line 32
  useEffect(() => { ... });                              // ← line 33
}
```

`react-hooks/rules-of-hooks`, twice. **A non-admin render runs zero hooks; an
admin render runs two.** The moment `is_admin` changes inside a mounted
session — signing in, or the auth context resolving from `undefined` to a
user — React throws *"Rendered more hooks than during the previous render"* and
the tree crashes.

Introduced by the footer-overlap fix in `842de494`. The IntersectionObserver
logic itself is correct; it is in the wrong place.

**Fix:** move the `useState` and the `useEffect` **above** the early return.
Behaviour and the explanatory comment stay as they are; only position changes.
Running the observer for a non-admin costs nothing — it no-ops when there is no
`<footer>`, and the element it guards is not rendered anyway.

---

## 2. The twelve warnings, attributed

Measured with `npx eslint . --format json`.

Introduced 2026-09-08 and in scope to clear:

| file | problem |
|---|---|
| `AdminWidget.tsx:32,33` | 2 × `react-hooks/rules-of-hooks` (§1) |
| `AssessmentResults.tsx:9` | `ContentImage` imported, no longer used |
| `AssessmentResults.tsx:611` | `programMeta` computed, never rendered |
| `AssessmentResults.tsx:119,120` | `useState<any[]>` — `recommended`, `articles` |
| `SectionHero.tsx:40` | `backgroundAlt` prop unused since the image became `alt=""` |

Pre-existing, **out of scope**: the `any`s in `AssessmentHistoryDetail`
(L79–310), `AssessmentResults` L112/115/117/196/618, and `ResourceBlock:165`.
The extracted cards — `EquipProgramCard`, `LibraryResourceCard`,
`AssessmentBlock` — are at zero.

**Fix:** delete the two dead references, type the two `useState`s (a local
`RecommendedItem` interface, and `ResourceRecord` from
`src/lib/resource-presentation.ts` for articles), and drop the unused
`backgroundAlt` prop — the hero image is decorative by decision.

---

## 3. Do not raise the baseline

`scripts/lint-ratchet.sh` states it plainly: *lower the baseline whenever you
clear problems; never raise it silently.* "My new code has warnings" is not a
stated reason. If the count lands above 905 after §2, report the residue rather
than moving the line.

---

## Verification

1. `npx eslint . --format json` → total **≤ 905**, errors **0**.
2. `npm test` (160), `bash scripts/typecheck-ratchet.sh` (183),
   `npm run build`.
3. Grep the built chunk for `IntersectionObserver` — it must still be present
   in the gear chunk after the hooks move.
4. Push, then confirm **CI green on GitHub** via `gh run list`. A local pass is
   not the check that is failing.

> Step 3 exists because on 2026-09-08 two UI features passed typecheck, 160
> tests and a clean build while being **absent from the bundle** — an unused
> `const` is not a type error, so esbuild tree-shook the whole computation and
> the literal appeared in no chunk at all. For any UI change, grep the served
> chunk for a string the feature must contain, and report that grep beside the
> test result.
