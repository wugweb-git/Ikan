# iKan — Claude Code plan, 8 Sep 2026

Two phases. **Phase A must complete and verify before Phase B starts** — Phase B's
rule matching depends on the bands Phase A writes.

Authoritative inputs:
- `assessment-content-revision-2026-09-08.json` — the migration payload. Items,
  profiles, bands, interpretation strings. **This file is the spec for A2 and A3.**
- This document — sequence, rules, guards, non-goals.

You cannot read Notion and do not need to. Report in chat.

---

## Preconditions — check all three before writing anything

**1. Be the only agent on this tree.**
During the last run a second Claude session ran a broad `git add` and swept
`active-time.ts`, its tests, `assessment-routes.ts`, `useOfflineSync.ts` and the
`api-client` timing param into commit `667cba1e`, titled
*"feat(blocks): the requirements table runs against production content"*.
Nothing was lost; the history is mislabelled. Phase A writes production data.
Check for other `claude` processes. Serialise, or take a worktree.

**2. Re-measure HEAD yourself.** Every baseline hash written in prior briefs has
been stale. Establish HEAD and tree cleanliness before starting.

**3. Confirm the payload file is present** and its build-time assertions pass:
no band gaps or overlaps, every `severity_ref` in the five-term vocabulary,
zero `__NEEDS_COPY__` placeholders.

---

## Dependency map — read before sequencing

```
A1 backup
  └─ A2 items ──┐
  └─ A3 profiles┤
                └─ A4 validation gate  (HARD STOP: no write until 4/4 pass)
                     └─ A5 rescore     (DECISION: strict vs lenient, before writing)
                          └─ A6 verify
                               └─ B1 primary score flag   (DECISION: general's headline)
                                    └─ B2 rule fields + drop equip_id
                                         ├─ B3 slots / carousel
                                         ├─ B4 related assessments  (needs B2 picker)
                                         ├─ B5 articles             (needs B2 picker)
                                         ├─ B6 priority direction   (DECISION: which way)
                                         ├─ B8 engine reconciliation
                                         └─ B9 rename admin screen
                                              └─ B7 consultants     (BLOCKED: no real records)
```

**Hard dependencies, and why:**

| This | needs | because |
|---|---|---|
| A4 | A2 + A3 | the gate enumerates scores from the new items against the new bands |
| A5 | A4 | never rescore against bands that have not passed tiling |
| **B (all)** | **A6** | a rule matches on `min_severity` against a band's `severity_ref`. Until A3 ships, 8 bands carry values outside the five-term vocabulary and their rules cannot fire at all. |
| B2..B9 | B1 | 3 of 7 assessments return `[]` before any rule is read |
| B4, B5 | B2 | both need the target picker B2 introduces |
| B7 | real practitioner records | the entire people layer is test data |

**Cross-phase trap:** A3 changes band boundaries, which changes which rules
fire. Balance gains `Severe` and `Potentially Dangerous` but its highest rule is
gated at `moderate`. Do not treat the 18 rules as stable across Phase A.

**Three decisions gate progress. None is yours:**

| # | Decision | Blocks | Cost of guessing |
|---|---|---|---|
| 1 | Strict vs lenient rescore | A5 | 72 vs ~46 results excluded from trends |
| 2 | General's primary score | B1 | changes what the whole assessment recommends |
| 3 | Priority sort direction | B6 | silently changes what every user is recommended |

Ask. Do not default.


---

# PHASE A — Content revision + scoring migration

## Decisions locked — do not reopen

- Kartik's revision is accepted in full. **No cut-point moves. No question text
  changes beyond the payload.**
- Bands are contiguous: a score belongs to a band when `min <= x < max`, except
  the last band, which is `min <= x <= max`.
- `severity_ref` is one of: `minimal`, `mild`, `moderate`, `moderately-severe`,
  `severe`. Labels stay verbatim; only the machine term was normalised.
- Sleep has three bands on Kartik's own 32 boundary:
  Healthy `8 <= x < 17` minimal, Poor `17 <= x < 32` moderate,
  Very Poor `32 <= x <= 40` severe.
- **`depression-q10`'s risk flag is REOPENED on safety grounds. See the box
  below. Do not execute A2's flag step until Vedanshu has ruled.**
- Seven interpretation strings in the payload were drafted by Claude, not
  Kartik. Ship them as-is.

## SAFETY — blocks A2. Read before starting.

**`is_risk_indicator` is read, and it fires a crisis pathway.** Measured in the
codebase: `AssessmentFlow.evaluateRisk` calls `triggerCrisisSupport` from this
field. Earlier planning documents said nothing read it. That was wrong.

As the payload stands, after A2:

- `depression-q9` becomes *"Thoughts that you would be better off dead or of
  hurting yourself in some way"* and carries **no** flag. Endorsing suicidal
  ideation triggers nothing.
- `depression-q10` — *"How difficult have the above problems made it..."* —
  **gains** the flag and fires the crisis pathway on "Somewhat difficult".

Two failures. The first is the dangerous one.

**Recommendation: flag `q9`, not `q10`.** This mirrors `general-q5`, which is
the identical sentence, carries the flag today, and works. The crisis pathway
should fire on endorsing ideation, not on reporting difficulty.

Flagging *both* is worse than it looks: a crisis panel that fires for everyone
reporting mild difficulty trains people to dismiss it, degrading the mechanism
for the people who need it.

**This deviates from the accepted payload and requires Vedanshu's explicit
word. Until he gives it, do A2's other steps and leave depression's flags
untouched.**

---

## A1 — Back up

`backup_pre_content_revision_2026-09-08` covering all 7 `assessment_def:`,
all 11 `scoring-profile:`, and every `assessment_result:` row including
`:latest` twins. **Read the backup back before touching anything.**

## A2 — Items

Three parts. All from the payload.

**a. Content.** 30 item text rewrites, 3 new stress ids (`stress-q8/q9/q10` on
the existing 0-4 stress scale), reverse flags added to `stress-q4/q5/q7/q8` and
removed from `balance-q1/q3/q4/q5/q7`, `general-q18` moves from
`gen-resilience` to `gen-self-efficacy`, `stress-total.items` becomes
`stress-q1`..`q10`, `depression-q10` gains `is_risk_indicator`.

**b. `normalise_options` on burnout.**
Burnout is the only one of seven whose `options` are bare strings; the other six
store `{text, value}`. Rewrite all 23 questions' options into object form,
taking each value from that question's own `scoring` map.
Verified before specifying: **all 23 questions carry a byte-identical options
array and a byte-identical scoring map.** One transform, not 23 cases.
Label text unchanged to the byte, so no stored response is orphaned.
Do not touch `scoring{}`.

**c. `question_options` on `depression-q10` and `anxiety-q8`.**
Both ask *"How difficult have the above problems made it..."* and currently
offer the frequency scale, so every respondent has answered "how difficult"
with "Several days". Relabel to Scale F:
`1 Not difficult at all` (0), `2 Somewhat difficult` (1),
`3 Very difficult` (2), `4 Extremely difficult` (3).
**Question ids unchanged. Four options unchanged. Weights 0-3 unchanged.**
Only the four strings and the scoring-map keys.
Safe only because both are `is_scored: false` and belong to no score.

> Beyond A2b and A2c, do not touch any `options` array or any `scoring` map.
> Zero option changes on any scored question — that is what keeps stored
> results readable.

## A3 — Profiles

Eleven profiles from the payload. **31 band rows written, plus `phq9`'s 5
unchanged = 36 bands in the spec.** Four band ids retired:
`bal-band-balanced`, `bal-band-strained`, `bal-band-imbalanced`, `who5-below`.
Tone values are Kartik's, unchanged.

## A4 — Validation gate, before any write

Refuse the migration unless all four pass. Print every failure.

1. **Tiling.** Enumerate every achievable score per profile from its items x
   option weights. Each must land in exactly one band. For `bat-mean`, check
   every item count 1-23 — it is the one profile that permits a partial set.
2. **Vocabulary.** Every `severity_ref` in the five-term list.
3. **Answerability.** `min_answered` <= item count on every score. This alone
   catches `brs` at 7-required on 6 items.
4. **Scale integrity — read this carefully.**

> The previous brief specified check 4 as *"every option label is a key in that
> question's scoring map"*. **That cannot be written as specified** — burnout
> would fail a guard it actually passes, because its values live only in that
> map.
>
> Validate the **derived** scale instead, through the full resolution chain:
> `option.value` -> question `scoring` map -> array index. Assert the derived
> weights are complete and consistent for every question.
>
> After A2b every assessment carries `option.value`, so the chain resolves at
> step one throughout. Write the guard against the derived scale anyway, so it
> keeps working if that regresses. **Make it a standing check, not a one-off.**
> It is the permanent guard against the defect that made burnout read a full
> point low.

## A5 — Rescore

### The rule — three tests, in order

A stored result is rescorable only if it passes all three:

1. **Item set.** Stored `responses` cover exactly the current scored item ids.
2. **Label resolution.** Every stored answer string is a key in that question's
   *current* `scoring` map. **Never fall back to array index. Never
   digit-recover from a label.** Option labels are not stable across versions:
   `pre-spec` burnout rows hold `3 - Often` at weight 3 where the current scale
   has `4 - Often` at weight 4. Same text, different value.
3. **Construct continuity.** The question the user answered still means the
   same thing. An item whose text was *replaced* does not transfer; an item
   whose text was *elaborated* does.

Anything failing any test is stamped `pre-spec` with
`excluded_from_trends: true`. **Skip existing `pre-spec` rows entirely** — they
are unrecoverable by design, not "failing to match".

### Test 3 applied — measured, do not re-derive

Each of the 30 rewrites was diffed against the live text. Result:

| Instrument | What changed | Class | Rescorable? |
|---|---|---|---|
| Anxiety | nothing | — | yes, but nothing to rescore |
| General | no text changes; `ngse`/`brs` re-split only | — | **yes — rescore** |
| Depression | q3/q6/q7/q8 elaborated to full PHQ-9 wording (same items); **q9 replaced**: "Feeling that life is meaningless" -> "Thoughts that you would be better off dead or of hurting yourself in some way" | q9 replaced, and it is in `phq9-total` | **no** |
| Sleep | **q8 replaced**: "How often does poor sleep affect your energy?" -> "Finally how long have you had a problem with your sleep?" — and its options were already the duration scale, so the old text never matched them | replaced | **no** |
| Stress | q1-q7 all replaced (generic stress items -> PSS-10 wording) plus 3 new ids | replaced + new ids | **no** |
| Balance | all 8 replaced (work-life balance -> workplace strain) | replaced | **no** |
| Burnout | q1-q8 replaced ("I feel detached from my work" -> "At work, I feel mentally exhausted"); q19 typo fix only | replaced, and subscale composition changes meaning | **no** |

### Population — measured 8 Sep 2026, 88 canonical results

| Assessment | Results | already pre-spec | Outcome |
|---|---|---|---|
| Feeling worried and stressed | 41 | 11 | all 41 -> pre-spec |
| Struggling with quality sleep | 13 | 3 | all 13 -> pre-spec |
| Unsure or general concern | 10 | 4 | rows holding all 24 ids -> **rescore** |
| Feeling drained and burned out | 8 | 2 | all 8 -> pre-spec |
| Feeling overwhelmed and anxious | 6 | 1 | unchanged, no rescore |
| Feeling depressed and hopeless | 5 | 1 | all 5 -> pre-spec |
| Struggling to balance life | 5 | 2 | all 5 -> pre-spec |

**Strict outcome: 72 of 88 (82%) excluded from trends.**

> **THIS IS THE ONE DECISION THAT NEEDS VEDANSHU BEFORE YOU WRITE.**
> Applying only tests 1 and 2 — ignoring construct continuity — leaves roughly
> 46 excluded instead of 72, because depression, sleep, balance and burnout
> would all rescore on ids and labels alone.
> They would produce arithmetically valid numbers from answers given to
> different questions.
> **Recommended: strict.** In a clinical product a missing number is better
> than a wrong one. But surface both counts and get the call before writing.

`gen-resilience` note: `brs` moves from `sum` to `mean`. Stored resilience
values are sums of 7-35; the new bands are a mean of 1-5. **Without a rescore
every stored resilience score renders blank, not merely wrong.** General is the
one instrument that both needs and can take a rescore.

Write to both the canonical row and its `:latest` twin. All 42 pairs are
byte-identical today; keep them so.

## A6 — Verify

- Run all 7 assessments end to end. Check every score, denominator and band
  label against the payload.
- Confirm `brs` produces a value at all — as originally authored it could not.
- Confirm sleep 32 and sleep 40 each render a band.
- Confirm gad7 7, 9, 14 and stress 13, 26, 40 each render a band.
- Confirm burnout still scores correctly after `normalise_options`, and that
  every stored burnout response still resolves.
- Confirm `depression-q10` and `anxiety-q8` render Scale F, and that no score
  moved as a result.
- Confirm every band's `severity_ref` resolves and can match a rule.

## Phase A non-goals

- No option label or weight changes on any **scored** question.
- No tone changes.
- Do not move `depression-q10`'s risk flag.
- Do not touch the results UI, recommendations or the iKan Wellness Score.
- Do not deduplicate the `:latest` copies.

---

# PHASE B — Make recommendations work

Run only after Phase A is verified.

**The problem: zero of seven assessments produce a recommendation.** Three stop
before any rule is read; four match rules that have no copy to render.

## B1 — The `primary` score flag. Do this first.

`findMatchingAdminRules` reads `severityLevel` from an overall score.
Depression, anxiety and general have no single headline score, so
`severityLevel` is `null` and the function returns `[]` at its null guard.
**Three of seven assessments never reach the rule table at all.**

No score anywhere carries a `primary` marker — 17 scores, 0 flagged. Add one.

| Assessment | Mark primary |
|---|---|
| Feeling depressed and hopeless | `phq9-total` |
| Feeling overwhelmed and anxious | `gad7-total` |
| Feeling drained and burned out | `bat-overall` |
| Stress, Sleep, Balance | the single score; mark for consistency |
| Unsure or general concern | **ASK VEDANSHU** |

> General runs GAD-2, PHQ-2, WHO-5, NGSE and BRS — two distress screens, a
> wellbeing index and two strengths measures. Whichever is picked changes what
> the whole assessment recommends. **Do not pick a default.**

Nothing downstream works until B1 lands.

## B2 — The rule record

Enumerated from the store: the record has exactly ten fields, and **none of them
is `title`, `body`, `cta` or `enabled`.** That is why every result renders
`primaryAction.type: "none"`.

- **Add** `title`, `body`, `cta`, `enabled`.
- **Drop `equip_id`** — it duplicates `target_id` on all 18 rows (18 identical,
  0 differing). Legacy from when a rule could only point at a programme. It must
  go before any non-equip rule exists, or a rule will carry an `equip_id`
  naming something that is not a programme.

Add all four fields to the Rules Engine form. **Do not author the copy** — that
is Kartik's, for all 18 rules.

## B3 — Slots

A recommendation is a set of blocks. The slot is derived from
`recommendation_type` — **no new field**.

| Order | Slot | Type | Count | Component |
|---|---|---|---|---|
| 1 | Primary action | `equip` | exactly 1, highest priority | `EquipBlock` |
| 2 | Related assessments | `assessment` | 0..n | `AssessmentBlock`, `AssessmentCard` |
| 3 | Articles | `resource` | 1..n | `ResourceCard` — stacked at 1-2, **carousel at 3+** |
| 4 | Related programmes | `equip` below primary | 0..n | `EquipBlock` |
| 5 | Consultants | `consultant` | 0 — later | `ConsultantCard` |

**All five components exist and are styled. Build no new card.** The carousel
above two items is the only new UI. Cap per slot is one configuration value, not
a per-rule field.

## B4 — Related assessments

`DEFAULT_OVERLAP_MAP` and `DEFAULT_ESCALATION_RULES` are compiled into
`lib/recommendation-engine.ts`. They produced the two programme cards on the
Stress result — not the 18 admin rules. The map is keyed on category and
currently resolves to *programmes*.

Migrate it into `assessment`-type rules so it is editable and resolves to the
assessments it names. Add the target picker over the 7 `assessment_def:`
records.

> **An `assessment` rule must never target the assessment just completed**, or
> the result recommends retaking itself. Enforce at save, not at render.

## B5 — Articles

Nine `resource:` records exist. Content is there; rules and picker are not.

> **Do not join the reading slot on `category`.** The vocabularies differ.
> Assessments: `depression`, `anxiety`, `stress`, `sleep`, `balance`,
> `burnout`, `general`. Articles: `sleep`, `general`, `stress`,
> **`mental-health`**.
> `mental-health` matches nothing, and **no article is tagged `depression`,
> `anxiety`, `burnout` or `balance`** — four of seven assessments would return
> an empty slot. One is miscategorised outright: *"Beyond the 'Worry Loop':
> How the GAD-7"* is filed under `sleep`.
> **A `resource` rule points at an article by id**, exactly as an `equip` rule
> points at a programme. Re-tagging the nine articles is content work and is not
> in this plan.

## B6 — Priority direction

The code sorts **ascending** — lowest wins — in both `findMatchingAdminRules`
and `recommendation-service`. The data is authored the other way: **10 marks the
strongest rules.** The intended winner sorts last.

Settle the direction, state it in the admin UI, migrate the 18 rows if it flips.
**Confirm with Vedanshu before migrating** — this silently changes what every
user is recommended.

## B7 — Consultants: blocked, do not build

> **The entire practitioner layer is test data.** 5 `consultant:` rows on
> sequential placeholder UUIDs (`0000...0300` to `0304`); of 12 `professional:`
> rows, **nine are "Dr. Test Professional 1/2/3", each duplicated three times**,
> and the other three repeat consultant names.
> `ConsultantCard` is built and the type is specified, but there is nothing
> truthful to point it at. **Do not add the `consultant` type or its picker
> until real practitioner records exist.**

## B8 — Reconcile the two engines

`lib/recommendation-engine.ts` (client) and
`supabase/functions/server/recommendation-service.ts` (server) implement the
same matching independently. Two implementations of one rule set will drift.
One should be authoritative. **Propose which before changing either.**

## B9 — Rename the admin screen

`AdminDashboard.tsx:222` labels it "Rules Engine" in the `configuration` group.
Nothing in the label says *recommendations*, which is why it reads as missing.
One line.

## Guard rails to enforce at save

| Rule | Why |
|---|---|
| An enabled rule must have `title`, `body` and `cta` | the exact defect producing `primaryAction.type: "none"` today |
| `min_severity` in the five clinical terms | anything else fails comparison and the rule silently never fires |
| An `assessment` rule must not target its own assessment | recommends retaking itself |
| `target_id` must resolve to a live record | a dangling id renders an empty card |

## Report to Vedanshu, do not act on

- **Balance is flat above `mild`.** Its highest rule is gated at `moderate`, but
  the revision adds `Severe` and `Potentially Dangerous`. A user at 26/40 and
  one at 39/40 get an identical recommendation.
- **General has one rule**, gated at `mild`, though it can reach
  `moderately-severe`.
- **Productivity Reset appears in no rule** and can never be recommended.

## Phase B order and non-goals

**B1 -> B2 are the whole difference between zero recommendations and a working
primary slot.** Everything after adds blocks to something that already renders.
B7 is blocked on content. B3-B6, B8, B9 in any order after B2.

Non-goals:
- Do not author rule copy, rules, or article tags — content is Kartik's.
- Do not change the results screen's visual style. The card swap needs a
  rendered before/after, not a blind substitution.
- Do not build the consultant slot.
- Do not touch scoring, the instruments or the iKan Wellness Score.

---

## Report back, both phases

Per item: what changed, file and line, and the measurement proving it.
For A5: the full before/after table for every rescored row and the exact count
marked `pre-spec`.
For B1: confirm all seven assessments now resolve a `severityLevel`.
For B2: confirm a rule with copy renders a card end to end.
A returned URL is not a deploy — `vercel ls --prod` must read `Ready`.
