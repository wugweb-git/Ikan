# BRAND.md — iKan Health brand & content standards

Reference for anyone writing copy, designing UI, or configuring content in the iKan Health app.

---

## Identity

- **Product name**: iKan Health (stylised lowercase i, capital K)
- **Domain**: ikanhealth.in
- **Category**: Mental wellness SPA (Specialised Programme Application)
- **Market**: India-first; English-language interface

---

## Voice & tone

- Warm, calm, and non-clinical — not cold or medical
- Encouraging without being performatively positive
- Honest about limitations; never overpromise outcomes
- Short sentences; avoid jargon
- Refer to users' activities as "activities" — not "workouts"

---

## Emails & contact

| Purpose | Address |
|---------|---------|
| General support | support@ikanhealth.in |
| Privacy / data | privacy@ikanhealth.in |
| Transactional sender | support@ikanhealth.in |

Never use `@ikan.health` — that domain is retired. If you see it in content, data, or templates, replace it.

---

## India crisis resources

Use these standard resources anywhere crisis support is referenced (Terms & Conditions, Let's Talk, contact page, footer disclaimer):

| Resource | Contact |
|----------|---------|
| iCALL (TISS) | 9152987821 |
| KIRAN National Helpline | 1800-599-0019 (toll-free, 24×7) |
| Emergency (India) | 112 |
| International | befrienders.org |

Do **not** reference 988, 911, "Text HOME to 741741", or any US crisis lines.

---

## Design tokens (key colours)

Defined in `src/styles/globals.css`. Light-mode defaults:

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary-default` | (teal/brand colour) | CTAs, highlights |
| `--color-bg-muted` | `#F0F0F0` | Subtle surface, blockquotes |
| `--color-bg-input` | `#F3F3F5` | Input fields, selected states |
| `--color-text-primary` | Dark | Body text |
| `--color-text-muted` | Mid-grey | Labels, captions |
| `--grey-8` | Body-copy grey | Lesson text, paragraph copy |

Full palette and component semantics are in `src/guidelines/Guidelines.md`.

---

## Photos & media

- Team photos live in `public/team/` (kartik.jpg, vedanshu.jpg, vaibhav.jpg, amitabh.jpg, divyanshu.jpg, sachin.jpg)
- Photos display in greyscale by default, colour on hover
- All current images are square-cropped; maintain this for consistency
- Placeholder images use Unsplash; replace with real brand photography when available

---

## Legal & compliance copy

- Terms & Conditions must include India crisis resources (see above) and **not** reference 911 or US lines
- Privacy policy email must read `privacy@ikanhealth.in`
- All content referring to professional mental health services must include a disclaimer that iKan is a wellness app, not a substitute for clinical care

---

## What to avoid

- "Workout" — say "activity" or "exercise"
- "Track your workout" — say "track your activity"
- @ikan.health emails — retired domain
- US emergency numbers (911, 988, 741741)
- "Psychotherapy" / "therapy" claims in marketing copy unless explicitly cleared by the founding team
