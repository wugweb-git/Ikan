# main vs. live — two divergent "ikan" apps

Documented 2026-06-16 to inform the source-of-truth decision. Both deploy to the same
Vercel project (`ikan`) and the same Supabase (`kv_store_cc205da9`).

## TL;DR
- **LIVE = commit `6441eda1`** (PR #9, branch `codex/...`, now local `equip-carry-forward`).
  This is what serves **ikanhealth.in**. It is the real, mature app.
- **`main` = `82f08723`** — a **simpler, divergent rebuild** (Figma-Make style). More UI-showcase
  files but far fewer real features. **Never successfully deployed.** This is the line I edited
  earlier in the session — so that work does **not** reach production.

## File-level
- `main`: 600 `src` files · `LIVE`: 382 `src` files (main has more UI cruft, fewer real features).

## Features the LIVE app has that `main` lacks
| Area | LIVE (`6441eda1`) | `main` |
|---|---|---|
| Admin block editor | `src/components/admin/*` (AdminScoringEngine, RecommendationRulesManager, AdminCheckinScalesManager, AdminMoodManager, EquipBlockEditor/DailyEditor…) | ❌ only a raw-JSON `AdminPanel` I added |
| Program player | `src/components/player/{ProgramPlayer,BlockRenderer}.tsx` | ❌ placeholder `EquipProgramFlow` |
| Engines | `recommendation-engine.ts`, `IkanScoreCard`, `useIkanScore`, `equip-admin-types.ts` | ❌ none |
| Integrations | `src/components/integrations/*` (Google Fit) | partial |
| Edge function | **modular**: `admin-routes`, `assessment-routes`, `equip-routes`, `ikan-score-routes`, `mood-routes`, `checkin-template-routes`, `brevo-routes`, `kv_dual_write.ts`, … | **monolithic** `index.tsx` + `kv_store.tsx` (`make-server-cc205da9`) |

## Data-prefix divergence (why my earlier fixes missed production)
The live server's **`kv_dual_write.ts`** writes each record under **two** prefixes:
- **Canonical (LIVE reads):** `assessment_def:`, `block:`, `day:`, `equip_program:`, `enrollment:`,
  `progress:`, `checkin_scale:`, `recommendation_rule:`, `ikan_score:`.
- **Legacy (main reads):** `assessment:`, `journal:`, `user:`, `equip_program:` …

Concrete proof: after my earlier cleanup, `assessment:asm_…926263` = **7** questions (clean) but
`assessment_def:asm_…926263` = **10** (still has the 3 junk fragments). The live site still shows
the junk because I cleaned the legacy copy, not the canonical one.

## Implication
- Almost all of my earlier `main` session work (assessment normalizer, admin CRUD, dashboard
  real-data, scoring, `index.html`, Vercel config) **edited a different app** and does **not**
  reach `ikanhealth.in`.
- Re-audits and data fixes must target the **LIVE code** and the **canonical prefixes**
  (`assessment_def:`, `block:`, `day:`, …).

## Recommendation
Adopt the **LIVE line as the single source of truth**; retire `main`. All current carry-forward
work is already on the live line (`equip-carry-forward`).
