# Changelog — iKan Health

Dated record of what shipped and why. See `GOVERNANCE.md` for the rule that keeps this updated, and
`PENDING.md` for what's still open. Reverse chronological.

Entries before 2026-08-05 are reconstructed from `src/docs/KNOWN-ISSUES.md` (now retired — its
Sessions 1–13 log became this file) and are dated by commit history where available, otherwise left
undated under their original session number.

---

## 2026-09-08 (later)

**The results page got real slots, and the last two hardcoded recommendation
tables went.** B3, B4 and B5. Frontend deployed and verified; typecheck 183,
tests 152, build clean.

### Articles and follow-up assessments are different offers

Every rule-authored secondary rendered as one generic button row, and each row
printed the rule's title **twice** — once as its own uppercase eyebrow, once as
its body — because the engine set `title` and `label` to the same string. They
now split by `recommendation_type`: follow-ups render as `AssessmentCard`,
articles as `ResourceCard`, stacked at one or two and a carousel at three or
more. The carousel is `ui/carousel.tsx`, a generic embla wrapper that had been
in the repo imported by nothing.

### Adjacent programmes come from rules now

`DEFAULT_OVERLAP_MAP` and `DEFAULT_ESCALATION_RULES` are deleted. They covered
three categories of seven, so anxiety, depression, balance and general could
never show an adjacent programme at any score and no admin could give them one.
Both were seeded from constants and **never once overridden**: the
`overlap_map` / `escalation_rules` fields their loader read for do not exist on
any rule record and never have. Adjacent programmes are now the equip rules
ranked below the primary.

### `resource-presentation.ts`

The stored record does not use the field names the card declares — it carries
`thumbnail`, not `image`, on 9 of 9 rows — so reading `record.image` yields
undefined and renders an empty image well, silently. `Library.tsx` had worked
the chain out already; it is now extracted, tested and shared rather than
copied. Same class of defect as `equip_name` vs `title`.

> **A regression I shipped, live for one deploy.** Fixing the "5" read-time
> display, I wrote `.trim()` on `readTime` — which is stored as the **number**
> 5, not the string. Library threw and rendered "0 resources found". I had read
> the field through SQL's `value->>'readTime'`, which renders it as text and
> hides the type completely, then wrote the test with a string, so it passed.
> Caught by loading the page. Coerced with `String()`, regression test added.
> The lesson is the day's lesson again, one level down: `->>` is a cast, so
> reading a KV field through it tells you nothing about the type the code sees.

Also from B3's guard list: `EquipBlock` treats an explicit `buttonText=""` as
unset (a default only fires on `undefined`, so a blank CMS field rendered an
arrow with no words), and `AssessmentBlock` finally destructures `subtitle`,
`seeMoreText` and a new `seeMoreRoute` — all declared on its props and silently
ignored, its trailing CTA hardcoded to `/assessments`.

**Still content, not code:** `Productivity Reset` is targeted by none of the 18
rules, and no article is tagged `depression`, `anxiety`, `burnout` or `balance`,
so those four assessments have no article to show even once rules carry copy.

---

## 2026-09-08

**Recommendation rules stopped showing users the author's private notes, and the two engines
became one.** Both halves deployed and verified; edge function v342, all 39 files byte-identical
to HEAD. Typecheck 183, tests 138, build clean.

### `rationale` was never copy

A rule carries a `rationale` — the author's note to another clinician. The live rows hold
"Awareness of overload" and "Work-life recalibration". Four `|| rule.rationale` fallbacks were
substituting it into user-facing slots: `severityMessage`, `primaryAction.body` and both
secondary-action labels on the client, plus `reason` over the API on the server. The sentence a
person read after finishing a mental-health assessment was a memo addressed to someone else.

All five removed. `rationale` is stored and shown in admin; it is no longer rendered anywhere.
Two stored results carried it and were nulled (4 KV rows with their `:latest` twins) — backup
`backup_pre_rationale_null_2026_09_08`.

### A rule with nothing to say cannot match

`hasRenderableCopy` requires `title`, `body` and `cta`. This guards the **read** path, so a row
written by a bulk import or a direct KV write cannot leak a blank-headed card with an unlabelled
button either. All 18 rules were disabled pending copy — backup
`backup_pre_rule_disable_2026_09_08`.

### One matching module, because the copies disagreed

The client and server engines each had their own matching, and they read `priority` in opposite
directions: the client ranks DESCENDING (a bigger number is stronger, which is how all 18 rows are
written), the server sorted ASCENDING and its own comment called the lower number "higher
priority". Same field, same data, opposite meanings, both live.

Deleting the server copy was not available — `GET /recommendations` has two consumers, Dashboard
and EquipProgramCompletion. `recommendation-ranking.ts` moved to
`server/recommendation-matching.ts` and gained `eligibleRules` + `hasRenderableCopy`.

**It lives under `server/` for a deployment reason.** The edge function ships by
`cp src/supabase/functions/server/*` — a flat copy of one directory — so a shared module anywhere
else builds fine locally and is *absent at runtime*, failing inside a deployed function rather
than in the build. The client reaches in, the direction `scoring-vocabulary.ts` already set.

Three more live defects the extraction surfaced:

- **The server never honoured `enabled`.** The word does not appear in the file. Disabling all 18
  rules silenced the results screen while this endpoint went on serving them to the dashboard and
  the completion screen. Eligibility now lives in the shared module, so neither engine can miss it.
- **`recommendation_type` was ignored** and every `target_id` treated as an equip id, so the first
  resource or assessment rule anyone wrote would have rendered a dead card.
- **`equip_name` vs `title`/`name`.** `EquipProgramCompletion` reads keys the endpoint never sent,
  so every card on that screen has always read "Recommended Program" with no description — a plain
  field-name mismatch, unrelated to rules, predating all of this work.

Also dropped the server's second `SEVERITY_RANK`/`compareSeverity`/`isSeverityLevel`, and taught
`shared-types` the copy fields it never knew existed.

> **Verification note.** "18 of 18 disabled" was confirmed from the KV rows and from the client,
> and reported as the leak being closed. It wasn't: the server engine ignores `enabled`, on a path
> already recorded as having two live consumers. Confirming a state is not confirming a behaviour.
> `scoring-vocabulary.ts` had also sat in the repo undeployed since before v341 — nothing imported
> it, so it was inert, but the repo and the deployed function had quietly diverged.

---

## 2026-09-08

**The Block Type Viewer became the blocks module's source of truth.** It read the catalog and
nothing else, so every declared term looked equally alive. It now maps each one against the 407
live blocks in `equip:`. Edge function deployed and smoke-tested; frontend deployed. Typecheck 183,
lint 914, tests 81 passing. Verified by rendering the page, not by typecheck.

### A usage feed

`GET /blocks/usage` (`requireAdmin`, read-only) counts `type`, `activityConfig.subtype` and
`interaction` across `equip:` — the representation the editor and player actually read. It also
counts **`dayType`**, because a stage is never a block's `type`: counting blocks against
`learning` reads zero and libels the stage as unused. A stage's usage is the days that carry it.

`getBlockUsage()` returns `null` rather than an empty shape on failure. The viewer must be able to
say *usage unavailable* instead of printing a confident zero next to every term, which is
indistinguishable from genuinely unused and is the exact mistake this feed exists to stop.

### Four columns, four statuses

Every row on all three lists now reads **Declared · Live count · Renders as · Status**:

| status | meaning |
|---|---|
| Live | declared, read by code, and blocks carry it |
| Wired, unused | declared and read, but zero blocks carry it |
| Declared, unread | in the catalog; no code reads it |
| Orphan | code reads it; not declared |

The page's purpose is that nothing hides in the last three. Two things surfaced immediately:
ten of eleven stages read `0 days` (only `learning` is assigned), and `watch` has no renderer —
`BlockRenderer` falls it through to the lesson view.

### The interactions tab is back

It was the **default** landing view, not a secondary tab; its render code survived a deletion and
sat orphaned. Re-attached rather than rebuilt.

`previewHint` — the only written record of what each interaction draws — was recovered from
`040a4cfe^` and re-hung off `INTERACTION_META`, keyed on the interaction instead of the hardcoded
block list it used to duplicate. Seven strings recovered cleanly; the other six had no recovered
documentation, so they were written from `BlockRenderer` and carry `hintSource: 'written'` —
the page badges which is which rather than passing invention off as recovery.

`exercise` is special-cased: derived through the resolver it claimed all 187 exercise blocks draw
a textarea, because a bare `exercise` with no activity resolves to `write`. It now says its
appearance depends entirely on its activity.

### `activityConfig.key` is read (task 6.1)

98 live blocks carried a response key. It was **undeclared on the type and read by no code** — so 14
keys shared across 51 blocks, e.g. `sleep_quality_day1` on days 1-7 of Sleep Tight under seven
different block ids, were being split into unrelated per-day answers.

- Declared on `ActivityConfig`, through `configOf` so the 906 blocks still stored under
  `exerciseConfig` keep their identity.
- `responseKeyOf(block)` is the single definition of response identity: the key if there is one,
  otherwise the block id. Total by construction, so no caller branches on presence.
- `ProgramPlayer.priorEntriesFor` matches prior days on identity instead of block id, and a shared
  key now stands in for `repeat` as the declaration of a series. Blocks with no key keep the exact
  previous behaviour.

It landed on the viewer with its live counts, which is where the second finding showed up:
**no live block declares `repeat` — zero of 407.** `simple_repeat`, `column_addition`, `on_demand`
and `columnsByDay` have never run on production content. A shared key is how repetition is actually
expressed in this database, so the path that was unreachable now has one that is not.

### `content-hierarchy.ts` is read by production code (task 6.2)

The target model — `INTERACTION_REQUIREMENTS`, `missingRequirements`, the `Block` shape — was
imported by its own test and nothing else. It is the module's only written statement of what each
interaction needs, so rather than restate it in an editor it now runs against production content.

- **`blockOf(activity)`** is the strangler seam actually being crossed: it reads a live `Activity`
  in the target shape, mapping every stored spelling (`tableColumns` → `columns`, `listItems` →
  `items`, `acceptedFileTypes` → `accepted_types`) in one place.
- `/blocks/usage` sends **field-presence facts only** — which config keys carry a value — grouped
  by signature. The edge function is deployed from a copied directory and cannot import the
  requirements table; copying it there is how two vocabularies become six.
- Each interaction row now prints what it requires, what it produces, and how many live blocks
  fall short of it.

What that immediately reported, all of it true:

| interaction | live blocks short |
|---|---|
| `input-table` | 107 have no `key` |
| `select-one` | 18 have no `scale_ref`, 6 no `key` |
| `select-many` | 17 have no `scale_ref`, 4 no `key` |
| `check` | 5 have no `items` |

`blockOf` deliberately never populates `scale_ref`: no stored block references a shared scale, they
all inline their options. So every scale-backed block reporting it missing is the
27-copies-of-one-scale problem stated as a number.

### `saveOnExit` / `saveOnToggle` are read (task 6.3)

Both were declared in `DAY_TYPE_PRESETS[...].autoConfig` — `saveOnExit` on `reflection` and
`check-in`, `saveOnToggle` on `tracker` — and read by nothing.

`onExit` set the view and returned, so there was **no flush on leaving a day at all**: a sync still
in flight, or one that had failed, took the last answer with it. `ProgramPlayer.handleExit` now
awaits a final `onProgressChange` for stages that promise a save on exit, and skips it for
`saveOnToggle` stages, which have already committed every change as it happened. `onProgressChange`
is typed `void | Promise<void>` so the flush can be awaited.

The live count is the honest part: **no live day is typed `reflection`, `tracker` or `check-in`**,
so neither policy governs anything today. Every stage's policy is now printed on the Block Type
Viewer directly under its day count, so a policy governing zero days cannot look like one in force.

### `validationMode` and `block-validation.ts` are read (task 6.4)

`validationMode` was a prop on `DayEditor` with a default that no caller passed and no line read.
`block-validation.ts` — `validateDay`, `hasBlockingIssues` — was imported by its own test and
nothing else. They are two halves of one thing, so they were wired together.

The day composer now runs `validateDay` on the selected day and shows the verdict above the block
list. `draft` reports; `publish` marks blocking issues as errors. `EquipProgramWizard` passes
`publish` once the programme is published, because at that point the content is what a user
reaches. Nothing prevents a save — an author must be able to leave work half-finished.

The two day-level checks are also counted live and shown on the Block Type Viewer:
**0 empty days and 0 days with a repeated block id, of 98.** Both clean, which is worth stating
rather than assuming.

### One production incident, self-inflicted and reverted

While verifying, every admin call started returning 401. The edge function was pinned to
`supabase-js@2.49.8` on a diagnosis that a floating `jsr:@supabase/supabase-js@2` had pulled a
breaking auth-js. **That diagnosis was wrong.** GoTrue's own logs say `session_not_found`: the
browser session had been revoked, and the token — unexpired, correctly signed — referenced a
session that no longer existed. No user was affected; the only failing session was the one being
used to verify.

The pin was reverted and the function redeployed at its original versions. Pinning the major is
still the right thing to do, but it is a deliberate change with its own testing, not a side effect
of a misdiagnosis.

### Admin login now survives the computer

Reported as "admin login should remember the computer and keep the saved login". The client was
already `persistSession: true` / `autoRefreshToken: true`, and the database confirms nothing
server-side expires anything — no session carries a timebox and the oldest live session dates from
March. The sign-outs were self-inflicted, in two compounding ways.

**`signOut()` defaults to `scope: 'global'`.** All eleven call sites used the default, and nine are
defensive — they fire when a refresh token looks broken or a session check fails and all they mean
to do is clear local state. Instead each revoked the user's session on every device. A tab that
still held an unexpired, correctly-signed JWT then got `session_not_found` from GoTrue, which looks
exactly like a broken auth library and is not one. This is what killed the admin session used to
verify the blocks work earlier today, and it is the reason that incident was misdiagnosed as a
dependency problem. All eleven now go through `signOutLocal()`, which is local by default;
`'global'` has to be asked for and nothing asks.

**`SecurityProvider` signed everyone out after 30 minutes of no mouse or keyboard activity** — and,
through the above, out of every other device at the same time. That rule is for the patient-facing
app, where a session left open on a borrowed device exposes someone's mental-health data. It does
not carry to the CMS: an author reading a long day of content, or waiting on a deploy, is not idle,
and losing an edit is the cost. **Admins are exempt; the patient-facing timeout is unchanged.**

### The previews are back, keyed on interaction

Three things were declared and unrendered, not dead. All three are on the page.

**`BlockPreview` and the User/Editor toggle.** `BlockDetailPanel` was the sticky right-hand pane of
a master/detail layout that no longer exists, so nothing rendered it — and the mocks behind it, real
drawn widgets rather than descriptions, went with it. Restored as a per-row panel: every row on the
Interactions tab and every block row on the 17-list opens one. The duplicate info card is gone; the
row already carries the label, code, description and live count.

**Re-keyed from block type to interaction.** The mocks were written against legacy type strings —
`emoji_scale`, `free_text`, `single_choice`, `lesson`. The interaction is what `BlockRenderer`
switches on, so the drawing belongs to it. Thirteen previews: seven re-keyed, six new and read off
`BlockRenderer` with the source line named (`input-table`, `track-table`, `clinical`, `upload`,
`number`, and `watch`, which shows the lesson view *because that is what it draws*).

Five legacy mocks did not survive, each for the same reason — they drew something the renderer does
not: `emoji_scale` (rate draws a slider), `yes_no` (that is select-one with two options),
`exercise` (a select-one variant), `journal` (write), `reflection` (read). Showing an author a
widget the player never builds is worse than showing nothing.

The toggle appears only where both halves exist: `BlockPreview` is keyed on interaction (what the
player draws), `EditorPreview` on block type (what the author fills in). An interaction row has no
block type, so it shows the user half alone. A **stage** gets no preview at all and says why — a
stage is a day, and what it draws is the blocks it holds.

**`LEGACY_MAPPING` is back**, 32 terms. It was retired on the grounds that the backfill had
completed, which confused two things: the backfill settled what the *data* says; this table is how a
reader understands old data and old code. Every pre-backfill record and the editor's own
`type + subtype` vocabulary is read through it. Each row runs the real `resolveInteraction()`, so it
cannot drift from the resolver.

### One flat list of 17

The Block Types tab split into "Stages — hold blocks (11)" and "Blocks — held by stages (6)" under a
paragraph explaining `can_hold`. The stat tile said 17 and the list said 11 and 6, so the page
argued for a distinction instead of showing a vocabulary. One list now, ordered stages-then-blocks,
with stage/block as a badge on the row — which is where a per-row fact belongs.

Lint baseline 913 → 908; the retired detail panel took two unused imports with it.

### Icons come from the catalog, through one registry

All 60 `category:` rows carry an `icon`, and `AdminCategoryManager` had the only map that turned one
into a component — locked inside that file. So the Block Type Viewer had grown
`INTERACTION_ICON_MAP`, thirteen hardcoded entries restating what the catalog already said, and
covering only interactions: block types and activities rendered no icon at all while every one of
their rows declared one.

The registry moved to `src/lib/catalog-icons.ts` and both screens read it. `INTERACTION_ICON_MAP` is
deleted — a second hand-kept copy of catalog data, the same pattern removed three times before. Four
icon names carried by live rows had no registry entry and were silently resolving to the generic
`Tag`: `hash` (2 rows), `table`, `hammer`, `check-square`. All four added; an unknown name now
renders a dashed `?` naming the missing key, because a plausible substitute is how a hole stays
hidden. The four stat tiles keep their hardcoded icons — they label the tile, not a catalog row.

### Meta Manager: two dead vocabularies, named on the page

Audited, not deleted. Both keep their tab and their rows; the page now says what an edit affects.

| type | rows | reader |
|---|---|---|
| `day_config_type` | 11 | **none.** Day types merged into `block_type`; the eleven stages live there with `can_hold` and the presets. The only consumer left is `useMetadata` filling the bucket |
| `checkin_block_type` | 7 | **none.** The Check-in Builder is live but reads its own hardcoded `BLOCK_TYPES` (`AdminCheckinTemplateBuilder.tsx:98`) — six *snake_case* values against these seven *kebab-case* ones, so they could never match. `context-tags` exists here and nowhere else |

Meta Manager also shows the same live count and four-status model as the Block Type Viewer, from the
same feed, on the four vocabularies the feed can answer for. A `block_type` row that holds blocks is
counted by the DAYS that carry it, never by blocks — counting a stage by blocks always reads zero.

**Checked, since two elevens meeting in one tile would read as agreement:** the "Stages with rules 11"
tile compares `DAY_TYPE_PRESETS` against `block_type` rows with a non-empty `can_hold`. It is not
comparing against the eleven `day_config_type` rows. Written down in the tile.

### Catalog ids are frozen, and rows carry a display order

**Step 1 — the freeze.** An id is minted once from the slug and then never regenerated. The hazard
is specific: the sync endpoint matches existing rows on `type::slug` and derives an id when the item
carries none, so renaming a slug would MINT A NEW ROW and orphan the old one — silently, because all
407 live blocks store the slug, not the id. Every catalog item now declares its `id`, and
`catalog-ids.test.ts` asserts the 17 block types, 13 interactions and 12 activities exactly. Any
future edit that would regenerate one fails there instead of repointing content in production. The
sync deliberately does **not** write `item.id` onto an existing row.

**Step 2 — `sort_order`.** No row carried one, so display order was whatever the store returned and
the Block Type Viewer had to sort stages-then-blocks itself. Rows are seeded in tens in declaration
order, `useMetadata` sorts every bucket once, and Meta Manager can edit it. Rows without one keep
their existing position *after* the ordered ones — so the field arriving does not reshuffle every
screen before the data lands. The sync's update check had to learn about it too: it only ever
compared icon, colour and description, so a new field could never reach an already-seeded row.

**Step 3 — content pointing at ids — is deliberately not done.** Its only benefit is surviving a
rename, nothing renames types today, and it is a 407-block migration. Freezing the ids now is what
lets it land later without drift having happened in between.

### The stat tile that could not report drift

`Block Types` printed a hardcoded `17 · 11 stages · 6 blocks`. It is now
`compare(BLOCK_TYPE_VOCABULARY.length, kvBlockTypes.length)` — derived on both sides, so it is the
fourth of four tiles that can say DRIFT.

---

## 2026-09-04 (7)

**A live paywall bypass, found by auditing a claim I had made and published.** Edge function
deployed and smoke-tested; frontend deployed. Typecheck 193, tests 58 passing.

### The bypass

`/equip/purchase/:equipId` resolved `equip_program:{id}` and fell back to
`equip_program_by_slug:{id}`. `equip_program:` is keyed by **id**; the only live caller passes a
**slug**. So the primary lookup never matched and the fallback was the path — and that prefix is
written only by two create-only sync handlers, i.e. written once and never refreshed.

The 402 paid-programme gate read `is_paid`/`price` off that stale object:

| | `equip:` / `equip_program:` | `equip_program_by_slug:` |
|---|---|---|
| productivity-reset | `is_paid: true`, `price: 50` | `is_paid: false`, `price: 0` |

The gate computed `false` and did not fire. Any authenticated caller could enrol in a paid
programme for free — the exact hole the 2026-09-01 gate was added to close. It closed it on a path
nobody takes. Contained only because that programme is unpublished.

Resolution now runs through live records; the mirror is a warned last resort.

### Three more, same family

- **Every response in the progress export was `blockType: 'unknown'`.** The exporter read
  `dayDef.blocks`; every live day carries `activities`.
- **Restore-checkpoint wrote `equip:` only**, leaving the copy the player reads pointing at
  pre-restore content — a restore rolled back the admin's view and not the user's.
- **Both sync handlers were create-only**, four lines above a comment stating that a sync which
  cannot re-sync is how `assessment:` and `day:`/`block:` died. Both now refresh.

### What I got wrong

`blocks.md` said this prefix had no content reader and was "never a source". I wrote that, from a
grep, and used it to justify leaving it alone. The reader was a fallback branch inside a route
whose primary lookup silently never matches. **A fallback that always fires is not a fallback; it
is the path.** Corrected in place rather than quietly amended.

---

## 2026-09-04 (6)

**The blocks module: one merged vocabulary, 58 blocks re-typed, and a lossy reader that had been
eating the migration's own fields.** Typecheck 204 -> **194**. Tests 47 -> **58**, passing. Eight
production deploys, each verified `● Ready` via `vercel ls --prod` rather than the returned URL.

### The vocabulary merged: 16 rows, 11 stages + 5 blocks

`block_type` and `day_config_type` were one thing described twice. They are now one 16-row catalog
where a row that **holds** block types is a stage and carries preset rules, and a row that holds
nothing is a block. `can_hold` non-empty ⟺ it has a preset — asserted as an invariant, not a
convention. `exercise_subtype` became `activity` (a subtype named a shape; an activity names an
action).

**Every catalog change needed code deployed BEFORE the data.** `useMetadata` maps the stored `type`
string to a bucket, and `BlockEditor` built its picker from every `block_type` row unfiltered — so
writing rows first would have put `learning`, `practice`, `workshop` into the author's block-type
dropdown, and renaming rows first would have emptied the activity list entirely. Both were done as
accept-both → deploy → migrate → drop-old. **That deploy is now a floor the frontend cannot roll
back beneath**; see the Don'ts in `CLAUDE.md`.

### 58 schema-invalid blocks re-typed, interaction-neutral

58 = 37 typed `quiz`/`reflection` ∪ 44 whose type was overruled by a subtype (overlap 23). A
`lesson · multi-select` already rendered as a multi-select, so its declared type was a lie. 44 →
`exercise`, 14 → `journal`, every one carrying `retyped_from` provenance. Verified interaction-neutral
against backups on both prefixes: every subtype bucket identical, only `type` moved.

**Block content lives under four prefixes and the first write went to one.** `equip_program:` is the
user-facing copy (`index.txs:1203` reads it first); `equip:` is admin. `program-service.ts:40,88`
dual-writes them on every save, so a direct SQL migration is the single path that bypasses that. The
retype was invisible to every user until it was replayed — independently, not copied — against the
second prefix.

### The reader was eating the model

`api-client`'s day mapper enumerated eleven fields and returned a fresh object, discarding everything
else **on every load**. It dropped `interaction` — the field the whole model migrates to, which is
why the strangler seam never took hold — and `repeat`, which is why `ActivityRepeat` is fully built,
has a working editor control, and was used by **zero of 407** blocks. The editor wrote it; the next
load threw it away. Fixed by spreading first and normalising second, with tests.

### Guardrails that fail instead of reporting

Five presets seeded default content their own allow-lists rejected, so enforcement would have failed
an author's day the moment they picked a preset. The allow-lists also could not express what authors
actually build: three stages could not open with a lesson, five could not close with a conclude, and
`upload`/`number` were authorable nowhere — against 215 of 407 live blocks being lessons and
concludes. Fixed, and pinned by tests that assert zero.

**Measured, not assumed:** enforcement today would still reject **182 of 407** live blocks (143 of
them input-tables on `learning` days). Those are mislabelled days, not bad content — 93 of 97 days
sit on the default type. That retyping pass gates enforcement and is not started.

---

## 2026-09-04 (5)

**Deleted the hardcoded copies of the vocabulary, and typing the last one found a live player bug.**
Typecheck 205 -> **204**. Tests 47, passing.

### `AdminBlockTypeViewer` was a third copy of everything, and it had drifted

The one screen whose entire job is to document the block vocabulary was hardcoding its own version of
it — and showing the drift as a feature, printing "12 / 12 in KV" counters while displaying its own
list as the truth. Three of its lists are now derived:

- **Exercise subtypes.** Its 12-entry list presented `rating_scale`, `clinical_instrument` and
  `comparison_matrix` — aliases — as the canonical terms, listed `likert` as a subtype, and had no
  entry for `number`. It had no row for any of `matrix`, `row_list`, `text_list` or `scale`, which are
  the four actually present in live content. Now built from `EXERCISE_SUBTYPES` and `SUBTYPE_ALIASES`
  with labels and descriptions from the live catalog, and a third group for anything the catalog holds
  that code does not know — which should always be empty, and now shows if it is not.
- **Day config presets.** A hand-copied **seven** against the real eleven, with their own
  `allowedBlocks`/`blockedComponents` drifted from `day-presets.ts`. Now read from `DAY_TYPE_PRESETS`
  (composition, rules) and `DAY_TYPE_CONFIG` (layout, progress), and the panel shows
  `allowedInteractions` rather than the legacy palette strings.
- **The legacy mapping table.** Hand-transcribed from the resolver's switch and stale in the same way.
  Now derived by *calling* `resolveInteraction` on a probe block for every canonical term and every
  alias, so it cannot describe behaviour the resolver does not have.

Also fixed `INTERACTION_ICON_MAP`, which was missing `number` — an error introduced by the earlier
commit today that added the thirteenth interaction, and the one place `Record<InteractionType, …>`
caught it.

### `ProgramPlayer.DAY_TYPE_CONFIG` held 7 of 11 day types

Typed `Record<string, DayTypeConfig>` with a `|| DEFAULT_CONFIG` fallback, so **`onboarding`, `quiz`,
`check-in` and `rest` days all played as learning days** — back-navigation on, percentage progress,
"Continue" — with nothing logged. A rest day with no active task and a forward-only quiz both rendered
as a scrollable lesson. Now `Record<DayType, DayTypeConfig>`, with the four missing configs authored
from blocks.md §16, and `getDayTypeConfig()` as the only way in: it still falls back, but warns through
`warnFallback` with the dayType it could not resolve. Exported so the viewer reads it instead of
transcribing it.

### Still hardcoded, and deliberately left for now

`EQUIP_BLOCK_TYPES` and `CHECKIN_BLOCK_TYPES` in the same file carry `fields` and `previewHint` —
editorial UI copy that exists nowhere else, so they are not simply duplicates of a catalog bucket. They
need splitting into catalog-driven vocabulary plus a code-side annotation map, not deleting.
`AdminCheckinTemplateBuilder`'s six-value step list, `ProgramCheckIn`'s four hardcoded questions,
`MoodJournal`'s hardcoded mood-scale branch and `wizard/types.ts`'s `FieldType` are all Phase 5.

## 2026-09-04 (4)

**Declared the content hierarchy — collection / stage / step / block — as types, with a completeness
check.** `src/lib/content-hierarchy.ts`. Purely additive: **nothing reads it and nothing has migrated.**
This is blocks.md §14 and §18 Phase 3.1-3.2 at type level, so the migration can be a strangler rather
than a cutover. The seam already works — `resolveInteraction()` prefers an explicit `interaction`, so a
block written in this shape is understood by today's player.

Four levels, and only the top two differ between the three features: an equip programme is 31 stages,
an assessment is 1, a check-in template is 1; they differ further only in which preset the stage
carries and where answers land (a progress row, a result row, a journal row). Steps and blocks are
identical in all three. That is the whole claim, and writing it down is what makes "three builders"
into "one block editor and three thin container editors".

The `Block` type carries the three fields the current model cannot express:

- **`key`** — where the answer goes. Ten of the thirteen interactions produce a response and not one
  stored block names its destination, so answers file under a block id and day 3's "hours slept" and
  day 17's are unrelated facts. Check-in already solved this with `save_as`; this adopts check-in's
  idea rather than the block model's absence of one.
- **`scale_ref`** — the shared option set. Assessments inline the PHQ/GAD scale 27 separate times.
- **`role`** — why the block is there, split from `interaction`, which says what the user does. This
  is what makes `lesson · multi-select` sayable instead of accidental.

`INTERACTION_REQUIREMENTS` states what each of the thirteen interactions requires, what config is
optional, and what shape of answer it produces. `INTERACTION_META` already carried a label, verb, icon
and description; what it lacked was this, which is what lets an editor show only the relevant fields
instead of one `exerciseConfig` with 20 optional ones. `missingRequirements(block)` returns what a
block is missing.

Six more tests, and one of them found a real inconsistency while being written: `number` was added as a
thirteenth interaction earlier today but had been left out of `RESPONSE_PRODUCING`, so a numeric block
would not have been required to name its answer. Fixed in the source. 47 tests, all passing. Typecheck
unchanged at 205.

## 2026-09-04 (3)

**Restated the day-type validator against interactions, gave it a dry-run, and fixed the editor line
that was minting invalid day types.** Typecheck 206 -> **205**. Tests still 41, passing.

`validateBlockForDayType()` judged a block by a 23-string palette that exists in no store and no type
union, bridged to real names by nine hardcoded `if`s inside the function itself — comparing
`subtype === 'rating_scale'` and `subtype === 'textarea'` against values the editor does not write.
It now resolves the block to its **interaction** and checks that against a new
`allowedInteractions` field on every preset, populated for all eleven from blocks.md §16. The nine
`if`s are gone. `allowedBlocks` stays for now because DayEditor's block palette and the reference
screen still read it.

**The allow-list still does not reject** — that is §18 6.4 and it is a content decision, not a code
one: nine of eleven presets have never been assigned to a day, so switching it on today would reject
correct content. Instead the function returns `{ allowed, wouldReject, reason }`. `allowed` is exactly
what it was (only the blocked list can make it false); `wouldReject` is what enforcement would do.
That is what makes the §18 6.3 audit runnable before the switch is thrown.

**Bug fixed, and the type system found it.** Typing `DAY_TYPE_PRESETS` as `Record<DayType, ...>` in the
previous commit made `DayEditor.tsx:402` a compile error: `handleAddDay` set `dayType: 'lesson'` on
every new day — a BLOCK type used as a day type. It matches no preset, so the validator found none and
returned early, meaning **every day created through the editor skipped validation entirely**. That is
the source of the 8 live days typed `lesson` recorded in blocks.md §11. Now `'learning'`, the preset
93 of the 97 real days already use.

Logged, not fixed: `AdminBlockTypeViewer.tsx:243-305` hardcodes its own copy of seven day presets with
their own allowedBlocks/blockedComponents rather than importing `DAY_TYPE_PRESETS`. The one screen
whose job is to document the vocabulary is displaying a second, stale set of it.

## 2026-09-04 (2)

**Centralised the block vocabulary: one alias map, one day-type union, one legacy-question map, and
the editor's competing fallback vocabulary deleted.** Behaviour-preserving except one named bug fix.
Typecheck 207 -> **206**. Tests 31 -> **41**, all passing.

The alias list lived as ten extra `case` labels inside `resolveInteraction`'s switch, which meant the
renderer obeyed a vocabulary the editor, the catalog and any migration could not read. Extracted to
`EXERCISE_SUBTYPES` (the 12 canonical terms, mirroring the catalog bucket) plus `SUBTYPE_ALIASES` and
`normalizeSubtype()`, all exported from `equip-admin-types.ts`. Aliases now resolve *before* the
switch, so the switch is the canonical vocabulary and nothing else. The alias table is grouped by
where each spelling came from — the four in live data are attributed to `wizard/types.ts`'s
`FieldType`, and check-in's six step types are declared alongside so Phase 5 has one list to read.

**Bug fixed: `number` drew a textarea.** It was a declared subtype (added to the catalog earlier) with
no interaction, so its one live block fell through the default branch to `write`. Added a `number`
interaction, its `INTERACTION_META` entry, and `renderNumberResponse` in `BlockRenderer` — a numeric
input instead of a six-row textarea.

**`DayContent.dayType` no longer drifts.** It was a hand-maintained 10-value union with a comment
asking the next person to keep it in sync with `DAY_TYPE_PRESETS`. Now `DAY_TYPES` is declared once in
`equip-admin-types.ts` and the presets are typed `Record<DayType, DayTypePreset>`, so a mismatch is a
compile error. That immediately caught the missing eleventh: **`onboarding` had a `day_config_type`
catalog row and no preset at all**, so an admin picking it in Meta Manager silently got nothing. Added
the preset per blocks.md §16. `DAY_TYPE_PRESETS` is no longer indexable by arbitrary strings —
`isDayType()` is the only way in, and `getPresetForDayType` goes through it.

**The 11-entry legacy-question alias map had two copies** — twice in `AssessmentFlow.tsx` and once in
the wizard's inverse direction. One drifting from the other would change how a stored question is read
without changing how it is written. Now `LEGACY_QUESTION_TYPE_ALIASES` +
`normalizeLegacyQuestionType()` in `assessment-adapter.ts`, imported by both call sites.

**Deleted `FALLBACK_EXERCISE_SUBTYPES` and `FALLBACK_BLOCK_TYPES`** (blocks.md §18 1.6, unblocked now
that 1.2 has landed). They held *different* terms than the catalog does, and `useMetadata` returns
empty buckets on a throw as well as while loading — so a failed fetch silently offered the admin the
wrong vocabulary with no way to tell. The editor now reads the catalog only and warns through
`warnFallback` when a bucket is empty after loading, carrying the hook's `error` string.

New test file `src/lib/blocks-vocabulary.test.ts` — 10 tests. The core one is the **live census**:
all 23 `type x subtype` combinations found in the store on 2026-09-04, with their block counts, each
asserted against the interaction the resolver produced *before* this refactor. One row is marked as a
deliberate change (`reflection · number`). A second test asserts every canonical subtype maps to an
explicit expected interaction, so a term added to the catalog without a `case` fails here instead of
silently landing on the default branch — which is exactly how `matrix`, `scale`, `row_list`,
`text_list` and `number` reached production. The counts sum to 406, which is asserted too.

This is the first piece of the blocks.md §18 item 0.1 fixture set.

## 2026-09-04

**Made every silent fallback in the block chain say so, and closed two Phase 0 items on the blocks
survey.** No behaviour changes — every fallback still fires exactly as before.

`blocks.md` §11 records ten defaults in the author -> store -> resolve -> render chain, four of which
are the same bug at four levels: an unknown subtype gets a plausible interaction, an unknown day type
gets full permission, a failed catalog fetch gets a different vocabulary, a missing `order` gets array
position. In every case a missing value is replaced by a working one and nothing records the
substitution. That is why six undeclared terms, eight mistyped days and a commented-out guardrail all
coexisted in production without a single error.

Added `warnFallback(site, detail, key)` to `equip-admin-types.ts` — a `console.warn` under one
`[blocks:fallback]` prefix, deduped by key because several of these sites run on every render. Six
call sites: `resolveInteraction`'s default (already warning since `16f8aefd`, now deduped) and its
`|| subtype` clause (the 21 blocks whose type is silently overruled), `validateBlockForDayType`'s
no-preset early return (the 8 days typed `lesson`, which skip validation entirely),
`BlockEditor`'s two catalog-empty fallbacks, `convertDayToQuestions`'s collapse onto legacy
`single-choice`, and `BlockRenderer`'s final default case.

Typecheck: **207 before, 207 after**. That 207 is also now the recorded baseline — `blocks.md` §18
said 216, measured at `4423f72f`.

Two Phase 0 items closed in the same pass, both verified rather than inferred:

- **0.2, the third writer, is found.** `src/components/wizard/types.ts` — the `FieldType` union, 13
  values, carrying all five undeclared subtypes (`matrix`, `row_list`, `text_list`, `number`,
  `scale`) as exact strings. `git log --follow` gives it two commits, both "Update files from Figma
  Make". It **reads** `daily_content` and never writes it; no server route writes `subtype` at all.
  So no live path can re-pollute the catalog, and Phase 1 is no longer provisional.
- **0.4, the baseline, is recorded.** 207 typecheck errors, exit 0. `npm run build` still unrun.

Also corrected in `blocks.md` against the live DB: §18 item **1.2 has already landed** — `block_type`
is 7 rows with `quiz` in and `sleep-diary` out, `exercise_subtype` is 12 rows with `number` in, and
`metadata-catalog.ts` agrees with both. And there is a **fifth content store**, not four:
`EquipProgramOnboarding.tsx:103` reads `program.onboarding.questions[]` into an
`OnboardingQuestionSet`, a third question shape alongside `daily_content[].activities[]` and
assessments' `questions[]`.

Live census re-run the same day: 406 equip blocks, `interaction` on **0**, `role` on 0, a response
key on 0. The nine mis-rendering blocks are fixed in the resolver; the stored data is untouched.

---

## 2026-08-12

**Found and fixed a double-JSON-encoding bug affecting 3 KV prefixes; re-verified an orphan check
that had been silently vacuous because of it.** Prompted by the user's repeated question ("~615
`activity_log:` keys, help — why this many?") — a deeper investigation than the earlier chat-only
answer.

Root cause: `index.tsx`'s `POST /activity-log` handler called `kv.set(key, JSON.stringify(record))`.
`kv.set()` (both implementations — `kv_store.tsx:30`, `kv_dual_write.ts:159` — read to confirm) never
serializes its input itself; it hands the raw JS value straight to Supabase-js, which serializes it
once for the `jsonb` column. Passing an already-stringified value meant the column held a **JSON
string**, not an object — confirmed with `jsonb_typeof(value) = 'string'`, unique to this prefix
versus `user:`/`equip:`/`category:`/`journal:`, which all correctly show `'object'`.

This silently broke more than the raw data: plain field access (`value['user_id']`) on a JS string
returns `undefined`, not an error, so the `activity_log: → user:` orphan check added earlier this
session (`kv-audit-routes.ts`'s `RELATIONS`) had been reporting "0 orphaned" without ever actually
reading a `user_id` — a false-clean result, not a verified one.

A repo-wide grep for `JSON.stringify(` immediately preceding a `kv.set(` call found **2 more
instances**: `corporate-routes.ts:157` (`corporate_program:`) and `corporate-routes.ts:189`
(`user_employer:`). Both prefixes have 0 live rows — the corporate-enrollment feature has never
fired in production — so this was a dormant landmine, not live corruption, and unlike
`activity_log:` (which happened to get a defensive `JSON.parse()` workaround on its one read path,
`GET /admin/activity-logs`, without anyone diagnosing the write-side cause), these two had **no**
compensating read-side fix at all.

**Fixed**: removed the redundant `JSON.stringify()` at all 3 call sites. Migrated the 604 existing
`activity_log:` rows in place (`update ... set value = (value #>> '{}')::jsonb where
jsonb_typeof(value) = 'string'`), verified after: all 604 now proper objects with `action`/`user_id`
readable directly. No migration needed for the other two prefixes (0 rows). Re-ran the
`activity_log: → user:` orphan check for real this time: 604/604 resolve to a real `auth.users` id,
0 orphaned — now an actual verified result.

**The "~615 keys, why?" mapping, now written up** (not just answered in chat): 604 rows, only 2
action types ever logged (`login` 603, `resource_view` 1). All 604 belong to exactly 4 users, and
all 4 are internal/team accounts (Kartik's two emails, Vedanshu's, `admin@wugweb.com`) — **zero
real end-users have ever triggered this prefix**. 82% of rows (498) landed on one day
(2026-07-21), consistent with Supabase's `onAuthStateChange` firing `SIGNED_IN` on more than just a
fresh login (tab refresh/multi-tab restore can also trigger it), logged unconditionally by
`AuthContext.tsx:164`. Flagged as a possible dedup improvement, not changed — it touches the core
auth listener, not a mechanical fix. Also re-confirmed and written up: `equip:`/`equip_program:`/
`equip_slug:` all being 4, and `category:` being 190, are correct 1:1:1 mirrors, re-verified live
rather than repeated from an earlier chat answer. Full detail: `src/docs/systems/schema-relations.md`.

---

## 2026-08-07 (continued III)

**Full data-integrity audit: 20 new systems docs, root docs corrected — see below. Also: 7 dead
placeholder questions removed across 3 assessments, closing out two previously-flagged "product
decision" content bugs instead of re-flagging them.** Prompted directly by a user screenshot of
General showing a nonsense question in production. Investigation found `gen-q2`/`q3`/`q4`
("physical health" / "mental health" / "I feel optimistic") were explicitly documented as dead —
`assessment-section-presets.ts`'s own comment (written earlier this session) says they were
placeholder stand-ins for content later replaced by `gen-dep-q1`/`q2`, and were simply never
removed once the real replacements landed. That gap — writing down a known-dead-and-fixable finding
without acting on it — is a real process failure, not new codebase debt.

Ran a systematic check across **all 7 assessments** to make sure this wasn't isolated: every live
`questions[]` id cross-referenced against every id referenced anywhere in that assessment's own
scoring config (`assessment-section-presets.ts`). Anything unreferenced is either
intentionally-unscored-but-real (verified individually — Anxiety's and Depression's excluded
impairment/embedded-screen items are genuine clinical content, confirmed and kept) or dead weight.
Found and removed:
- **General**: `gen-q2`/`q3`/`q4` (dead placeholders, see above) — 27 → 24 questions.
- **Burnout**: `burnout-q1`, literal placeholder text `"test"`, previously flagged 2026-08-06 as
  "needs a product decision" — the decision was already obvious (no real content existed to
  author-around), just never executed. 23 → 22 questions.
- **Stress**: `stress-q1`–`q3`, truncated mid-sentence (`"How often have you felt "`, `"How often
  have you"`, `"How often have you f"`), also previously flagged 2026-08-06 — deleted rather than
  guessed-at, since the fragments didn't imply one clear intended completion. 10 → 7 questions.

Sleep and Balance checked the same way and confirmed clean — every live question in both is
referenced by their scoring config. All fixes applied to both `assessment_def:` and the `assessment:`
mirror; each assessment's stale `daily_content` admin-builder cache was cleared afterward (same
mechanism as the General builder-sync bug fixed earlier the same day) so the builder shows the
corrected counts, not another stale snapshot.

## 2026-08-07 (continued II)

**Fixed a real, screenshot-confirmed production bug: General assessment's admin builder was showing
24 questions while live users saw 27.** Root cause: `AssessmentEditPageWizard.tsx` caches a
`daily_content` snapshot and only regenerates it from `questions[]` if absent
(`AssessmentEditPageWizard.tsx:291`) — this session's earlier GAD-2/PHQ-2 fix edited `questions[]`
directly via SQL, bypassing the builder, so the cached snapshot (frozen at 24) silently fell out of
sync with the canonical 27. Confirmed the live player (`AssessmentFlow.tsx`) only ever reads
`questions[]`, never `daily_content` — real users were never affected, only the admin's view of what
they were editing. Checked all 7 assessments — only General was affected. Fixed by clearing the
stale `daily_content` field on both the `assessment_def:` record and its `assessment:` mirror; the
app's existing logic regenerates it correctly next time the builder opens. **The underlying pattern
(no staleness detection between the two fields) is still live and will recur on the next
direct-SQL edit** — flagged as a real architecture decision, not fixed at the code level this pass.

**Found: the admin notification bell is not wired to real data.** `NotificationContext.tsx`'s
`unreadCount` is computed only from a client-side, in-session array — never fetched from the real
`admin_notification:` KV prefix, which has real backend write paths. Same "half-built, write-side
exists, read-side was never wired in" shape as §18's session-tracking finding.

**Confirmed not bugs, just correct**: `equip:`/`equip_program:`/`equip_slug:` all being 4 is the
expected 1:1:1 mirroring for the 4 live equip programs. `category:` at 190 matches the documented
Metadata Catalog count exactly. `activity_log:` fluctuating around 580-615 across this session is
organic traffic, not runaway growth — the *lack of a size cap* (already flagged, §12) is the real
concern, not the current count itself.

## 2026-08-07 (continued)

**Hero Banners merged into Pages, per direct request.** `AdminHeroBannerManager` is now a tab inside
`AdminPageManager` (`/admin/pages`) instead of a standalone `/admin/hero-banner` screen — a hero
banner is page-level content, so this cuts a separate admin concept. KV models deliberately left
separate (`page:`/`cms_page:` vs `hero_banner:`) — navigation merge, not a data-model merge.
Confirmed at the build level: no separate JS chunk for the hero banner manager anymore, it's bundled
with Pages.

**Admin landing view's URL is now `/admin/reporting`**, matching its "Reporting" label (bare
`/admin` kept as a working alias so nothing that already links there breaks).

**New `src/docs/systems/url-map.md`** — every route in the app, public/auth/private/admin, in one
table. `public/sitemap.xml` and the HTML `/sitemap` page both updated with routes that were missing
(`/join/professional`, `/sitemap` itself, `/dashboard`, `/timeline`, `/learning-diary`). Confirmed
`/admin/equip` and `/admin/assessments` are both real, KV-driven, not hardcoded. Confirmed
`/reset-password` is the real "forgot password" flow with its own working URL — contrary to the
question that prompted the check.

**§18 gained a personas/ecosystem-mapping section**, evidence-based from the live schema: Visitor,
Registered User, Corporate User (flag-based, `user_employer:` linkage registered but 0 live rows —
a ready extension point, not a gap), Admin (same profile shape, `is_admin` flag only — not a
separate account system), and Professional/Consultant (confirmed via live query to have **no
`user_id` field at all** — a directory entity admins manage, not a login-backed persona;
`/join/professional` creates a `professional_application:` record for review, not an automatic
account). Ties directly into the wellness-score v2 proposal's "user personal info" input.

**`/dashboard/<username>` — not implemented.** There's no username/handle field in the `user:`
schema to build a per-user URL on; needs that field added first. Noted for the future taxonomy work
alongside the "we need taxonomy" and "separate admin code from product code" notes already tracked.

## 2026-08-07

**§18 User & Accounts audited — 2 fake security features found and removed from the live UI.** New
`src/docs/systems/user-accounts.md` + artifact §18. Found: "Connect Google/LinkedIn"
(`account/Integration.tsx`) actually attempted real Supabase `linkIdentity()` first, but silently
fell back to a fake simulated connection on any failure — masking real OAuth errors as success,
worse than pure decoration. The Two-Factor Authentication toggle (`account/Security.tsx`) wrote a
database flag nothing in the login flow ever checked; the live admin account had it set to `true`
with zero real protection. Per a product decision, both were removed from the UI (state, handlers,
rows) rather than left live — real OAuth/TOTP implementations need external provider setup, out of
scope for this pass. Backend routes and KV fields left untouched for future reuse. Health Connect,
on the same Integration page, is unaffected — confirmed separately real, no fake fallback (§16).

**Admin Panel cleanup, per direct request.** Removed 3 nav sections from `AdminDashboard.tsx`:
"System Health" (actually a raw KV CRUD-testing tool, mislabeled — not a health dashboard),
"Backups" (real, functional checkpoint/restore — removed from nav only; `AdminBackupManager.tsx`,
its backend routes, and `sys_backups`/`backup:` KV data are untouched, easily re-added), and the
standalone "Analytics" page (redundant — the same component was already embedded on the landing
page). The landing view itself renamed "Reporting" in the UI (URL unchanged, `/admin`) so it stops
sharing a name with the user-facing Dashboard.

**Admin URL routing fixed across the board.** Every admin sidebar item, not just
`/admin/block-type-viewer`, now updates the browser URL on click and has a matching `validRoutes`
entry — previously only about half of ~20 admin sections had a working direct URL; the rest were
click-only with no way to bookmark or deep-link. `App.tsx`'s `validRoutes` gained 9 missing entries;
`AdminDashboard.tsx`'s sidebar/search-result/logo/back-button click handlers all now call
`onNavigate()` alongside the existing internal view-state update.

**Git hygiene**: found the entire prior session's work (everything since commit `58f2a2ef`) had
never been committed. Split into 4 logical commits (backend fixes, frontend fixes + dead-code
removal, documentation, §18) and pushed to `origin/equip-carry-forward`. Also removed a stray
shell-escaping artifact file from the repo root and added `.claude/`/`supabase/.temp/` to
`.gitignore` (local tooling state, not app config).

**Dead code removed** (each confirmed zero-reference before deletion): `organisms/AssessmentQuestion.tsx`,
`services/programService.ts`, `assessments/ReassessmentPrompt.tsx`. **Confirmed real, not removed**:
`components/payments/` (production-grade Razorpay integration, unplugged pending a pricing launch).
**Confirmed clean, no action**: `player/`, `figma/ImageWithFallback.tsx`, `LearningDiary.tsx` (fully
functional), `lib/content/`, `constants/content.ts`, `blocks/` vs `homepage/` (different purposes),
`AboutUs.tsx` vs `Account.tsx` (unrelated screens), old `ikan.health` domain.

**Fixed a real hardcoded-content bug found in 3 separate live places**: stale US crisis-line numbers
("988"/"911") in `cms-defaults.ts`'s FAQ default and 2 duplicate/drifted live CMS records, corrected
to India numbers (KIRAN 1800-599-0019, iCALL 9152987821, Emergency 112).

**New `src/docs/README.md`** — an index of every doc under `src/docs/`, so nothing from this
multi-day audit gets lost or re-derived from scratch; linked from the artifact.

## 2026-08-06 (continued VII)

**Fix pass: dead code removed, 2 real hardcoded-content bugs fixed, safe registry/UI fixes shipped,
several files audited on the user's request.** Per the user's explicit decision this turn ("small
fixes stay on `equip-carry-forward`"), everything below is a small, low-risk, "doesn't change basic
function" fix committed and deployed directly, not routed to a separate branch.

**Dead code deleted** (each confirmed zero-reference via full-repo grep before removal):
- `src/components/organisms/AssessmentQuestion.tsx` — imported but never rendered; `AssessmentFlow.tsx`
  actually renders `ProgramPlayer`. Dead import removed, file + empty `organisms/` dir deleted.
- `src/services/programService.ts` — placeholder Supabase credentials, zero importers, an abandoned
  early scaffold targeting a table schema the real KV backend doesn't use.
- `src/components/assessments/ReassessmentPrompt.tsx` — structurally unreachable: rendered in
  `Dashboard.tsx` gated on `reason === 'manual'`, but `checkReassessmentTriggers()` never returns
  `'manual'` (only `'time'`/`'mood'`/`'program'`/`null`). The real, working reassessment prompt was a
  separate inline JSX block already in the same file, kept untouched. Another instance of this
  session's recurring "two representations, only one live" pattern.

**Hardcoded-content bugs fixed, code + all live KV copies together:**
- **Demo-credentials button** shown unconditionally in production sign-in (`AuthForm.tsx`) — gated
  behind `import.meta.env.DEV`. Checked first: `demo@ikanhealth.in` isn't a real account, so this was
  a broken button for real visitors, not a live-account exposure.
- **Stale US crisis-line numbers ("988", "911", "Text HOME to 741741") found in 3 separate live
  places** — `cms-defaults.ts`'s FAQ default, and live KV in **both** `cms_page:faq` and a
  byte-identical `page:page_...` FAQ record (confirming the "two parallel CMS systems" finding with
  real duplicated content), plus a separate `page:` Terms record that had drifted independently since
  its Dec 2025 seed. All fixed to the correct India numbers (KIRAN 1800-599-0019, iCALL 9152987821,
  Emergency 112) already used correctly elsewhere in the same file.

**Safe registry/UI fixes:**
- `App.tsx`: added `/admin/block-type-viewer` to `validRoutes`.
- `kv-audit-routes.ts`: added `activity_log: → user:` as the 7th declared `RELATIONS` entry; added a
  registry note marking `recommendation_rules` (no colon) as vestigial/backup-restore-only.
- `AdminKVAudit.tsx`: renamed "Multi-Tenant Prefix Sync" to "Admin/User Prefix Sync" (the
  "multi-tenant" label was a misnomer), fixed its count to reflect actual `equip:`/`equip_program:`
  and `assessment_def:`/`assessment:` record-count drift instead of an unrelated critical-warnings
  count, and removed the stale `resource: → library:resource:` row from its description (the backend
  route had already correctly dropped this sync target, with its own explanatory comment — only the
  frontend copy hadn't caught up).
- Fixed a 6th location of the stale "25 route modules" count, found while re-touching the backend:
  `src/supabase/functions/server/CLAUDE.md`.

**Audited on request, confirmed clean, no change needed:** `src/components/player/` (the one real
renderer, no hardcoded/stale version), `src/components/figma/ImageWithFallback.tsx` (9 real
importers), `LearningDiary.tsx` (fully functional, real route/API/entry-point), `src/lib/content/`
(only `auth.ts`, already covered), `src/lib/constants/content.ts` (legitimate, not CMS-redundant),
`src/components/blocks/` vs. `src/components/screens/homepage/` (different purposes, zero overlap —
not duplicative), `AboutUs.tsx` vs. `Account.tsx` (unrelated screens, not "2 About pages"), old
`ikan.health` domain (clean — only mentioned inside `BRAND.md`'s own retirement notice).

**Confirmed real but intentionally not touched:** `src/components/payments/` — genuine,
production-grade Razorpay integration, unplugged because no live equip is currently priced. Not dead
scaffolding like the files removed above; kept pending a pricing-launch decision.

**Doc enrichment**: `builder-editor-architecture.md` now explicitly confirms the render tier
(`ProgramPlayer.tsx`/`BlockRenderer.tsx`) as part of the Builder pipeline, backed by the player/
audit above. `ikan-wellness-score.md` gained a "proposed v2" structure sketch (program data +
assessment scores + mood journal + Health Connect data + user info + activity/frequency, routed
through the 3 engines instead of the current 4th independent mechanism) — explicitly a sketch for a
future session, nothing built. `repo-hygiene-audit.md` gained full writeups of everything above, plus
a direct answer to "recurring/extra equip & assessment content": zero duplicate *records* today, but
duplicate *content within* Sleep Tight and Burnout Reset, still open and unfixed (content decisions).

## 2026-08-06 (continued VI)

**Admin KV Audit dashboard was showing stale numbers — traced to deployed-function drift, fixed by
redeploying.** User caught this live, comparing the dashboard's "Uncategorized Keys: ~595" and
"Schema & Relations: 94" tiles against what the code should produce. Simulated `classifyKey()`'s
exact logic against live data: genuinely 1 uncategorized key (not ~595), and `KV_SCHEMA.length` is
96 in source (not 94) — both dashboard values are computed live at request time, not hardcoded or
frontend-cached, so the mismatch meant the deployed edge function was behind the current source.
Redeployed `make-server-cc205da9`; reload the admin page to confirm.

**Found, not fixed: "Multi-Tenant Prefix Sync" tile's count is mislabeled, and one of its 3 sync
targets would create the exact regression the registry warns against.** The tile's displayed count
(`AdminKVAudit.tsx:727`) is actually the count of critical growth warnings, unrelated to sync status.
Its `resource: → library:resource:` target (`AdminKVAudit.tsx:745`) syncs into a prefix `KV_SCHEMA`
explicitly documents as a deprecated mirror that should stay empty — running this sync as built would
create a real regression. Also: "multi-tenant" mischaracterizes what this is (a single-tenant app's
admin-write/user-read prefix split, not multiple customer orgs). See `PENDING.md`.

**Live ghost-user cleanup: 5 of 7 orphaned `user:` KV rows deleted.** `user:` KV vs. `auth.users`:
13 rows, 6 real, 7 ghost. 2 had zero downstream references and were plain orphans; 3 more were
keyed by email instead of UUID (a distinct key-shape bug, same family as `enrollment:`'s two-shape
problem) — all 5 deleted via one verified `DELETE ... WHERE key IN (...)`. The remaining 2 have real
data attached elsewhere (7 journal entries; an enrollment + ikan_score record) and were deliberately
left — see `schema-relations.md`.

**New docs: `block-architecture.md` expanded (full 18-row type/subtype inventory, all 10
`day-presets.ts` presets, the cross-system "what feeds what" map, the full `Activity` field schema
including carry-forward/step-groups), `schema-relations.md` rehauled (fresh live orphan re-check —
0 real orphans across all 6 relations — ghost users, inventories by category with `orphanRisk`,
consolidated known-structural-issues list, artifact appendix), `recommendation-frontend-vs-backend.md`
(§14 — `evaluateAssessment()` is not redundant, but `Dashboard.tsx` fetches a backend result it never
renders), `repo-hygiene-audit.md` (the `src/contexts`/`config`/`assets`/`imports`/`sample-data`
audit — 2 of the 5 don't exist on this branch at all, confirming `main` has diverged further than
previously noted), `health-connect.md` (Google Fit/Health Connect integration, correctly wired,
zero data, like the Scoring Engine).**

**Fixed: the stale "25 route modules" count**, corrected to 33 files / 18 route modules in
`CLAUDE.md`, `README.md`, and 3 `src/docs/*.md` files.

**Found, not fixed (real code issues, explicitly scoped as docs-only this pass):**
`Dashboard.tsx` fetches `GET /recommendations` into state that's never rendered;
`/admin/block-type-viewer` is reachable by direct URL but missing from `validRoutes`, so the URL and
sidebar nav disagree; `day-presets.ts`'s `allowedBlocks` enforcement is computed and then silently
discarded (`blockedComponents` alone is enforced); a 4th block vocabulary
(`mcq_single`/`table_input`/etc.) bridges to `block_type`/`exercise_subtype` only via hardcoded
string matching. All precisely written up in `PENDING.md` for a future pass.

## 2026-08-06 (continued V)

**New: `src/docs/systems/block-architecture.md` (§13) + `resources.md` (§15) — Block formalized as
the shared primitive under Builder, Check-in's own builder concept retired.** Following the
session's direction that Check-in shouldn't be a third builder to reconcile but should collapse
into Blocks (the same primitive Equip/Assessment already share), traced the full schema: a Block
(`Activity`) resolves through three tiers — **type/subtype** (authored, KV-backed via `block_type`
(7) / `exercise_subtype` (11), real consumers) → **interaction** (the unified answer-shape,
`resolveInteraction()`, a hardcoded switch — its 12-record KV mirror `interaction_type` is read only
by a reference viewer, not the resolver) → **render** (`BlockRenderer.tsx`, the actual front-end
dispatch — answers this session's open "does rendering belong to Block?" question: yes, it's tier
3). Reclassified `interaction_type` and `day_config_type` alongside the already-known
`checkin_block_type` as decorative Metadata Catalog types (3 of 21, not 2) — each read only by
`AdminBlockTypeViewer.tsx`, an existing accurate reference screen, never by an authoring or
rendering path. Found `day_config_type`'s 11 KV values disagree three ways with code (`dayType`'s
7-value TS union, `day-presets.ts`'s actual 9 presets) — 4 KV values exist in no code path at all.

**Found and corrected: `mood-checkin.md`/§04 wrongly claimed `equip.checkInConfig` links to
`checkin_template:` via a `scale_key` field.** It doesn't — `scale_key` exists only on
`checkin_template:` steps. `checkInConfig` actually triggers `ProgramCheckIn.tsx`, a **separate**
milestone check-in modal (day 7/14/30 or last day) with 4 fully hardcoded questions, no KV
involvement, and no relation to Scales/Blocks/templates at all — a third, previously undocumented
"check-in"-named system, found and corrected while re-verifying this for §13.

**New: `src/docs/systems/resources.md` (§15).** Plain CRUD article library, 9 real records, all
clean — 0 of 9 `resource:`→`category:` orphans, `resource_view:` and the deprecated
`library:resource:` mirror both empty (real, wired, just unused / correctly retired). One minor,
not-fixed observation: `GET /library/resources/:id` has no `published` check, so the one unpublished
resource is correctly list-hidden but still reachable by direct id — no live exposure path today
since nothing generates such a link.

## 2026-08-06 (continued IV)

**Correction: builder/editor architecture is 1 shared builder + 1 outlier, not 3 independent
systems.** The "(continued III)" entry below is superseded — its first-pass check only looked at
whether each wizard calls `useMetadata()` directly, and missed that `AssessmentEditPageWizard.tsx`
literally imports and renders `EquipDailyEditor`/`EquipBlockEditor` (Equip's editor) via a
`convertQuestionsToDay()` adapter. Re-verified by reading the actual render tree. Corrected finding:
Equip and Assessment already share one real builder correctly; `AdminCheckinTemplateBuilder.tsx` is
the one genuine outlier, with its own hardcoded `BLOCK_TYPES` disconnected from the shared
`exercise_subtype`/`interaction_type` taxonomy. Built the concrete type-mapping table showing 4 of
Check-in's 6 types are the same underlying concept, just named differently — not implemented as a
fix (changes a live admin screen's behavior), flagged for a decision. See
`src/docs/systems/builder-editor-architecture.md`.

**New: `src/docs/systems/schema-relations.md` + artifact §12 — the full KV registry, relations, and
tight-vs-loose audit.** Read `KV_SCHEMA` (96 registered prefixes) and `RELATIONS` (5 declared
parent-child links) from `kv-audit-routes.ts` and cross-checked every live prefix in
`kv_store_cc205da9` against it. Found and fixed one gap: `activity:daily:{date}` — the real merge
target of `POST /admin/purge-activity-keys` — was live (one key already 1,357 events / ~300KB) and
unregistered. Registered it (`orphanRisk: low`) and deployed; its missing size cap (unlike
`user_activity:`'s) is flagged, not fixed — a retention decision, not a correctness bug. Documented
the 6 real parent-child relations, the 5 Postgres shadow tables' `kv_key` back-references, and the
"side mapping" pattern underneath the Builder conversation: Check-in Scales (`checkin_scale:`) and
Blocks (Metadata Catalog's `exercise_subtype`/`interaction_type`) are the same *kind* of thing — a
vocabulary a builder renders from and a user answers into — just unconsolidated. Classified every
relation as tight (written once, never re-resolved — slug indices, shadow-table `kv_key`) or loose
(a value that can drift after the reference was created); every relation in the loose category
traces to a bug already found and fixed this session (`getEquip()`'s slug fallback, the
double-shaped `enrollment:` key, `resource`/`category`'s slug match).

## 2026-08-06 (continued III)

**iKan Wellness Score audited — confirmed independent of the Scoring/Rule engines, one bug fixed.**
The Programs component (25% of the score) queried two wrong enrollment key shapes, silently
computing from roughly 1 in 8 of a user's real enrollments (verified: 0 matches on one prefix, 4 of
34 real enrollments on the other). Fixed to full-scan and filter by value, matching the pattern
already proven correct elsewhere in the codebase. Also found and documented, not fixed: General's
flat score mixes higher-is-distress and higher-is-better sub-scales before the wellness formula
inverts the whole sum — a design-level gap, not a one-line patch.

**Builder/editor architecture mapped — three independent systems confirmed, not one.** Equip,
Assessment, and Check-in each maintain their own block/question/step-type picker; only Equip's
inner exercise-subtype tier is genuinely driven by the Metadata Catalog. Equip's outer block
palette is hardcoded to 4 types while its own catalog has 7; Assessment's question-type picker
isn't KV-driven at all; Check-in's hardcoded picker doesn't match its own catalog's string format.
Nothing fixed — a mapping exercise per direction, parked alongside the still-deferred
wizard/builder/editor naming question.

## 2026-08-06 (continued II)

**Backend Recommendation Engine fixed — completely broken since it was written, live on two real
screens.** `RecommendationService.getRecommendations()` (`GET /recommendations`, called by
`Dashboard.tsx` and `EquipProgramCompletion.tsx`) stacked three independent bugs: it read
`assessment_response_by_user:` records whose `severity`/`interpretation` fields are always null;
it matched admin rules by looking up a category name in a map keyed by the raw assessment id
(never equal); and it read `equip.name`, a field that doesn't exist (real records use `title`).
Net effect: this function has returned empty results for every user, always, since it shipped.
Fixed to read `assessment_result:` (real score/max_score), resolve category via each result's
`assessment_def.category` field, compute severity from score percentage, and read `equip.title`.
Documented alongside the Scoring Engine (wired, empty, reserved for the future iKan Score) and
Rule Engine (18 real rules, some real coverage gaps) as three separate systems, each with a full
content doc and ER diagram under `src/docs/systems/`.

**`getEquip()`'s missing slug fallback finally fixed at the root, not just the data.** The same
orphaned-progress pattern already patched once this session (7 records, 1 user) recurred on a
second user — because only the data was fixed the first time, not the code.
`EquipService.getEquip(id)` now falls back to slug resolution on an id miss. Also: a full sweep of
every equip-related KV prefix against the final equip list found and fixed 4 stale Postgres
shadow-table rows (their KV originals had already been deleted in an earlier cleanup — confirmed
expected, not a new sync bug, since those two tables are genuinely shadow-copy-only with no live
write path in the current code).

**CBT and Mindfulness deleted — both were empty pricing stubs that never launched.** Zero
enrollments, zero day content, confirmed before deleting. 4 real equip programs remain: Sleep
Tight, Unburn, Stress Buster, Productivity Reset — every one of the original 7 had at least one
real issue; none were clean.

## 2026-08-06 (continued)

**Mood Journal admin editing fixed — real screen, real users, silently broken.**
`AdminMoodManager.tsx` called `/moods`, backed by `mood_type:` — zero records, always falling back
to a hardcoded mood set different from the real one. The live app read the real 5 records from
`mood:` via a completely different endpoint (`/scales/moods`). Fixed by folding mood editing into
`AdminCheckinScalesManager.tsx` as a "Mood" tab (it's already generic and data-driven — one config
entry, not new logic), deleting `AdminMoodManager.tsx`, and removing the dead `/moods` handlers.
Also found and removed while verifying: `index.tsx` had its own 3rd/4th duplicate set of `/moods`
routes (correct data, pure dead code from Hono's first-match routing). `metadata-seed.ts` renamed
to `metadata-catalog.ts` — "seed" implied automatic; it only ever runs on an explicit admin
"Sync All" click plus a confirm dialog.

**Metadata Catalog audited end-to-end — 2 real bugs found and fixed, plus an 8-record postscript.**
All 21 admin-configurable taxonomy types (content type, block type, consultant type, etc.) checked:
22 legacy `category:` records with no `type` field were silently polluting the Topic Categories
dropdown for ~9 consumers including public `Library.tsx` — an unordered KV scan meant which
duplicate won client-side dedup was non-deterministic. 21 were pure duplicates (deleted); the 1
genuinely unique record was retyped and kept. Separately, 6 `interaction_type` records were
mistyped duplicates of `checkin_block_type` entries (deleted). While fixing, found 8 more orphaned
`category:cat-mood_type-*` records — leftovers from a "Sync All" run before `mood_type`'s
retirement above — deleted, and the last residual wiring removed from `useMetadata.ts`. Two lower-
severity items (`media_type`, `checkin_block_type` — both correctly synced, zero real consumers)
left open as product decisions, not fixed.

**One equip program was live and broken.** `equip:73034a14-...`, an abandoned early duplicate of
Unburn with every content field empty and `title`/`slug` both blanked, was still `published: true`
— and the public `/equip/programs` endpoint doesn't check for a non-empty title/slug, so it was
actively serving an untitled, unusable card on the live program list. Confirmed zero enrollments,
then deleted both the record and its stale `equip_slug:` index entry.

**Remaining 3 equip programs audited, completing all 7.** Productivity Reset's day content is
clean but the program is `published:false` despite real enrollment activity, with 4 placeholder
`"yes"` metadata fields. CBT and Mindfulness are both empty pricing stubs — priced and slugged but
zero day content and zero enrollments, predating the UUID-id convention. Every one of the 7 equip
programs audited this session had at least one real content or data issue — none were clean.

## 2026-08-06

**Five previously-unscored assessments now produce a real result.** Anxiety, Depression, Stress,
Sleep, and Balance all had `scoring.ranges: null` and stored `resultCategories` that the player
never read, so every completion fell through to a generic "Assessment completed" message. Added
`overallCalc` presets for all five in `assessment-section-presets.ts`, verified against 19
hand-computed test cases: GAD-7/PHQ-9 now score only their real 7/9 clinical items instead of every
question on the page; Balance's mixed-direction scale (5 positive + 3 negative items) is reversed
correctly, so a genuinely well-balanced person no longer scores as "Imbalanced"; Stress and Balance
bands were rebalanced to their true achievable max (28 and 32, not the stored 40); Sleep's stored
result labels turned out to be inverted ("Poor"/"Healthy" swapped) and are now corrected, plus its
`sleep-q4` "Pooo" typo fixed directly in KV. `AssessmentFlow.tsx` overrides score/maxScore/
interpretation with the corrected values (and re-derives severity for the recommendation engine)
whenever an assessment has an overall but fewer than 2 named sections; `AssessmentResults.tsx`'s
report-card threshold moved to `sections.length >= 2` so only General/Burnout get the multi-scale
card. `admin-routes.ts` now derives `scoring.ranges` from `resultCategories` on every assessment
save, closing this dead-field bug class for future content edits. Separately, General's Anxiety and
Depression sections are now fully populated — `gen-anxiety-q2`, `gen-dep-q1`, `gen-dep-q2` copied in
verbatim from the standalone Anxiety/Depression assessments (no new authoring needed) and wired into
`GENERAL_SECTIONS`.

**Rule Engine found half-dead on inspection, not by report — then fixed.** The 18 real
`recommendation_rule:*` records are served to two frontend consumers by the same backend function.
Per-category equip targeting (`loadAdminRules`/`findMatchingAdminRules`) works correctly. The global
severity-band/messaging path (`loadEngineConfig`, via `/recommendations/engine-config`) did not — it
only extracts data from a rule when `.severity`/`.message` fields are present, which no real rule has,
so it silently fell back to hardcoded defaults while still reporting `loadedFromBackend: true`. Fixed
by tracking whether anything was actually applied instead of inferring it from row count, rather than
inventing a schema nothing authors against yet.

**Recommendation engine's hardcoded program-slug fallback fixed.** `'stress'` and `'burnout'` were
used as equip identifiers in the no-admin-rule fallback path — the real slugs are `stress-buster` and
`burnout-reset`; only `sleep-tight` happened to already be correct. Added a single
`resolveProgramSlug()` alias map applied everywhere a program id is resolved.

**Enrollment day-advancement fixed for users with multiple enrollment records.** Users routinely
accumulate several enrollment records per program (re-enrollment, double-submits — confirmed across
all three equips audited this session). `findEnrollmentAnyStatus` picked the first unordered array
match, so `completeDay`'s advancement could silently target a stale duplicate while the enrollment
record actually shown to the user stayed on `currentDay: 1` forever, even with correct underlying
`progress:` records. Now prefers active status, then most-recently-touched — the same logic
`getUserEnrollments` already used for display, just not previously applied to the write path.

**Two dead-but-live API surfaces removed.** `equip-routes.ts`'s day/block CRUD routes were fully
implemented and callable but never used by the frontend, which saves a program's entire day/block
tree as one inline `daily_content` array instead — left alone, they could write orphan `day:`/`block:`
records. `index.tsx` independently reimplemented `/categories` POST/PUT/DELETE alongside
`admin-routes.ts`'s `/admin/categories`, with the frontend only ever calling the latter — removed the
dead copy, but first ported its one real advantage (a resource-in-use delete guard) into the live
endpoint, which had been deleting categories unconditionally.

**Three full equip content-backup audits.** `src/docs/equips/{sleep-tight,burnout-reset,stress-buster}.md`
— verbatim landing/onboarding/day/block content plus enrollment/progress cross-checks against the real
tables. Found a literal build instruction shipped as live user-facing copy across 12 days of Sleep
Tight, a missing Day 28 in Unburn, out-of-range progress data on Stress Buster, and the
enrollment/progress disconnect above independently in all three.

**Edge function + frontend redeployed** to ship everything above — smoke-tested and confirmed live.

## 2026-08-05

**Sectioned assessment scoring (General & Burnout report cards).** Both assessments bundle several
independent clinical instruments; a single total score across GAD-2, WHO-5, self-efficacy and
resilience mixes scales with different ranges and opposite directions and is not a meaningful
number. Added `computeSectionScores()` (pure, unit-tested — 35 assertions including hand-worked
WHO-5=100, GAD-2=6, BAT-mean=5.0 cases), threaded `section_scores` through persistence and the
sessionStorage hydration path, and a new `SectionReportCard` UI showing per-scale rows with
direction-aware severity colouring (a high WHO-5 is good news; a high GAD-2 is not — colouring by
raw percentage would invert the positively-worded scales). Sections reference questions by ID, not
position — the original spec's positional ranges (q1–2, q3–4, etc.) did not match the actual
question order. Two content gaps remain open (Depression/PHQ-2 has no mapped questions; Anxiety/GAD-2
has 1 of 2 items) — see `PENDING.md`. Fixed a latent bug found along the way: both offline-queue
payloads dropped `maxScore` on sync, corrupting the iKAN score's fallback path.

**KV orphan detection rebuilt; cascading deletes added.** The orphan auditor was wrong in both
directions: it reported 328 real `day:`/`block:` records as orphaned (checking for `idx_*` index
keys that never existed in this database) while under-reporting real user-data orphans 19→1
(checking stale `user:{uid}` KV records instead of `auth.users`). Replaced with a declarative
`RELATIONS` table that joins on the actual value fields records carry. Equip deletion now cascades
to its day/block/progress/enrollment descendants instead of leaving them behind — the main source of
the orphan accumulation this was built to catch. Removed the `resource:` → `library:resource:`
mirror (written by delete only, so it always held stale pre-edit snapshots) and fixed
`professional:`/`consultant:` update+delete to find legacy `consultant:`-only records that were
previously visible but uneditable. Added a "Schema & Relations" view to the KV Audit admin screen,
surfacing an endpoint (`GET /admin/kv-schema`) that existed server-side with zero callers.

**Enrollment read bug and stuck day-advancement fixed.** `GET /user/enrollments` returned `[]` for
every user because it prefix-scanned a key shape that was never written — real enrollment records
use `enrollment:{enrollmentId}`, not `enrollment:{userId}:{equipId}`. This predates the session
(introduced 2025-12-30) and was unrelated to any KV purge. `completeDay`/`saveBlockResponse` had the
identical bug, so every enrollment's `current_day_number` was stuck at 1 regardless of actual
progress. Both fixed by locating the real record and writing back to its own key.

**Production domain restored.** `ikanhealth.in`'s nameservers had drifted to a third-party parking
service, serving a generic host placeholder instead of the app — unrelated to any code change.
Diagnosed via Vercel's domain inspection and fixed with the exact A-records Vercel specified
(including for `staging.`/`sandbox.` subdomains, which were already attached to the project and
just needed DNS).

## Session 13 (undated)

Renamed "Categories" → "Meta Manager" in the admin sidebar (route ID kept as `categories` for
backward compatibility). Removed the standalone "Mood Types" sidebar entry — `AdminMoodManager` is
now embedded inline under the Meta Manager's "Mood Types" tab. Added `mood_type` (8 seed items) and
`ema_category` (11 seed items) metadata types, bringing the total to 16. `POST /categories/sync` now
supports `updateExisting: true` to refresh icon/color/description on existing items rather than
skipping them. Migrated the last three hardcoded dropdown arrays
(`AdminCheckinTemplateBuilder`'s `EMA_CATEGORIES`, `EquipProgramWizard`'s category/difficulty
options, `AdminAssessmentManager`'s filter types) onto `useMetadata()`.

## Session 12 (undated)

Removed all `motion/react` and CSS animation references from admin UI components
(`AdminCheckinTemplateBuilder`, `AdminWidget`, `AdminErrorState`) to improve admin load performance.
User-facing components intentionally keep their animations. Fixed `AdminMediaManager` being
completely non-functional — its `api-client.ts` routes didn't match the deployed server endpoints
(`/admin/media/files` → `/media`, etc.).

## Session 11 (undated)

Fixed admin dashboard scroll hangs: a `backdrop-blur` + opacity sticky header forced expensive
recompositing on every frame, a resize handler fired synchronously per pixel instead of throttled,
and a `SuspenseScreen` wrapper was being recreated every render. Fixed the notification bell's
pointer-events and missing scroll-to-top. Made the Page Manager's validation error list the specific
invalid fields instead of a generic message.

## Session 10 (undated)

Fixed cold-load 404s on direct URL navigation (e.g. opening `https://ikanhealth.in/join/professional`
directly) — `currentRoute` was always initialized to `/` regardless of the actual URL, so the SPA
served the homepage instead of matching the route. Fixed by reading `window.location.pathname` in
the initial state.

## Session 9 (undated)

Fixed the professional-application link using `window.location.origin`, which resolved to whatever
preview domain the admin happened to be on rather than the production URL. Added a shared clipboard
utility with a legacy `execCommand` fallback for sandboxed iframes where the Clipboard API is
blocked.

## Session 8 (undated)

Full code audit of the iKAN Score pipeline end to end (server route → api-client → hook → card
component) — no defects found, all Session 7 fixes confirmed in place. Verified all three layers of
the MoodJournal chunk-loading defense (retry-with-backoff, a dedicated error boundary, preload on
touch/hover).

## Session 7 (undated)

Five bugs found and fixed in iKAN Score calculation: (1) the score route queried the wrong
enrollment prefix and field names; (2) `journal_by_user:{userId}` without a trailing colon could
theoretically prefix-match a different user's UUID; (3) a hardcoded `max_score` fallback of 100 was
wrong for clinical instruments with different real maximums (PHQ-9=27, GAD-7=21, etc.) — added a
lookup table; (4) WHO-5 was scored as "higher = distress" like every other instrument, when it's the
opposite; (5) assessment names fell back to raw IDs like `phq9` with no lookup to the real title.

## Session 6 (undated)

Added client-side image compression (resize + WebP conversion) before upload. Replaced the
console-only `logActivity()` no-op with a real endpoint persisting to `activity_log:` in KV. Fixed
`Math.min(...Object.values(pricing))` crashing when all consultant pricing values were 0 or
undefined.

## Session 5 (undated)

Removed ~900 lines of orphaned HTML template-literal content left behind after a prior function
removal. Fixed `is_admin` not appearing on the quick-auth object during the ~1-2s window before the
full profile fetch completed, by caching it in `localStorage`.

## Session 4 (undated)

Fixed dead "Back to Dashboard" / "Explore More Programs" buttons on program completion (props were
accepted but the parent never passed the corresponding navigation prop). Fixed a crash in
reassessment-trigger logic when `assessment_id` was missing on a record. Removed hardcoded fake
notification badge counts.

## Session 3 (undated)

Unified the equip/program KV prefix split — programs were being written to `equip:` in some paths
and `equip_program:` in others, with the public endpoint only reading one. Replaced hardcoded
Razorpay test-mode payment responses with real order creation and signature verification. Replaced
hardcoded booking time slots with a real date picker and server-persisted bookings. Fixed the
Equip Program Wizard crashing continuously due to (1) two `DndProvider` instances mounting
simultaneously across wizard steps, (2) a stale-closure bug in rapid-edit state updates, and (3) a
rich-text editor ref not resetting between blocks. Made the consultation page's expertise-category
filter data-driven instead of a hardcoded 36-item list.
