# Mindfulness & Meditation — 8-week programme (content-free stub)

Pulled live from `equip:mindfulness-8week` on 2026-08-06. **✅ Deleted 2026-08-06**, same day
audited — confirmed 0 enrollments/progress/day-content/recommendation-rule references before
deleting both `equip:mindfulness-8week` and its `equip_slug:mindfulness-meditation` index entry.
Same empty-stub shape as CBT (see below), never actually launched. Left as a record of what was
found.

## Meta

| Field | Value |
|---|---|
| id | *absent* — the record has no `id` property at all (only `equip_id`, see Verification notes) |
| slug | `mindfulness-meditation` |
| title | `Mindfulness & Meditation` |
| category | *absent* |
| difficulty | *absent* |
| duration_days | `56` |
| duration_weeks | *absent* |
| is_paid | *absent* (no boolean flag; `price`/`currency` exist but nothing marks the program as paid) |
| price / currency | `99.99` / `USD` |
| expires_in_days_after_payment | `180` — dead field, zero references anywhere in the codebase (see Verification notes) |
| published | *absent* |
| featured | *absent* |
| can_repeat | *absent* |
| tags | *absent* |
| created_at / updated_at / published_at | *absent* |
| image_url / cover_image / thumbnail | *absent* |
| checkInConfig | *absent* |

**Full record, verbatim (every key that exists — there are only 8):**

```json
{
  "slug": "mindfulness-meditation",
  "price": 99.99,
  "title": "Mindfulness & Meditation",
  "currency": "USD",
  "equip_id": "mindfulness-8week",
  "description": "Learn mindfulness techniques and build a sustainable meditation practice over 8 weeks.",
  "duration_days": 56,
  "expires_in_days_after_payment": 180
}
```

**Content field used: none.** Unlike the three sibling programs already audited (which store per-day content in `daily_content`), this record has no `days`, `daily_content`, `week_structure`, `onboarding`, `onboarding_questions`, `checkInConfig`, `metadata`, or `tags` field — not even as an empty array/object. Confirmed via `jsonb_object_keys(value)`: the eight keys listed above are the entire object.

## Description (landing page)

> Learn mindfulness techniques and build a sustainable meditation practice over 8 weeks.

No subtitle, no metadata tiles, no eligibility copy exist on this record.

## Onboarding

None. Neither `onboarding` nor `onboarding_questions` is present on the record.

## checkInConfig

None. The field does not exist.

## Day-by-day content

**Zero days.** Checked every place program content could plausibly live:

1. **Inline arrays on the equip record itself** — `days`, `daily_content`, `week_structure` are all absent (not empty arrays; the keys don't exist).
2. **Legacy per-record `day:`/`block:` schema** — `select count(*) from kv_store_cc205da9 where key like 'day:%' and value->>'equip_id' = 'mindfulness-8week'` → **0**. (105 `day:` records exist in the table total, none reference this equip.) No `block:` record references this equip's days either, since there are no days to reference.
3. **Full-table text search** — `value::text like '%mindfulness-8week%'` across the entire `kv_store_cc205da9` table returns exactly **one** row: the equip record itself, plus the `equip_slug:mindfulness-meditation → mindfulness-8week` index entry. No `content:`, `content_item:`, `dataset:`, `day:`, or `block:` row anywhere references this id.

There is no authored content to reproduce for this program — it never had any days, in either the modern inline-array format or the older per-record format.

## Usage data (live enrollees)

### Enrollments (KV `enrollment:` records, keyed by `programId`)

**0 records.** `select ... from kv_store_cc205da9 where key like 'enrollment:%' and value->>'programId' = 'mindfulness-8week'` returns nothing. Postgres shadow table `user_enrollments` (`data->>'programId' = 'mindfulness-8week'`) also returns **0** — no drift, because there is nothing to drift.

### Progress (KV `progress:` records, keyed by `equip_id`)

**0 records.** Same for the `user_program_progress` shadow table: **0**.

### Recommendation rules

**0 records** with `value->>'equip_id' = 'mindfulness-8week'`.

No user has ever enrolled in, or made progress on, this program — consistent with there being no content for anyone to complete.

## Verification notes

1. 🔴 **This is not a functional program record — it is an 8-field pricing stub.** It does not conform to the `Equip` TypeScript interface (`shared-types.ts`) at all: `id`, `category`, `price_cents`, `status`, `created_at`, `updated_at` are all required fields on that interface and none of them are present here. The overlapping field names it does have (`slug`, `title`, `description`, `duration_days`) appear to be coincidental holdovers from an earlier schema, not evidence this record is compatible with the current program model.

2. 🔴 **The record is invisible through every normal admin/user path.** The public listing endpoint (`GET /equip/programs`) filters `programs.published === true`; this record has no `published` field, so it's silently excluded. The admin listing endpoint (`GET /admin/equip/programs`) calls `EquipService.listEquips()`, which filters `item.id && (item.slug || item.title)` (`program-service.ts:85`); since `item.id` is absent, this record is excluded there too. There is no screen in the app where an admin would see this equip exists — the only way to find it is a raw KV query, exactly as done for this audit.

3. 🟡 **Direct-by-id/slug fetch still resolves, but returns a broken shape.** `GET /equip/programs/mindfulness-8week` and `GET /equip/programs/mindfulness-meditation` both succeed, because `EquipService.getFullEquip()` calls `kv.get()` directly and bypasses the filters used by the list endpoints (`program-service.ts:174-176`). The response has `days: []` (from `listDaysForEquip` finding no `idx_equip_days:mindfulness-8week` index and no matching `day:` records) and **no `id` field at all**, since the stored value never had one. Any frontend code that assumes `program.id` exists (e.g. `equipUrl()`, enrollment calls that post `program.id`) would receive `undefined` if this ever got wired up to a link.

4. 🟡 **Legacy string id, checked for lookup mismatches as instructed — none found.** `equip_id: "mindfulness-8week"` predates the UUID convention used by the 3 sibling programs already audited. A full-table search for any KV value containing "mindfulness" turned up no enrollment, progress, or recommendation_rule record referencing this id under any alternate key/field. The legacy id isn't causing a hidden lookup bug here — the program simply has no usage data to mismatch.

5. 🟡 **`expires_in_days_after_payment` (180) is dead schema.** Zero references anywhere in the 25-file edge function or the frontend — whatever payment-expiry feature this field was built for was never implemented, or was removed without cleaning up this record.

6. 🟡 **A second, separate "mindfulness"-category equip is also broken — do not confuse it with this one.** `equip:73034a14-d2a1-4dc7-8ecd-1f8c9870cc6a` has `category: "mindfulness"`, `published: true`, and `daily_content: []`, but `title: ""`, `slug: ""`, `description: ""`, and `status: "draft"` (directly contradicting `published: true`). Its `name` field (a different key than `title`) reads `"Unburn"` and its `cover_image_url` filename is literally `...-stress.png` — this looks like an abandoned duplicate of the burnout-reset program (`equip:416feb50-…`) that someone started repurposing into a mindfulness program and never finished. It has 0 enrollments and is a different KV key from `equip:mindfulness-8week`, so it's unrelated to this doc's target, but it means there are currently **two** broken/contentless "mindfulness" equip records live in production simultaneously.

7. 🟢 **Not unique to mindfulness.** The other pre-UUID equip, `equip:cbt-10week` (slug `cognitive-behavioral-therapy`), has the exact same 8-field stub shape (`price: 149.99`, `duration_days: 70`, `expires_in_days_after_payment: 180`, no id/days/onboarding/etc.). Both legacy-id equips are content-free stubs, which points to this being an artifact of an early/abandoned schema generation rather than data loss specific to the mindfulness program.

8. 🟢 No migration drift to report — `enrollment:`→`user_enrollments` (0 = 0) and `progress:`→`user_program_progress` (0 = 0) match trivially, since neither side has any rows for this equip.
