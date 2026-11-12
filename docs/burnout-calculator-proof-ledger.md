# Burnout cost calculator: proof ledger

Every public claim on `/burnout-cost-calculator`, matched to the evidence it rests on. A claim that
is not *Backed* or *Qualified* does not ship. The evidence is the workbook's Sources tab (research
date 28 Oct 2026) and the sources it cites; nothing was looked up for this check.

Checked 2026-11-12, against model v2.1.

| Claim on the page | Evidence | Status |
|---|---|---|
| A 75-person software company: about ₹35 lakh a year, 3.9% of payroll, range ₹22 to 52 lakh | Model v2.1 output; fixed by `burnout-cost-model.test.ts` | Backed (labelled "on this model") |
| Presenteeism estimated at 3 to 4 times the sick-day cost, the method Deloitte India used | S9 Deloitte India 2022 | Backed |
| 3, 3.5 or 4 times, inside the range Deloitte assumed | S9; 3.5 is our midpoint | Qualified |
| Prevalence 13% at low stress | S11 GPTW India: 13% in a high-burnout category | Qualified (mapping stress to prevalence is labelled Judgement) |
| Prevalence 45% at high stress | S9: 55% of 3,304 symptomatic of 3,995, rounded | Qualified (Derived) |
| Deloitte: poor mental health costs Indian employers about ₹1.1 lakh crore a year | S9 | Backed, worded as poor mental health, broader than burnout, not like for like |
| Overall attrition 18% (2026) | S1 Aon via Wocult | Backed, secondary coverage stated |
| 20 / 25 / 30% of voluntary exits burnout-related | None (S10, S13 give shares of respondents) | Qualified as Judgement |
| 1.5 to 2.5 extra sick days | None; bounded by S23 | Qualified as Judgement |
| Kept under the 6 to 12 sick days most private employers give | S23 greytHR | Backed (was "statutory": stronger than the evidence, fixed) |
| "Published estimates range from 2.5 to 10 times" | Not in the evidence | Removed |
| Not an audit of your company | Describes the method | Backed |
| Nothing you enter leaves your browser unless you send it to us | Network panel, 2026-11-12: no request carries an input | Backed (GA fragment behaviour still to check in production) |

Excluded claims (shown on the page as excluded): the 62% startup burnout figure, "1.5 to 2% of
payroll per Deloitte", "68% of IT professionals", startup attrition of 50 to 80%. See
`src/shared/content/burnout-sources.ts`.
