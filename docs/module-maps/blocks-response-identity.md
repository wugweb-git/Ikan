<!-- SPECIFICATION — nothing here is built. Traced 2026-09-04. -->

# Blocks — response identity

> **The block is what produces the response.** This is the last structural gap in
> the module and the one that makes everything else worth doing: a diary that
> runs for 31 days should produce a diary, not 98 unrelated facts.

## What identifies a response today

**`(userId, equipId, dayNumber, blockId)` — and nothing else.**

```
progress:{userId}:{equipId}:{dayNumber}
  └─ block_responses: { [blockId]: value }
```

`progress-service.ts:240`, `:326-351`. There is:

- **no per-response timestamp.** The only times are day-level `last_updated` and
  `completed_at`. Two answers on the same day are indistinguishable in time, and
  overwriting an answer leaves no trace of the previous one.
- **no `linkId`**, **no `occasion_id`**, and **no per-response status.**
  `completed` is a boolean on the *day*.
- **no use of `exerciseConfig.key`.** It is set on 98 of 407 blocks, is **not
  declared on `ExerciseConfig`**, and is **read by zero code**. Answers file
  under the block id, always — `ProgramPlayer.tsx:635`, `progress-service.ts:240`.

## Why that is the problem

Because `dayNumber` is in the storage key, the same block id on two days does
not collide — which is what makes carry-forward viable. What it does *not* give
you is a **thread**: "hours slept on day 3" and "hours slept on day 17" are
related only if an author happened to reuse the id.

`handleDuplicateDay` mints new ids. So the eleven duplicate-day clusters — 30
redundant days, 110 blocks — produced **thirty unrelated response sets** where
the author plainly meant one series. That is the Sleep Tight 19–25 case, and it
is why 98 input-tables cannot be charted.

`handleRepeatDay` (added 2026-09-04) preserves ids, so new content can thread.
Existing content cannot be repaired without naming the answers.

## What to add

**1 · `key` on the block — the answer's name.**

The field already exists in the target model (`content-hierarchy.ts:114`) and on
98 stored blocks. Declare it on `ExerciseConfig`, read it, and file the answer
under it when present:

```
block_responses: { [key ?? blockId]: value }
```

Falling back to `blockId` keeps every stored answer resolving. Check-in already
solved this with `save_as` — **adopt check-in's idea rather than inventing one.**

**2 · An occasion — which sitting produced this answer.**

`dayNumber` is not an occasion: a repeated block answered on day 3 and day 17 has
two occasions under one key, which is exactly the series worth charting. Store
per response:

```
{ value, key, block_id, day_number, occasion_id, answered_at, status }
```

`occasion_id` groups the answers given in one sitting. `answered_at` is what
makes a series a time series rather than a set.

**3 · Status, per response.**

`draft` vs `final` is the difference between a partial save and an answer. Today
a day is complete or not, so a half-typed table and a finished one are
indistinguishable — and `missing: invalidate` on the scoring side then treats a
resumed session as an invalid instrument.

## What breaks if this is skipped

- **Charting stays impossible** for the 98 input-tables, and for any block whose
  answers should form a series.
- **Carry-forward remains half a feature.** `on_demand` promises "a single
  evolving response" and delivers a fresh empty one per day, because there is no
  identity to evolve.
- **`progress-routes`' export cannot group.** It already labels rows by block id
  when the lookup fails; once ids repeat across days it becomes unreadable.

## Sequence

```
1  declare `key` on ExerciseConfig, expose it in the editor   additive
2  read it on write, falling back to blockId                  additive, reversible
3  backfill keys — 11 duplicate clusters first, ~30 names     content work
4  occasion_id + answered_at + status on the response shape   migration
```

Steps 1 and 2 are additive and change nothing that exists. Step 3 is the
expensive half and is **not derivable** — nobody computes "hours_slept" from a
block id, and the value is day 3's key matching day 17's, which is precisely
what a script cannot infer. Doing the duplicate clusters first covers the
highest-value case for ~30 decisions rather than 204.
