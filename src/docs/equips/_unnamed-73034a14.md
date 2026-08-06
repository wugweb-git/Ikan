# Untitled duplicate — `equip:73034a14-d2a1-4dc7-8ecd-1f8c9870cc6a`

Investigated live from `kv_store_cc205da9` on 2026-08-06. **✅ Deleted 2026-08-06**, same day it was
found — confirmed 0 enrollments/progress in both KV and the Postgres shadow table immediately
before deletion, and confirmed via `GET /equip/programs` afterward that it no longer appears
publicly. Both `equip:73034a14-d2a1-4dc7-8ecd-1f8c9870cc6a` and the stale
`equip_slug:program-1767123350909` index key are gone. Left as a record of what was found and why
removing it was safe — see "Recommendation" below for the reasoning this decision was based on.

## What it is

An abandoned early duplicate of the "Unburn" program, superseded by the real one
(`equip:416feb50-e73f-4898-a996-f8a4695a708e`, slug `burnout-reset`, see
`burnout-reset.md`). This record was created 2025-12-30, four days before the
real Unburn record (2026-01-04) — it looks like a first attempt that got
abandoned mid-setup rather than deleted.

## Full record

```json
{
  "id": "73034a14-d2a1-4dc7-8ecd-1f8c9870cc6a",
  "name": "Unburn",
  "title": "",
  "slug": "",
  "subtitle": "",
  "description": "",
  "category": "mindfulness",
  "difficulty": "beginner",
  "duration_days": 28,
  "status": "draft",
  "published": true,
  "is_paid": false,
  "price": 0,
  "price_cents": 0,
  "currency": "INR",
  "featured": false,
  "can_repeat": true,
  "tags": [],
  "days": [],
  "daily_content": [],
  "week_structure": [],
  "section1_eligibility_points": [],
  "section2_bullets": [],
  "section3_content": [],
  "section4_benefits": [],
  "section4_notes": [],
  "onboarding_questions": [],
  "metadata": {},
  "cover_image": "",
  "thumbnail": "",
  "cover_image_url": "https://.../make-cc205da9-media/1767123393500-knw8s03r-stress.png",
  "created_at": "2025-12-30T19:36:39.593Z",
  "updated_at": "2026-01-02T08:12:44.119Z",
  "published_at": "2026-01-02T08:12:41.034Z"
}
```

Every content field is empty — `days`, `daily_content`, `week_structure`, all
section/metadata arrays. Only `name` ("Unburn"), `category`, `duration_days`,
`can_repeat`, and a stock cover image survive. There is no day/block content
to dump — nothing was ever authored beyond the shell.

## Correction to PENDING.md

PENDING.md describes this as a missing `equip_slug:` reverse-index entry.
That's not quite right: the index entry **does exist** —
`equip_slug:program-1767123350909` → `73034a14-d2a1-4dc7-8ecd-1f8c9870cc6a`
(the epoch in the key, 1767123350909, matches `created_at` to the second).
Someone later blanked the record's own `slug`/`title` fields but never
updated or removed the stale index key, so the two are now out of sync — the
index points at a record that no longer advertises the slug it's keyed under.

## It is live and broken, not just orphaned

`published: true`. The public endpoint `GET /equip/programs`
(`src/supabase/functions/server/equip-routes.ts` line 29) filters only on
`p.published === true` — it does not check for a non-empty title or slug.
**This record is currently returned in the public program list** and would
render as a blank/untitled card with an unusable URL (empty slug → broken
link) to any real visitor browsing programs right now. This is worse than
"unreachable" — it's a live, broken tile.

## No user data at risk

Zero matches for this id across `enrollment:` (`programId` and `equipId`),
`progress:` (`equip_id` and `equipId`), and `day:`/`block:` (`equip_id`/
`equipId`) — no enrollments, no progress, no day/block records reference it.
Safe to remove with no user-data impact.

## Recommendation

**Delete both records**: the `equip:73034a14-...` row and the stale
`equip_slug:program-1767123350909` index key. It's a content-free, never-
finished duplicate of a program that already shipped correctly under a
different id/slug, it has zero enrollments/progress, and leaving it live is
actively serving a broken card on the public site today — this is higher
priority than PENDING.md's framing suggests (not just an index-hygiene item).
Confirm no code path other than `equip_slug:` reverse-lookup references
`program-1767123350909` before purging (per `KEY_REGISTRY` rules in
`kv-audit-routes.ts`), then delete via the admin purge endpoint or direct SQL.
