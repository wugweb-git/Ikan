# System Architecture Visual - Sleep Equip Complete System

## 🏗️ THREE-TIER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN LAYER                              │
│                    (Content Creation)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Equip Program Edit Page Wizard                                 │
│                                                                  │
│  Step 1: Basic Info                                              │
│  Step 2: Equip Details                                           │
│  Step 3: Onboarding (User Intake)                               │
│  Step 4: Daily Program Builder ← THE CORE                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Day Navigator (Sidebar)                           │         │
│  │  ├─ Day 1 (3 blocks • 10 min)                      │         │
│  │  ├─ Day 2 (4 blocks • 50 min)                      │         │
│  │  ├─ Day 3 (2 blocks • 30 min) ← Selected           │         │
│  │  └─ ...                                             │         │
│  │                                                     │         │
│  │  Day Editor (Main Canvas)                          │         │
│  │  ┌──────────────────────────────────────┐          │         │
│  │  │ Day 3: Digging Deeper               │          │         │
│  │  │ [Upload Hero Image]                 │          │         │
│  │  │                                      │          │         │
│  │  │ Block Stack (Ordered)                │          │         │
│  │  │                                      │          │         │
│  │  │ Block 1: Exercise (Table)            │          │         │
│  │  │ ┌────────────────────────────────┐   │          │         │
│  │  │ │ Type: Exercise                 │   │          │         │
│  │  │ │ Title: Your Thought Record     │   │          │         │
│  │  │ │ Content: Now it's your turn... │   │          │         │
│  │  │ │                                │   │          │         │
│  │  │ │ ✏️ EXERCISE CONFIGURATION      │   │          │         │
│  │  │ │ Exercise Type: Structured Table│   │          │         │
│  │  │ │ Columns:                       │   │          │         │
│  │  │ │   Time|text|yes                │   │          │         │
│  │  │ │   Situation|text|yes           │   │          │         │
│  │  │ │   Affect sleep?|boolean|yes    │   │          │         │
│  │  │ │ ☑ Progressive (continues i04)  │   │          │         │
│  │  │ │                                │   │          │         │
│  │  │ │ [Upload Block Image]           │   │          │         │
│  │  │ │ Duration: 25 min               │   │          │         │
│  │  │ │ Data ID: i04+                  │   │          │         │
│  │  │ │ ☑ Required                     │   │          │         │
│  │  │ └────────────────────────────────┘   │          │         │
│  │  │                                      │          │         │
│  │  │ [+ Add Block] [Lesson] [Exercise]... │          │         │
│  │  └──────────────────────────────────────┘          │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  Output: equip_programs table (JSONB: daily_content)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                    [Publish Program]
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│                   (Runtime Tracking)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. user_program_enrollments                                     │
│     ├─ enrollment_id                                             │
│     ├─ current_day: 3                                            │
│     ├─ status: 'active'                                          │
│     └─ onboarding_responses: { i01: "...", i02: [...] }         │
│                                                                  │
│  2. user_day_progress                                            │
│     ├─ day_number: 3                                             │
│     ├─ status: 'in_progress'                                     │
│     ├─ completed_blocks: 1 / 2                                   │
│     └─ actual_time_minutes: 15                                   │
│                                                                  │
│  3. user_block_completions                                       │
│     ├─ block_id: 'd3_b1'                                         │
│     ├─ status: 'completed'                                       │
│     ├─ time_spent_seconds: 900                                   │
│     └─ has_response: true                                        │
│                                                                  │
│  4. user_exercise_responses                                      │
│     ├─ data_id: 'i04+'                                           │
│     ├─ base_data_id: 'i04' ← Links to Day 2 data                │
│     ├─ response_type: 'table'                                    │
│     └─ response_data: { rows: [...] }                            │
│         ├─ Row 1 (from Day 2, edited)                            │
│         ├─ Row 2 (from Day 2, edited)                            │
│         └─ Row 3 (new, added today)                              │
│                                                                  │
│  5. user_habit_tracking                                          │
│     └─ Daily checklist completion                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                      [Query for Metrics]
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                                │
│                   (Runtime Experience)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Home Screen                                                     │
│  ┌───────────────────────────────┐                              │
│  │ Today — Day 3                 │                              │
│  │ Digging Deeper                │                              │
│  │ ⏱ 30 min                       │                              │
│  │ Progress: 1/2 blocks           │                              │
│  │ [Continue]                     │                              │
│  └───────────────────────────────┘                              │
│                                                                  │
│  Day View (In-Progress)                                          │
│  ┌────────────────────────────────────────────┐                 │
│  │ [Day 3 Hero Image]                         │                 │
│  │                                            │                 │
│  │ Day 3: Digging Deeper                      │                 │
│  │ Pattern recognition                        │                 │
│  │                                            │                 │
│  ├────────────────────────────────────────────┤                 │
│  │                                            │                 │
│  │ Block 1: Exercise (Structured Table) ✓     │                 │
│  │ [Block Image]                              │                 │
│  │ Your Thought Record                        │                 │
│  │                                            │                 │
│  │ ┌──────────────────────────────────────┐   │                 │
│  │ │ Time   │ Situation │ Affect sleep?   │   │                 │
│  │ ├────────┼───────────┼─────────────────┤   │                 │
│  │ │ 11:30  │ In bed    │ ☑ Yes           │   │  (From Day 2)  │
│  │ │ 12:00  │ Awake     │ ☑ Yes           │   │  (From Day 2)  │
│  │ │ 11:00  │ Worried   │ ☑ Yes           │   │  (Added today) │
│  │ └──────────────────────────────────────┘   │                 │
│  │ [+ Add Row] [Save]                         │                 │
│  │                                            │                 │
│  ├────────────────────────────────────────────┤                 │
│  │                                            │                 │
│  │ Block 2: Conclude 🔒                       │                 │
│  │ (Unlocks when Block 1 complete)            │                 │
│  │                                            │                 │
│  └────────────────────────────────────────────┘                 │
│                                                                  │
│  Day Complete → Affirmation                                      │
│  ┌────────────────────────────────────────┐                     │
│  │ 🎉 Day 3 Complete!                     │                     │
│  │                                        │                     │
│  │ Great work today. You've built         │                     │
│  │ awareness of your patterns.            │                     │
│  │                                        │                     │
│  │ Come back tomorrow for Day 4!          │                     │
│  │ [Done]                                 │                     │
│  └────────────────────────────────────────┘                     │
│                                                                  │
│  Report Card (After Completion)                                  │
│  ┌────────────────────────────────────────┐                     │
│  │ Your Sleep Tight Report Card           │                     │
│  ├────────────────────────────────────────┤                     │
│  │ 📅 Consistency Score        78%       │                     │
│  │    7 out of 9 days completed          │                     │
│  │                                        │                     │
│  │ ✅ Habit Adherence (7-day)  82%       │                     │
│  │    Sleep hygiene checklist            │                     │
│  │                                        │                     │
│  │ 🧠 Cognitive Awareness      6 days    │                     │
│  │    Active thought tracking            │                     │
│  │                                        │                     │
│  │ 🌙 Sleep Hygiene Adoption   65%       │                     │
│  │    13/20 nights with ritual           │                     │
│  │                                        │                     │
│  │ 🎯 Engagement               14 days   │                     │
│  │    Active participation               │                     │
│  └────────────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW: PROGRESSIVE EXERCISE EXAMPLE

```
DAY 2: CREATE BASE TABLE (i04)
┌─────────────────────────────────────────────────┐
│ Admin Creates Block                             │
│ ├─ Data ID: i04                                 │
│ ├─ Columns: Time, Situation, Thoughts, Feelings │
│ └─ Pre-filled: 2 read-only example rows         │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ User Completes Block (Read-Only)                │
│ └─ Views 2 examples, learns structure           │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Database: user_exercise_responses               │
│ ├─ data_id: 'i04'                               │
│ ├─ base_data_id: 'i04'                          │
│ └─ response_data: { rows: [] } (empty for now) │
└─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════

DAY 3: CONTINUE TABLE (i04+)
┌─────────────────────────────────────────────────┐
│ Admin Creates Block                             │
│ ├─ Data ID: i04+                                │
│ ├─ ☑ Progressive: true                          │
│ ├─ Columns: Time, Situation, Thoughts, Feelings,│
│ │            Affect Sleep? ← NEW COLUMN         │
│ └─ Now editable                                 │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Backend Loads Previous Data                     │
│ 1. Extract base_data_id: 'i04+' → 'i04'        │
│ 2. Query: WHERE base_data_id = 'i04'           │
│ 3. Load previous rows (if any)                  │
│ 4. Add new column: 'Affect Sleep?'             │
│ 5. Present to user for editing                  │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ User Edits Table                                │
│ ├─ Row 1: Add "Yes" to Affect Sleep            │
│ ├─ Row 2: Add "Yes" to Affect Sleep            │
│ └─ Row 3: Add new entry (NEW)                  │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Database: user_exercise_responses               │
│ ├─ data_id: 'i04+'                              │
│ ├─ base_data_id: 'i04' ← SAME BASE             │
│ └─ response_data: {                             │
│      rows: [                                    │
│        { time: "11:30", situation: "In bed",    │
│          affect_sleep: true },                  │
│        { time: "12:00", situation: "Awake",     │
│          affect_sleep: true },                  │
│        { time: "11:00", situation: "Worried",   │
│          affect_sleep: true }                   │
│      ]                                          │
│    }                                            │
└─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════

DAY 6: NEW TABLE (i07)
┌─────────────────────────────────────────────────┐
│ Admin Creates Block                             │
│ ├─ Data ID: i07 ← NEW BASE ID                  │
│ ├─ Columns: Disturbance, Ways to Reduce        │
│ └─ Unlimited entries                            │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ User Brainstorms Solutions                      │
│ ├─ Row 1: Phone → Put in another room          │
│ ├─ Row 2: Noise → White noise machine          │
│ └─ Row 3: Thoughts → Journal before bed        │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Database: user_exercise_responses               │
│ ├─ data_id: 'i07'                               │
│ ├─ base_data_id: 'i07'                          │
│ └─ response_data: { rows: [3 solutions] }      │
└─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════

DAY 7: CONTINUE TABLE (i07++)
┌─────────────────────────────────────────────────┐
│ Admin Creates Block                             │
│ ├─ Data ID: i07++                               │
│ ├─ ☑ Progressive: true                          │
│ ├─ Max Entries: 10 per disturbance              │
│ └─ Same columns                                 │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Backend Loads i07 Data                          │
│ └─ Previous 3 solutions loaded                  │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ User Adds More Solutions                        │
│ ├─ Row 4: Phone → Schedule downtime             │
│ ├─ Row 5: Phone → Use alarm clock instead       │
│ └─ ...up to 10 total solutions                  │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Database: user_exercise_responses               │
│ ├─ data_id: 'i07++'                             │
│ ├─ base_data_id: 'i07' ← SAME BASE             │
│ └─ response_data: { rows: [8 solutions] }      │
└─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════

DAY 8: EVALUATE TABLE (i07+++)
┌─────────────────────────────────────────────────┐
│ Admin Creates Block                             │
│ ├─ Data ID: i07+++                              │
│ ├─ ☑ Progressive: true                          │
│ ├─ Columns: Disturbance, Way to Reduce,         │
│ │            Pros (RTF), Cons (RTF), Balanced   │
│ └─ Adds 3 new columns                           │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Backend Loads i07 Data                          │
│ └─ Previous 8 solutions loaded                  │
│ └─ New columns added (empty)                    │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ User Evaluates Each Solution                    │
│ Row 1: Phone → Put in another room              │
│   Pros: Won't be tempted                        │
│   Cons: Miss emergency calls                    │
│   Balanced: Put in next room with volume up     │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│ Database: user_exercise_responses               │
│ ├─ data_id: 'i07+++'                            │
│ ├─ base_data_id: 'i07' ← SAME BASE             │
│ └─ response_data: {                             │
│      rows: [8 solutions with evaluations]       │
│    }                                            │
└─────────────────────────────────────────────────┘
```

---

## 🔄 STATE TRANSITIONS

```
ENROLLMENT LIFECYCLE
┌─────────────┐
│   User      │
│  Discovers  │
│  Program    │
└──────┬──────┘
       ↓
┌─────────────┐    POST /api/enroll
│  Enroll &   │ ─────────────────────→ user_program_enrollments
│ Onboarding  │                        status: 'active'
└──────┬──────┘                        current_day: 0
       ↓
┌─────────────┐    Complete onboarding
│   Start     │ ─────────────────────→ current_day: 1
│   Day 1     │                        started_at: NOW()
└──────┬──────┘
       ↓
┌─────────────┐    Complete all required blocks
│  Complete   │ ─────────────────────→ user_day_progress
│   Day 1     │                        status: 'completed'
└──────┬──────┘                        Day 2 auto-unlocks
       ↓
┌─────────────┐
│  Continue   │
│ Days 2-9    │
└──────┬──────┘
       ↓
┌─────────────┐    Complete Day 9
│  Complete   │ ─────────────────────→ user_program_enrollments
│  Program    │                        status: 'completed'
└──────┬──────┘                        completed_at: NOW()
       ↓
┌─────────────┐
│   Report    │
│    Card     │
└─────────────┘
```

---

## 🎯 KEY INSIGHTS

### 1. **Mental Model**
```
NOT: Scheduling time
YES: Composing daily experiences
```

### 2. **Data Structure**
```
Day
 └── Block 1 (Lesson)
 └── Block 2 (Exercise) ← Can have exerciseConfig
 └── Block 3 (Journal)
 └── Block 4 (Conclude)
```

### 3. **Progressive Data**
```
i04 → i04+ → i04++
 │     │      │
 └─────┴──────┴─→ SAME base_data_id: 'i04'
```

### 4. **Completion Rules**
```
Required blocks must be completed in order
Optional blocks can be skipped
Day completes when all required blocks done
Next day auto-unlocks
```

### 5. **CBT-Safe Metrics**
```
✅ Consistency, Habit Adherence, Engagement
❌ Streaks, Mood Trends, Perfection Scores
```

---

**THE COMPLETE SYSTEM IS NOW READY TO BUILD! 🚀**
