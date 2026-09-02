# Thirty-two entries, three stores, two schemas, four doors

*Module 3 · read-only survey · live database 2026-09-02*

The daily check-in is the smallest system in this app and the one with the most copies of itself. One template, six vocabularies, three storage locations that hold 32, 31 and 25 rows of the same thing — and a dashboard button that sends users to a program that does not exist.

`db **jpfvoevxegnknxoqmwye** | branch **equip-carry-forward** @ **d2ac376c** | 32 entries · 7 users | last entry **2026-07-26**`

Seven of the 32 journal entries use an older shape — `mood` and `mood_score` instead of `mood_rating`, `entry_date` instead of `date`, `content` instead of `freehand_text_content`. Nothing declares the difference and nothing converts between them. The wellness score, the reassessment trigger and the dashboard all read the modern field names, so those seven entries are invisible: not deleted, not flagged, just never counted.

## 01 · How a check-in becomes an entry
*template → save_as → three stores*

*[diagram]* **Three writes, three different totals.** One save should land in all three places. It doesn't: one entry never reached `journal_by_user:`, and seven never reached the Postgres table. The mirror is best-effort by design — the write is wrapped so a failure can't block the save — which is defensible, and means the three counts drift silently.

> **[WARNING] The template exists twice — once in the database, once as a constant.**
>
> `MoodJournal.tsx` carries `FALLBACK_STEPS`: the same five steps, same questions, same subtitles, same scale keys, hardcoded. It renders whenever the template fetch hasn't returned. So an admin editing the check-in in the builder changes the database copy, and any user whose fetch is slow or fails sees the code copy instead — with no signal that they got a different questionnaire.

## 02 · The vocabulary and the template
*6 scales · 5 steps*

*checkin_template:default-daily-checkin — the only template that has ever existed*

| # | Question | Type | Scale | save_as | Required |
|---|---|---|---|---|---|
| 1 | How are you feeling? | emoji_scale | mood | mood_rating | yes |
| 2 | What's your energy like? | emoji_scale | energy | energy | no |
| 3 | Stress level? | emoji_scale | stress | stress_level | no |
| 4 | Anything on your mind? | free_text | — | freehand_text_content | no |
| 5 | What shaped your day? | multi_select | context_tags | context_tags | no |

Every `scale_key` resolves, and all six vocabularies match their lazy-seeded defaults exactly — no admin has edited a scale since they were created on 2026-07-26. **Sleep and pain are authored, clean and unasked**, which is why the entry schema carries `sleep_quality`, `pain_level` and `pain_impact` fields that are null on almost every row.

A note carried forward from the block survey, because it belongs here too: all five of these step types already exist in the Block taxonomy — `emoji_scale` is a `rating-scale`, `multi_select` is a `multi-select`, `free_text` is an `ephemeral-journal`. A Scale *is* a Block's option set, and a richer one — it carries value, severity, order and an active flag per option where a Block's options are plain strings.

## 03 · Two entry schemas under one prefix
*24 fields · 32 entries*

*Every field, and which schema it belongs to*

| Field | On the 23 modern entries | On the 9 legacy-keyed entries | Reading |
|---|---|---|---|
| user_id | 23 | 9 | Shared by both |
| id · created_at | 23 | 7 | Shared |
| mood_rating | 23 | 2 | **Modern.** Every consumer reads this and only this. |
| mood · mood_score | 0 | 7 | **Legacy.** Read by nothing. |
| date | 23 | 2 | **Modern.** The 30-day window filters on it. |
| entry_date | 0 | 7 | **Legacy.** Invisible to the window. |
| freehand_text_content | 23 | 2 | **Modern** free-text field |
| content | 0 | 7 | **Legacy** free-text field |
| energy · emotions · updated_at | 23 | 0 | Modern only |
| context_tags · stress_level | 18 | 0 | Modern, optional steps |
| sleep_quality · pain_level · pain_impact · extra_responses | 14 | 0 | Present as fields; **non-null on 4**. No template step collects them. |
| attachments · status · timestamp · associated_tracker_entry_id | 0 | 2–7 | Legacy only. Nothing reads any of them. |

> **[CRITICAL] Seven entries are invisible to every consumer.**
>
> The wellness score's mood lane filters on `e.date` and averages `e.mood_rating`. The reassessment trigger reads `e.mood_rating \\|\\| 3`. The legacy entries have neither field — they carry `entry_date` and `mood`/`mood_score`. So they fail the date filter, and if they somehow passed it they would default to a neutral 3.
>
> That is 22% of all journal data, held in the same prefix, with no marker distinguishing it. The Postgres mirror table is the only place that anticipated both — it has columns for `mood`, `mood_rating` *and* `mood_score`, `entry_date` and `content` — but nothing converts one shape into the other on the way in.

> **[WARNING] `freehand_text_content` is not always text.**
>
> Across 32 entries: a string on 19, **a bare number on 2**, and null or absent on 11. The current template's step 4 is `free_text`, so a numeric value there is unexplained — most likely an earlier template version whose numeric answer landed in this field. Anything rendering it has to type-check first.
>
> One entry's `extra_responses` holds a UUID-keyed answer that maps to no step in the only template that has ever existed — evidence of a template version that was deleted, or of a client-generated key that was never meant to resolve.

## 04 · Three stores, three counts
*32 · 31 · 25*

- **journal:{id}: 32** — the complete set · 7 users
- **journal_by_user:: 31** — one entry never mirrored
- **user_journal_entries: 25** — 7 KV rows never reached it
- **Date range: 2025-09-29 — → 2026-07-26** — nothing in the five weeks since

| Store | Key shape | Written by | Read by | Gap |
|---|---|---|---|---|
| **journal:** | journal:{id} — 23 rows — journal:{userId}-{date} — 9 rows | POST /user/journal | nothing directly | — |
| **journal_by_user:** | journal_by_user:{uid}:{date}:{id} — legacy: …:{uid}:{date} | POST /user/journal | GET /user/journal · **iKan wellness score** | 1 entry missing |
| **user_journal_entries** | Postgres row, kv_key back-reference | mirrorJournalEntryToTable — best effort | GET /user/journal, merged by id | 7 entries missing |

`GET /user/journal` merges the KV and table copies by entry id, table wins on conflict, and back-fills the table for anything it finds in KV but not in Postgres. So the read path is self-healing — but only for entries a user actually requests. The **wellness score does not go through that route**: it prefix-scans `journal_by_user:` directly, so the one unmirrored entry is invisible to scoring and always will be.

> **[WARNING] Two key shapes, and the older one overwrote on the same date.**
>
> Nine entries use `journal:{userId}-{date}` with no id suffix; twenty-three use `journal:{uuid}`. The comment on the write path names the reason for the change plainly: the old `journal_by_user:{userId}:{date}` shape **overwrote any earlier entry made the same day**. Every legacy-keyed row is therefore one entry per user per day at most — earlier ones on those dates are gone, not migrated.

## 05 · Four ways in, and one of them is broken
*entry points*

| Entry point | Where | What it opens | State |
|---|---|---|---|
| **Mood Journal screen** | /mood-journal | The 5-step template, inline | works |
| **Dashboard "Log your mood"** | Dashboard.tsx:592 | /equip-program-flow?id=tracker-daily-mood-v1 | that program does not exist |
| **Equip day check-in** | a day with dayType "check-in" | A preset with rules and defaults | preset exists · assigned to 0 days |
| **Milestone check-in** | ProgramCheckIn.tsx | 4 hardcoded questions, no store | disabled on both programs that configure it |

> **[CRITICAL] The dashboard's primary mood CTA points at nothing.**
>
> When a user hasn't logged today — the default state for almost everyone, almost always — the dashboard's check-in card routes to `/equip-program-flow?id=tracker-daily-mood-v1`. That id comes from a constant, `SPECIAL_PROGRAM_IDS.DAILY_TRACKER`, and **no record with that id or slug exists in the database**. The sibling constant, `utility-onboarding-v1`, doesn't exist either.
>
> Once the user *has* logged today, the same card correctly routes to `/mood-journal`. So the working path is the one you only reach after using the broken one.

Naming, stated once so it stops being re-derived: **three different things in this codebase are called a check-in.** The Mood Journal's daily check-in (template-driven, this module). The `check-in` day preset (block-driven, assigned to nothing). And `ProgramCheckIn.tsx`, the milestone modal on program days 7/14/30 — four hardcoded questions, no store, no admin surface, and `enabled: false` on both programs that configure it at all.

## 06 · What consumes mood data
*3 readers*

| Consumer | Reads | Uses | Blind to |
|---|---|---|---|
| **iKan Wellness Score** — 20% of the composite | journal_by_user: prefix scan | 60% mood rating wellness + 40% logging consistency (% of last 30 days with an entry) | the 7 legacy entries · the 1 unmirrored entry |
| **Reassessment triggers** | recent entries | 5 consecutive logs at `mood_rating ≤ 2`, or a drop of 2+ against a 4-entry baseline | the 7 legacy entries — they default to a neutral 3 |
| **Dashboard** | GET /user/journal, today only | "Mood logged for today" state and the activity feed | — |

The consistency half of the mood lane is worth naming: it scores **% of the last 30 days with an entry**, capped at 100. With the most recent entry dated 2026-07-26, every user's mood component today computes from zero recent entries — which means the lane contributes nothing and its 20% weight redistributes across the other three.

> **[WARNING] Mood reminders are a profile setting with no implementation.**
>
> The user profile carries `preferences.moodReminders`. A repo-wide grep for that name and its snake_case variant returns nothing outside the profile form itself. The reminder system that does exist (`reminder-routes.ts`, `reminder:last:`) sends emails about **stale equip enrollments** — not about logging a mood.

## 07 · Standing open
*no fixes applied*

- **Two entry schemas share one prefix.** Seven of 32 entries use `mood`/`mood_score`/`entry_date`/`content`; every consumer reads `mood_rating`/`date`/`freehand_text_content`. 22% of the data is silently uncounted.
- **Three stores, three counts** — 32, 31 and 25. One entry never reached `journal_by_user:`, so the wellness score can never see it; seven never reached the Postgres table.
- **The dashboard's main "Log your mood" button routes to a program that doesn't exist** (`tracker-daily-mood-v1`). So does the constant beside it, `utility-onboarding-v1`.
- **The template exists twice** — as the KV record and as `FALLBACK_STEPS` in the component. An admin edit changes one of them.
- **`freehand_text_content` holds a number on 2 entries** and text on 19.
- **One entry's `extra_responses` keys a step that no template has ever had.**
- **The sleep and pain scales are authored, clean and unasked.** Their entry fields sit null on nearly every row, and `pain_level`/`sleep_quality` are non-null on only 4 — from a collection path that no longer exists.
- **The old key shape overwrote same-day entries.** Nine rows predate the fix; any earlier entry a user made on those dates is gone, not migrated.
- **Mood reminders are a profile toggle with no implementation.**
- **Three unrelated systems are called "check-in."** The daily template, the `check-in` day preset (assigned to zero days), and the milestone modal (disabled everywhere it's configured).
- **No entries since 2026-07-26.** The mood lane of the wellness score currently contributes nothing for every user, and its weight silently redistributes.
- **The check-in never became a Block.** All five step types map onto existing subtypes; the builder still renders its own hardcoded list and `MoodJournal.tsx` its own six-case switch.

---

**Method.** Entry counts, field distributions, key-shape splits, schema membership and store gaps come from read-only SQL against `kv_store_cc205da9` and `user_journal_entries` on 2026-09-02. Scale and template contents read from their live records. Flow, fallback, save mapping and consumer behaviour read from `MoodJournal.tsx`, `mood-routes.ts`, `scales-routes.ts`, `ikan-score-routes.ts`, `reassessment-triggers.ts` and `Dashboard.tsx` at `d2ac376c`. The missing program ids were checked by direct key and slug lookup. No writes were made.

**Where this differs from the repo docs.** `mood-checkin.md` reports 5 `mood:` entries and 32/31 journal rows, which still hold — but it does not record the second entry schema, the Postgres mirror as a live read path, the 7-row mirror gap, or the broken dashboard route.

**Not established.** Where the 4 non-null `pain_level` and `sleep_quality` values came from, given no template step collects them. Whether the numeric `freehand_text_content` values and the orphaned `extra_responses` key came from the same deleted template version.
