# Mood Journal, Check-in Scales, and the Check-in Builder

Pulled live from Supabase project `jpfvoevxegnknxoqmwye` on 2026-08-06, **fixed the same day**.
Full verbatim content of every record below — not a summary. This covers three KV-backed systems
that share the "rate how you feel" concept but are three distinct code paths, verified end-to-end
(every relevant KV prefix's real record count checked, every route traced to its actual frontend
caller — not assumed from route names or comments) after an earlier pass on assessments missed two
live content bugs by checking only the "used" subset instead of everything.

## Status: fixed, re-verified clean

| Area | Status |
|---|---|
| `mood_type:` / `AdminMoodManager.tsx` dead admin path | ✅ **Fixed 2026-08-06** — see below |
| Duplicate `/moods` route registrations (`index.tsx`, 3 full sets, 2 dead) | ✅ **Fixed 2026-08-06** — see below |
| `checkin_scale:` (5 records) | ✅ Clean — real content, no placeholders |
| `checkin_template:` (1 record) | ✅ Clean — real content, no orphaned `scale_key` refs |
| `mood:` (5 records) | ✅ Clean — real content |
| `journal:` / `journal_by_user:` (32/31 records, 2 key shapes) | ✅ No data loss — every legacy record has its mirror |
| `freehand_text_content` type inconsistency (string vs. number vs. null) | 🟡 Open, minor — see note 5 |
| One `extra_responses` entry with an orphaned UUID key | 🟡 Open, minor — see note 6 |
| `checkInConfig` wrongly documented as linking to `checkin_template:` via `scale_key` | ✅ **Corrected 2026-08-06** — it doesn't; see below |

**Restated per the Block reframe (2026-08-06):** Mood Journal doesn't need a dedicated "Check-in
Builder" as a fourth system — the target shape is Scales (vocabulary) + Blocks (rendering), the
same two ingredients Equip and Assessment already use. `AdminCheckinTemplateBuilder.tsx` is kept
below exactly as it stands today (still a separate hardcoded system, not yet migrated), but see
`block-architecture.md` (§13) for the corrected target model and why "Check-in Builder" as its own
concept goes away once that migration happens.

## The systems, and how they actually relate (verified, not inferred from names)

| System | KV prefix(es) | Backend | Frontend |
|---|---|---|---|
| Check-in Scales | `checkin_scale:` (5 records) | `scales-routes.ts` | `AdminCheckinScalesManager.tsx` (admin), `emoji-utils.ts` (player) |
| Mood scale (shared) | `mood:` (5 records) | `scales-routes.ts` (`/scales/moods`) | `AdminCheckinScalesManager.tsx`'s "Mood" tab (admin, added 2026-08-06), `emoji-utils.ts` (player) |
| Check-in Builder | `checkin_template:` (1 record) | `checkin-template-routes.ts` | `AdminCheckinTemplateBuilder.tsx` (admin), `MoodJournal.tsx`/equip check-ins (player) |
| Mood Journal (entries) | `journal:`, `journal_by_user:` (32/31 records, 2 key shapes) | `mood-routes.ts` (`/user/journal`) | `MoodJournal.tsx` |

- **Check-in Scales are vocabulary, not a flow.** Each of the 5 holds a 5-point emoji/label
  definition (full content below).
- **The mood scale lives at a bare `mood:{id}` prefix, not `checkin_scale:mood`.** `scales-routes.ts`
  deliberately keys mood options there, lazy-seeding 5 defaults on first read if empty — these 5
  were seeded 2026-07-26 and are still exactly the defaults (no admin drift).
- **The Check-in Builder composes scales into a flow.** The single `checkin_template:default-daily-checkin`
  record has 5 ordered steps, each pointing at a real scale via `scale_key`. `MoodJournal.tsx` is
  the only real renderer of this template.

**Correction, 2026-08-06:** an earlier version of this doc (and the artifact's §04 equip diagram)
claimed an equip's `checkInConfig` connects to `checkin_template:` via a `scale_key` field. Re-verified
while writing `block-architecture.md` (§13) — `checkInConfig` (`enabled`/`triggerDays`/
`triggerOnLastDay`/`customTitle`) has no `scale_key` field, and `grep`ing the whole repo for
`scale_key` confirms it exists only on `checkin_template:` steps, never on an equip record. The
component `checkInConfig` actually triggers is `ProgramCheckIn.tsx` — a completely separate,
milestone-day check-in modal with 4 hardcoded questions and no relation to `checkin_template:`,
`checkin_scale:`, or Blocks at all. See §13 for the full writeup; corrected here so this doc doesn't
keep repeating the wrong edge.

## ✅ Fixed: `AdminMoodManager.tsx` no longer edits into a dead prefix

**Original bug** (found 2026-08-06, fixed same day): the real, user-facing mood picker
(`MoodJournal.tsx`, the check-in flow's "mood" step) gets its options from `GET /scales/moods`
(`mood:` prefix). The admin screen for editing mood types, `AdminMoodManager.tsx`, called a
completely different endpoint (`/moods`, backed by `mood_type:`) which had **zero records** and
silently fell back to a hardcoded, different 5-mood set baked into the route file. Any admin edit
went into `mood_type:`, which the live app never read — saves appeared to succeed and changed
nothing a real user ever saw.

**Fix applied:**
1. Added a "Mood" tab to `AdminCheckinScalesManager.tsx` (`SCALE_TYPES`, pointed at
   `/scales/moods`) — this component is already generic and data-driven, so this was a one-entry
   addition, not new logic. It now correctly reads and writes the real `mood:` records.
2. Deleted `AdminMoodManager.tsx` entirely.
3. Removed the `mood_type` tab special-case from `AdminCategoryManager.tsx` (`isMoodTab` branch),
   which used to embed `AdminMoodManager` inline for that one metadata type.
4. Removed the dead `GET/POST/PUT/DELETE /moods` handlers from `mood-routes.ts` (backed by
   `mood_type:`) — kept `/user/journal`, which is real and unrelated.
5. Removed `mood_type` from `src/admin/catalog/metadata-catalog.ts` (renamed from `metadata-seed.ts` the same
   day — see that file's own header) — its `MetadataType` union, labels, icons, groups, and 8 seed
   entries (`Happy/Calm/Sad/Anxious/Angry/Stressed/Tired/Grateful` — yet a **third**, independently
   invented mood vocabulary that was never live; the seed file's own header comment had already
   flagged these as "reference tags only," never actually synced).
6. **Also found and fixed while verifying**: `index.tsx` had its *own* independent set of
   `/moods`/`/moods/:id` routes — three full GET/POST/PUT/DELETE registrations layered on top of
   the two above (`mood-routes.ts`'s now-removed set, plus two separate sets inside `index.tsx`
   itself, one of which a prior cleanup pass had already partially deduped per an in-code comment:
   *"Get all moods — REMOVED duplicate; canonical handler is in MOOD TYPE MANAGEMENT section
   above"*). Unlike the `mood_type:` bug, these were **not a data-correctness bug** — every one of
   them correctly used `mood:{id}` — just dead, duplicate code from route-registration order (Hono
   matches the first-registered handler for a given method+path; the rest never execute). Removed
   the fully-dead `POST/PUT/DELETE /moods` block in `index.tsx` (~80 lines), kept the
   first-registered (reachable) versions and the one genuinely unique `GET /moods/:id` handler.
7. Both the edge function and frontend were redeployed and smoke-tested — `GET /moods` now returns
   the real 5 records (`Awful, Bad, Meh, Good, Great`), and `GET /equip/programs/x/days` (an
   unrelated dead route removed earlier the same session) correctly 404s, confirming the deploy
   picked up all of the above.

## Mood Journal entries: two key shapes coexist, no data loss

`journal:` (32 records) and `journal_by_user:` (31 records) is two coexisting key shapes, not
drift — same failure mode as `enrollment:` / `day:`+`block:` elsewhere in this codebase:

- **Legacy shape**: `journal:{userId}-{date}` and `journal_by_user:{userId}:{date}` (no id
  suffix) — 2 confirmed records, identical content in both prefixes.
- **Modern shape**: `journal:{id}` and `journal_by_user:{userId}:{date}:{id}` (id-suffixed) — the
  rest of the 30/29 records.

Every legacy-shape record has its mirror. No data loss.

---

## Full content — Check-in Scales (`checkin_scale:*`, 5 records)

**`checkin_scale:energy`**
| id | emoji | label | value | order | severity |
|---|---|---|---|---|---|
| exhausted | 🪫 | Exhausted | 1 | 1 | danger |
| tired | 😴 | Tired | 2 | 2 | warning |
| moderate | ⚡ | Moderate | 3 | 3 | neutral |
| energetic | 💪 | Energetic | 4 | 4 | success |
| charged | 🔥 | Charged! | 5 | 5 | success |

**`checkin_scale:stress`**
| id | emoji | label | value | order | severity |
|---|---|---|---|---|---|
| chill | 😌 | Chill | 1 | 1 | success |
| mild | 🤔 | Mild | 2 | 2 | info |
| medium | 😤 | Medium | 3 | 3 | warning |
| high | 😰 | High | 4 | 4 | warning |
| extreme | 🤯 | Yikes! | 5 | 5 | danger |

**`checkin_scale:sleep`**
| id | emoji | label | value | order | severity |
|---|---|---|---|---|---|
| terrible | 😩 | Terrible | 1 | 1 | danger |
| poor | 😴 | Poor | 2 | 2 | warning |
| fair | 😶‍🌫️ | Fair | 3 | 3 | neutral |
| good | 😌 | Good | 4 | 4 | success |
| excellent | 🌟 | Excellent | 5 | 5 | success |

**`checkin_scale:pain`**
| id | emoji | label | value | order | severity |
|---|---|---|---|---|---|
| none | 😊 | None | 1 | 1 | success |
| mild | 😐 | Mild | 2 | 2 | info |
| moderate | 😕 | Moderate | 3 | 3 | warning |
| severe | 😧 | Severe | 4 | 4 | danger |
| extreme | 😭 | Extreme | 5 | 5 | danger |

**`checkin_scale:context_tags`** (no value/severity — multi-select tags, not a severity scale)
| id | emoji | label | order |
|---|---|---|---|
| work | 💼 | Work | 1 |
| sleep | 😴 | Sleep | 2 |
| health | 🏃 | Health | 3 |
| relationships | ❤️ | Relationships | 4 |
| studies | 📚 | Studies | 5 |
| finances | 💰 | Finances | 6 |
| fun | 🎉 | Fun | 7 |
| other | ✨ | Other | 8 |

All 5 match `scales-routes.ts`'s `DEFAULT_*` constants exactly — confirms no admin has ever edited
these away from the lazy-seeded defaults.

## Full content — mood scale (`mood:*`, 5 records)

| id | char | label | value | order | color |
|---|---|---|---|---|---|
| awful | 😫 | Awful | 1 | 1 | `var(--color-status-danger)` |
| bad | 😕 | Bad | 2 | 2 | `var(--color-status-warning)` |
| meh | 😐 | Meh | 3 | 3 | `var(--color-neutral-500)` |
| good | 🙂 | Good | 4 | 4 | `var(--color-status-success)` |
| great | 😄 | Great | 5 | 5 | `var(--color-status-success)` |

All 5 carry a `twemoji` filename field (e.g. `1f62b.svg` for Awful) and `is_active:true`; seeded
2026-07-26T01:29:13Z, never edited since (`updated_at` matches `created_at` on every record).

## Full content — Check-in Builder (`checkin_template:default-daily-checkin`, 1 record)

> "A quick mood & wellbeing check-in" — active, created 2026-07-26 by `system`.

| # | step id | type | question | subtitle | scale_key | required |
|---|---|---|---|---|---|---|
| 1 | mood | emoji_scale | How are you feeling? | Tap the emoji that matches your vibe | `mood` | Yes |
| 2 | energy | emoji_scale | What's your energy like? | From drained to fully charged | `energy` | No |
| 3 | stress | emoji_scale | Stress level? | Be honest — there's no wrong answer | `stress` | No |
| 4 | note | free_text | Anything on your mind? | A quick note to capture this moment | — | No |
| 5 | tags | multi_select | What shaped your day? | Pick whatever applies — or skip to save | `context_tags` | No |

Every `scale_key` resolves to a real record above. No orphaned references, no placeholder copy.

## Mood Journal entries — schema and real samples

Every entry (both key shapes) carries: `id`/`journal_entry_id`, `date`, `user_id`, `mood_rating`
(1-5), `energy` (1-5), `stress_level` (1-5), `context_tags` (array), `emotions` (array — usually
duplicates `context_tags`), `freehand_text_content`, `extra_responses` (object), `created_at`,
`updated_at`. `pain_level`/`pain_impact`/`sleep_quality` exist as fields but were `null` on every
sample pulled — the active check-in template (above) never asks for them, so they're vestigial for
the current flow, not broken.

Real samples (test/dev account, `freehand_text_content` values like "testing"/"done" confirm this):

```json
{
  "id": "0bcedeb3-050a-4e17-ab32-96c164ae1adb",
  "date": "2026-07-26", "mood_rating": 3, "energy": 3, "stress_level": 2,
  "context_tags": ["Relationships"], "emotions": ["Relationships"],
  "freehand_text_content": "done", "extra_responses": {}
}
{
  "id": "c299032a-11c0-4eff-95cb-191c06d768b4",
  "date": "2026-07-21", "mood_rating": 3, "energy": 5, "stress_level": 4,
  "context_tags": [], "emotions": [],
  "freehand_text_content": 5,
  "extra_responses": { "8b98358d-189c-46f9-84f1-63336ff8947f": "Lol" }
}
```

## Verification notes

1. No placeholder/test/truncated content found in `checkin_scale:*` or `checkin_template:*` —
   unlike the assessment content bugs found earlier, these are clean.
2. The `mood:` vs `mood_type:` split was the same "two representations, only one is live" pattern
   as the equip day/block dead REST API and the duplicate category CRUD found elsewhere this
   session — except here the dead one was reachable from a real, shipped admin screen, not an
   orphaned API route nobody called. Fixed 2026-08-06.
3. Given the earlier miss on Stress/Burnout, every count in this file was checked against
   `jsonb_array_length`/`count(*)` queries before writing anything, not assumed from route names or
   code comments — several of which (the `scales-routes.ts` "same as AdminMoodManager" comment)
   turned out to be wrong.
4. `index.tsx`'s duplicate `/moods` route registrations (3 full sets total across the codebase, 2
   fully dead) were found and cleaned up while verifying the fix above — not a data bug, pure dead
   code from Hono's first-match routing, but worth knowing about if this area is touched again.
5. 🟡 **Open, minor**: `freehand_text_content` is stored inconsistently — a string in most entries
   (`"done"`, `"testing"`), but a bare number (`5`, `3`) in at least 2 samples pulled. The current
   check-in template's "note" step is `free_text`, so a numeric value there is unexpected — possibly
   an older template version had a numeric step whose answer landed in this field, or a client-side
   bug merges an unrelated numeric value in occasionally. Not chased further — flagging for whoever
   owns the check-in flow, since it means `freehand_text_content` can't be trusted to always be
   displayable as text without a type check.
6. 🟡 **Open, minor**: one journal entry's `extra_responses` has a UUID-keyed answer
   (`"8b98358d-189c-46f9-84f1-63336ff8947f": "Lol"`) that doesn't correspond to any step id in the
   current single `checkin_template:default-daily-checkin` record. Since only one template has ever
   existed in this KV table, this is either a client-generated key that was never meant to map to a
   template step, or evidence of an earlier template version that's since been deleted. Low
   priority — doesn't affect the current flow, just an unexplained field on old data.
