# Resources

Pulled live from Supabase project `jpfvoevxegnknxoqmwye` on 2026-08-06. The simplest system audited
this session — a plain CRUD content library, not a Block/Builder consumer. Included for completeness
of the KV footprint (`schema-relations.md` already covers its one relation to `category:`).

## What it is

An admin-authored article library — 9 real records, each a title + rich-text `content` blob +
`category` (a slug string, matched laterally against `category:` records — the "side mapping"
relation documented in `schema-relations.md`, not a parent-id reference). No `type` field is
populated on any live record despite `content_type`'s Metadata Catalog values including `resource`
as an option — every resource here is implicitly an article; nothing in the schema currently
distinguishes article/video/audio/etc. at the resource level (`filter_type`'s 9 values — article,
audio, course, exercise, guide, podcast, tool, video, workbook — exist in the Metadata Catalog but
aren't wired to a `resource.type`/`resource.filter_type` field; not verified further here since
resources aren't the focus of the Block/Builder work this section follows).

| Piece | Location |
|---|---|
| Backend | `resource-routes.ts` |
| Public read | `GET /library/resources` (list, computes view counts), `GET /library/resources/:id` (detail) |
| View tracking | `POST /library/resources/:id/view` → `resource_view:{id}-{timestamp}` |
| Admin CRUD | `GET/POST/PUT/DELETE /admin/resources` |
| Frontend | `Library.tsx` (list, filters `published !== false` client-side), `ResourceDetail.tsx` (detail + "related" rail) |

## Live content (2026-08-06)

| Title | Category | Published |
|---|---|---|
| Physical Health is measured. Why should mental health be any different? | `mental-health` | ✅ |
| Prioritizing Mental Wellness: The Importance of Routine Mental Health Check-Ups. | `mental-health` | ✅ |
| The Late Night Tax: How Bad Sleep Impacts Your Long Term Health. | `sleep` | ✅ |
| The PHQ-9 Advantage: Enhancing Depression Care for All. | `general` | ✅ |
| Wake Up to Better Sleep: The Power of SCI. | `sleep` | ✅ |
| Stress Scan: First Step In Mastering Stress. | `general` | ✅ |
| Just keep walking! | `general` | 🔲 unpublished |
| The Power of Measurement-Based Care | `stress` | ✅ |
| Beyond the "Worry Loop": How the GAD-7 | `sleep` | ✅ |

All 9 categories (`mental-health`, `sleep`, `general`, `stress`) resolve cleanly against the live
`category:` slugs — **zero orphaned resource→category references.**

## What checked out clean

- **`resource:` → `category:` relation**: 0 of 9 orphaned (verified against the live `category`
  type's 19 slugs, not assumed).
- **`resource_view:`**: 0 live rows — the view-tracking endpoint is real and wired up
  (`POST /library/resources/:id/view` → list endpoint's `viewCountMap` join), simply unused so far;
  not a bug, no traffic yet.
- **`library:resource:`** (the registry's flagged "deprecated mirror — any key here is a
  regression"): 0 live rows — confirmed clean, no regression.
- **Client-side publish filtering**: `Library.tsx` correctly excludes `published: false` resources
  from the list (`.filter(r => r.published !== false)`); the one unpublished record does not appear
  in the library.

## 🟡 Minor, not fixed: unpublished resources are still reachable by direct id

`GET /library/resources/:id` (used by `ResourceDetail.tsx`) has no `published` check — it returns
whatever's stored regardless of publish state. The one unpublished resource ("Just keep walking!")
is correctly hidden from the list but still fully viewable if someone has (or guesses) its id/URL.
Not fixed here — this may be intentional preview-by-link behavior rather than a bug (common in
lightweight CMS setups), and no admin surface currently generates or shares such a link, so there's
no live exposure path today. Flagging for a decision, not treating as broken.

## Verification notes

1. All 9 records and their `category`/`published` fields read directly from `kv_store_cc205da9`,
   not from the admin UI.
2. The `resource:` → `category:` relation check cross-referenced against the live `category` type's
   slug list pulled the same session (`schema-relations.md`'s footprint query), not against a cached
   or assumed list.
3. `resource_view:` and `library:resource:` counts are direct `count(*)` queries, not estimates.
