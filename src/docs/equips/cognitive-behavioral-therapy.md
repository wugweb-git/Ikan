# Cognitive Behavioral Therapy — CBT 10-week programme

Pulled live from `equip:cbt-10week` on 2026-08-06. **✅ Deleted 2026-08-06**, same day audited —
confirmed 0 enrollments/progress/day-content/recommendation-rule references before deleting both
`equip:cbt-10week` and its `equip_slug:cognitive-behavioral-therapy` index entry. It was an empty
pricing stub (see below) that never actually launched. Left as a record of what was found.

## Meta

| Field | Value |
|---|---|
| equip_id | `cbt-10week` (legacy string id — predates the UUID-id convention used by `equip:33eae2e2-…`, `equip:416feb50-…`, `equip:68970d31-…`, `equip:9117b308-…`) |
| slug | `cognitive-behavioral-therapy` |
| title | `Cognitive Behavioral Therapy` |
| duration_days | `70` (= 10 × 7, internally consistent with the id/title's "10-week") |
| price / currency | `149.99` / `USD` |
| expires_in_days_after_payment | `180` |
| id | *(not present — this record uses `equip_id` instead of `id`)* |
| published / featured / can_repeat / is_paid | *(none of these fields exist on the record)* |
| category / difficulty | *(absent)* |
| tags / metadata | *(absent)* |
| onboarding / onboarding_questions | *(absent)* |
| checkInConfig | *(absent)* |
| days / daily_content / week_structure | *(absent — no per-day content field of any kind)* |
| image_url / thumbnail / cover_image | *(absent)* |
| created_at / updated_at / published_at | *(absent)* |

**`select jsonb_object_keys(value)` returns exactly 8 keys, full stop:** `slug`, `price`, `title`, `currency`, `equip_id`, `description`, `duration_days`, `expires_in_days_after_payment`. Nothing else is on this record. Full verbatim value:

```json
{
  "slug": "cognitive-behavioral-therapy",
  "price": 149.99,
  "title": "Cognitive Behavioral Therapy",
  "currency": "USD",
  "equip_id": "cbt-10week",
  "description": "Develop healthy thinking patterns and coping strategies with structured CBT exercises.",
  "duration_days": 70,
  "expires_in_days_after_payment": 180
}
```

## Description (landing page)

> Develop healthy thinking patterns and coping strategies with structured CBT exercises.

That single sentence is the entirety of the authored copy for this program. There is no subtitle, no landing-page metadata tiles, no eligibility copy, no benefit bullets — none of the `metadata.*` fields the sibling programs carry exist here at all.

## Content field used: **none**

Both content-storage mechanisms present in this codebase were checked and both are empty for this equip:

1. **Embedded array on the equip record** (`days` / `daily_content` / `week_structure` — the shape all 4 already-audited sibling programs use). None of these three keys exist on `equip:cbt-10week` at all — not "empty array," genuinely absent from the JSON.
2. **Separate `day:`/`block:` KV records joined via `equip_id`** (the mechanism `EquipService.getFullEquip()` in `src/supabase/functions/server/program-service.ts` lines 174–212 actually uses to serve `GET /equip/programs/:equipId`): `select count(*) from kv_store_cc205da9 where key like 'day:%' and value->>'equip_id' = 'cbt-10week'` → **0**. A distinct scan of `equip_id` across all 105 `day:` records in the table shows only the 4 UUID-id equips represented (`33eae2e2-…`, `416feb50-…`, `68970d31-…`, `9117b308-…`) — `cbt-10week` never appears. No `block:` records were checked individually since there are no `day:` records to hold blocks in the first place.

There is also no `equip_program:cbt-10week` mirror record (the `equip_program:` prefix — 4 records total — is a dual-write mirror of the 4 UUID equips only, unrelated to this one) and no `equip_program_by_slug:` entry.

**Calling `getFullEquip('cbt-10week')` today returns `{ ...the 8 fields above, days: [] }`.** There is no day-by-day content to dump because none was ever authored — this is not a truncation or a missing-chunk problem, it's a program that only has a pricing/marketing shell.

## Onboarding

No `onboarding` object and no `onboarding_questions` array exist on the record. Nothing to reproduce.

## checkInConfig

Does not exist on the record. No check-in behavior is configured for this program.

## Usage data (live enrollees)

### Enrollments (KV `enrollment:` records, keyed by `programId`)

**0 records.** `select ... from kv_store_cc205da9 where key like 'enrollment:%' and value->>'programId' = 'cbt-10week'` returns nothing. Cross-check `select count(*) from user_enrollments where data->>'programId' = 'cbt-10week'` also returns **0** — no migration drift, because there's nothing to drift.

### Progress (KV `progress:` records, keyed by `equip_id`)

**0 records.** Cross-check `select count(*) from user_program_progress where data->>'equip_id' = 'cbt-10week'` also returns **0**.

### Recommendation rules

**0 records** under `recommendation_rule:` with `equip_id = 'cbt-10week'`.

### Payments

**0 records** under `payment:` mention `cbt` or `cognitive-behavioral-therapy` anywhere in their value — despite this program carrying a live price (`$149.99`) and a post-payment access window (`expires_in_days_after_payment: 180`), nobody has ever paid for it.

### Legacy-id mismatch check

Per the task brief, checked specifically for the possibility that a legacy string id (`cbt-10week`) causes enrollment/progress records to reference this equip under a *different* identifier than the ones queried above. Ran a broad text search: `select key from kv_store_cc205da9 where (key like 'enrollment:%' or key like 'progress:%' or key like 'user_enrollment:%') and value::text ilike '%cbt%'` (also tried `%cognitive%behav%` and `%10week%`) → **zero rows, all three patterns.** No id-mismatch bug found — the total absence of usage data is real, not an artifact of querying the wrong field name.

## Verification notes

1. 🔴 **This program has no per-day content anywhere in the database, under either content-storage mechanism the codebase supports.** Not a subset check — `jsonb_object_keys` on the raw record lists exactly 8 keys, none of which are `days`/`daily_content`/`week_structure`; and a direct scan of all 105 `day:` records for `equip_id = 'cbt-10week'` returns 0. If this program is meant to be part of the live catalog, none of its actual CBT lesson content was ever authored or migrated in — it is currently pure pricing metadata (title, description, price, duration) with nothing behind it.

2. 🔴 **The program is invisible on the public site today.** `equip-routes.ts` line 29 filters `/equip/programs` to `p.published === true`; this record has no `published` field at all, so it evaluates to `undefined === true` → `false` and is silently excluded from every public program listing. It is only reachable by a direct id or slug hit on `GET /equip/programs/:equipId` (which does resolve correctly — see note 6).

3. 🔴 **It has a live price but zero payment activity and zero enrollments.** `price: 149.99`, `currency: USD`, and `expires_in_days_after_payment: 180` are all set as if this were a purchasable product, yet there are no `payment:` records, no `enrollment:` records, and no `progress:` records referencing it anywhere, under any identifier. Combined with note 2, this reads as a program that was priced and slugged but never actually launched — not a program that launched and quietly lost its users.

4. 🟡 **This is a systemic pattern, not unique to CBT.** The only other legacy string-id equip, `equip:mindfulness-8week` (slug `mindfulness-meditation`), has the exact same 8-key-only shape (`slug`, `price`, `title`, `currency`, `equip_id`, `description`, `duration_days`, `expires_in_days_after_payment`) with no content fields, no `published`, and (unverified beyond the shape check, out of scope for this doc) presumably the same lack of `day:` records. Both legacy-id equips look like payment/catalog placeholders created before the 4 UUID-id programs were built out with real day-by-day content, and neither was ever finished.

5. 🟢 **No id-resolution bug specific to the legacy string id.** `equip_slug:cognitive-behavioral-therapy` → `cbt-10week` resolves correctly, and `GET /equip/programs/:equipId` (`equip-routes.ts` lines 69–90) correctly falls back from a direct id lookup to `getEquipBySlug` when the id lookup misses — this logic is generic and doesn't assume UUID shape. Fetching this program by id or by slug both work; it's the content and the `published` flag that are missing, not the routing.

6. 🟢 **The one field that could be cross-checked for consistency checks out.** `duration_days: 70` matches the id/title's "10-week" framing exactly (70 ÷ 7 = 10). There's no `duration_weeks` field to compare it against, and no actual day count to compare it to, since there is no day content — but the one number present isn't contradicted by anything else on the record.

7. 🟢 **No migration drift, because there's nothing to migrate.** `enrollment:`→`user_enrollments` (0 = 0) and `progress:`→`user_program_progress` (0 = 0) shadow-table counts both match, trivially, since neither KV nor Postgres has any rows for this equip.
