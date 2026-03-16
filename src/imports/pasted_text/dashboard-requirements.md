Dashboard should show 3 sections
1️⃣ Latest Assessment Result

Example

Mental Health Assessment
Completed Feb 24

Stress Level: Low
Score: 24/100

View Details

Only show the latest one.

2️⃣ Program Progress

Example

Stress Buster Program

Progress: Day 14 of 21

Latest Check-in:
Stress Level: Low
Feb 24

This connects:

Program → Check-ins
3️⃣ Assessment History (Optional)

Collapsed section:

Past Assessments

Example:

Feb 24 — Mental Health Check — Low
Jan 23 — Comprehensive Assessment — Low
Jan 4 — Dummy Assessment — Low
🧩 Data Model (What your backend likely has)

Your DB probably stores something like:

assessments
checkins
programs

But UI is showing them without grouping.

Correct logic:

Assessment
    -> baseline score

Program
    -> many check-ins

Checkin
    -> belongs to program
✨ How Dashboard Should Look

Example clean dashboard:

Your Mental Health Dashboard
------------------------------------------------

Latest Assessment
Low Stress Level
Score: 24/100
Feb 24

------------------------------------------------

Active Program
Stress Buster

Day 14 of 21

Latest Check-in
Low Stress
Feb 24

Continue Program →

------------------------------------------------

Past Assessments
Feb 24 — Mental Health Assessment — Low
Jan 23 — Comprehensive Assessment — Low
Jan 4 — Dummy Assessment — Low
🔧 Dev Fix Required

Your dev team should:

1️⃣ Filter raw entries

Do NOT show items starting with:

Checkin_
Asm_

Instead map them to readable names.

2️⃣ Group check-ins by program

Example:

Stress Buster Program
    Day 1
    Day 7
    Day 14
3️⃣ Hide incomplete scores

Filter:

score == 0

unless explicitly submitted.

💡 Product Improvement (Important)

You should also show a visual progress bar:

Stress Buster Program
██████████░░░░░░
Day 14 / 21

This dramatically improves engagement.