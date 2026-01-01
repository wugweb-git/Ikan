# Unified Wizard Engine - Manual Test Guide

**Purpose:** Step-by-step manual tests you can run RIGHT NOW to verify everything works

---

## 🧪 Test 1: Multi-Field Sleep Diary

### Setup (via Admin)

1. Go to **Admin → Equip Programs**
2. Create new program: "Sleep Tight Test"
3. Add Day 1 with this activity:

**Activity 1: Sleep Log**
- **Type:** Exercise
- **Title:** "Tonight's Sleep Diary"
- **Step Group ID:** `sleep_log_combined`
- **Exercise Type:** Custom

Add these as SEPARATE activities with SAME Step Group ID:

**Activity 2: Bedtime**
- **Type:** Exercise
- **Step Group ID:** `sleep_log_combined`
- **Config:** `{ "subtype": "time", "label": "What time did you go to bed?" }`

**Activity 3: Wake Time**
- **Type:** Exercise  
- **Step Group ID:** `sleep_log_combined`
- **Config:** `{ "subtype": "time", "label": "What time did you wake up?" }`

**Activity 4: Quality Rating**
- **Type:** Exercise
- **Step Group ID:** `sleep_log_combined`
- **Config:** `{ "subtype": "single-select", "label": "Sleep quality (1-5)", "options": ["1", "2", "3", "4", "5"] }`

**Activity 5: Nightmares**
- **Type:** Exercise
- **Step Group ID:** `sleep_log_combined`
- **Config:** `{ "subtype": "boolean", "label": "Did you have nightmares?" }`

### Test Steps

1. ✅ Enroll in the program
2. ✅ Start Day 1
3. ✅ **VERIFY:** All 4 fields appear on ONE screen
4. ✅ Fill only bedtime, click Next
5. ✅ **VERIFY:** Error or blocked (required fields missing)
6. ✅ Fill bedtime: 22:30
7. ✅ Fill wake time: 06:45
8. ✅ Select quality: 4
9. ✅ Leave nightmares unchecked
10. ✅ Click Next
11. ✅ **VERIFY:** Proceeds successfully
12. ✅ Click Back
13. ✅ **VERIFY:** All 4 fields still have values
14. ✅ Open browser DevTools Console
15. ✅ Type: `localStorage.getItem('equip_progress')`
16. ✅ **VERIFY:** JSON contains:
    ```json
    {
      "bedtime": "22:30",
      "wake_time": "06:45", 
      "sleep_quality": "4",
      "nightmares": false
    }
    ```

---

## 🧪 Test 2: Auto-Advance Assessment

### Setup (via Admin)

1. Go to **Admin → Assessments**
2. Create new: "Auto-Advance Test"
3. Add these questions:

**Question 1:**
- **Text:** "How are you feeling today?"
- **Type:** Single Choice (MCQ)
- **Options:** Anxious, Calm, Excited, Sad
- **✅ Check:** Auto-advance after selection
- **Step Group ID:** (leave empty)

**Question 2:**
- **Text:** "Describe your mood in detail"
- **Type:** Text (long)
- **Required:** Yes
- **Auto-advance:** No

**Question 3:**
- **Text:** "Rate your energy level"
- **Type:** Scale (1-10)
- **✅ Check:** Auto-advance after selection

### Test Steps

1. ✅ Take the assessment
2. ✅ **VERIFY:** See intro screen
3. ✅ Click "Start Assessment"
4. ✅ **VERIFY:** See Question 1 with 4 option cards
5. ✅ Click "Calm"
6. ✅ **WAIT 350ms**
7. ✅ **VERIFY:** Automatically advances to Question 2 (no Next button click needed)
8. ✅ Type: "Feeling peaceful and content"
9. ✅ Click Next (manual, no auto-advance on long_text)
10. ✅ **VERIFY:** See Question 3 with scale 1-10
11. ✅ Click "7"
12. ✅ **WAIT 350ms**
13. ✅ **VERIFY:** Automatically advances to completion

---

## 🧪 Test 3: Conditional "Other" Option

### Setup (via Admin)

1. Go to **Admin → Assessments**
2. Create: "Conditional Test"
3. Add questions:

**Question 1:**
- **Text:** "What helps you relax?"
- **Type:** Single Choice
- **Options:** Music, Exercise, Meditation, Other
- **Step Group ID:** `relax_with_other`

**Question 2:**
- **Text:** "Please specify what helps you relax"
- **Type:** Text (long)
- **Required:** Yes
- **Step Group ID:** `relax_with_other`
- **Depends On:** Question 1 = "Other"

### Test Steps

1. ✅ Take assessment
2. ✅ **VERIFY:** See both questions on one screen
3. ✅ **VERIFY:** "Please specify" field is HIDDEN
4. ✅ Select "Music"
5. ✅ **VERIFY:** "Please specify" still hidden
6. ✅ Try clicking Next
7. ✅ **VERIFY:** Proceeds (long text not required when hidden)
8. ✅ Click Back
9. ✅ Select "Other"
10. ✅ **VERIFY:** "Please specify" field APPEARS
11. ✅ Try clicking Next
12. ✅ **VERIFY:** Blocked (field now required and empty)
13. ✅ Type: "Reading fiction books"
14. ✅ Click Next
15. ✅ **VERIFY:** Proceeds successfully

---

## 🧪 Test 4: Gratitude List (text_list)

### Setup (via Admin)

1. Go to **Admin → Equip Programs**
2. Edit "Sleep Tight Test" → Day 1
3. Add activity:

**Gratitude Journal**
- **Type:** Exercise
- **Exercise Config:**
  ```json
  {
    "subtype": "text_list",
    "label": "List 3 things you're grateful for today",
    "maxItems": 3,
    "required": true
  }
  ```

### Test Steps

1. ✅ Start Day 1 session
2. ✅ Navigate to Gratitude Journal step
3. ✅ **VERIFY:** See "Add Item" button
4. ✅ Click "Add Item" → Input appears
5. ✅ Type: "My family"
6. ✅ Click "Add Item" again
7. ✅ Type: "Good health"
8. ✅ Click "Add Item" again
9. ✅ Type: "Sunshine"
10. ✅ **VERIFY:** "Add Item" button DISAPPEARS (at max 3)
11. ✅ Click trash icon on item 2
12. ✅ **VERIFY:** "Good health" removed
13. ✅ **VERIFY:** "Add Item" button REAPPEARS
14. ✅ Click Next
15. ✅ **VERIFY:** Data saved as array:
    ```json
    {
      "gratitude_journal": ["My family", "Sunshine"]
    }
    ```

---

## 🧪 Test 5: Pros/Cons Table (row_list)

### Setup (via Admin)

1. Create Equip activity:

**Decision Making**
- **Type:** Exercise
- **Exercise Config:**
  ```json
  {
    "subtype": "row_list",
    "label": "Evaluate your decision",
    "maxItems": 5,
    "rowSchema": [
      {
        "id": "perspective",
        "type": "text",
        "label": "Perspective",
        "options": ["Pro", "Con", "Neutral"]
      },
      {
        "id": "thought",
        "type": "long_text",
        "label": "Explain",
        "required": true
      }
    ]
  }
  ```

### Test Steps

1. ✅ Start session
2. ✅ Navigate to Decision Making
3. ✅ Click "Add Entry"
4. ✅ **VERIFY:** Card appears with 2 fields (Perspective dropdown, Explain textarea)
5. ✅ Select "Pro"
6. ✅ Type: "It will advance my career"
7. ✅ Click "Add Entry" again
8. ✅ Select "Con"
9. ✅ Type: "It requires relocation"
10. ✅ Click trash icon on first entry
11. ✅ **VERIFY:** Pro entry removed, Con entry remains
12. ✅ Click Next
13. ✅ **VERIFY:** Data saved:
    ```json
    {
      "decision_making": [
        {
          "perspective": "Con",
          "thought": "It requires relocation"
        }
      ]
    }
    ```

---

## 🧪 Test 6: Habit Tracker (matrix)

### Setup (via Admin)

1. Create Equip activity:

**Weekly Habits**
- **Type:** Exercise
- **Exercise Config:**
  ```json
  {
    "subtype": "matrix",
    "label": "Track your habits this week",
    "rows": [
      { "id": "exercise", "label": "Exercise 30min", "value": "exercise" },
      { "id": "meditate", "label": "Meditate 10min", "value": "meditate" },
      { "id": "journal", "label": "Evening journal", "value": "journal" }
    ],
    "columns": [
      { "id": "mon", "label": "M", "value": "monday" },
      { "id": "tue", "label": "T", "value": "tuesday" },
      { "id": "wed", "label": "W", "value": "wednesday" },
      { "id": "thu", "label": "R", "value": "thursday" },
      { "id": "fri", "label": "F", "value": "friday" }
    ]
  }
  ```

### Test Steps

1. ✅ Navigate to Weekly Habits step
2. ✅ **VERIFY:** See 3×5 table (3 rows, 5 columns)
3. ✅ Click radio button: Exercise × Monday
4. ✅ Click radio button: Exercise × Wednesday
5. ✅ **VERIFY:** Monday selection CLEARS (only one per row)
6. ✅ Click: Meditate × Tuesday
7. ✅ Click: Journal × Friday
8. ✅ Click Next
9. ✅ **VERIFY:** ENTIRE matrix saved in ONE field:
    ```json
    {
      "weekly_habits": {
        "exercise": "wednesday",
        "meditate": "tuesday",
        "journal": "friday"
      }
    }
    ```
10. ✅ **VERIFY:** NOT saved as separate cells

---

## 🧪 Test 7: Variable Substitution (Reflections)

### Setup (via Admin)

1. Create assessment with 3 questions:

**Question 1:**
- **ID:** `user_name`
- **Text:** "What is your name?"
- **Type:** Text

**Question 2:**
- **ID:** `primary_goal`
- **Text:** "What is your main goal?"
- **Type:** Long text

**Question 3:**
- **Text:** "Let's review, {{user_name}}"
- **Description:** "You said your goal is: {{primary_goal}}. How committed are you?"
- **Type:** Scale (1-10)

### Test Steps

1. ✅ Start assessment
2. ✅ Step 1: Enter "Sarah"
3. ✅ Step 2: Enter "Reduce my anxiety and sleep better"
4. ✅ Navigate to Step 3
5. ✅ **VERIFY:** Title shows: "Let's review, Sarah"
6. ✅ **VERIFY:** Description shows: "You said your goal is: Reduce my anxiety and sleep better. How committed are you?"
7. ✅ **VERIFY:** Substitution works, no `{{}}` visible

---

## 🧪 Test 8: Skip & Resume

### Setup

Use any existing assessment/equip with 5+ steps

### Test Steps

1. ✅ Start flow
2. ✅ Complete Steps 1-2
3. ✅ On Step 3, leave fields empty
4. ✅ Click "X" (Exit) button
5. ✅ **VERIFY:** Redirected to home/listing
6. ✅ Return to the same assessment/equip
7. ✅ **VERIFY:** Resume modal or auto-resume
8. ✅ Click "Resume"
9. ✅ **VERIFY:** Start at Step 3
10. ✅ **VERIFY:** Steps 1-2 answers still present
11. ✅ Click Back to Step 2
12. ✅ **VERIFY:** Previous answers visible
13. ✅ Click Back to Step 1
14. ✅ **VERIFY:** Previous answers visible
15. ✅ Navigate forward to Step 3
16. ✅ Complete Step 3
17. ✅ Complete remaining steps
18. ✅ **VERIFY:** All data submitted correctly

---

## 🧪 Test 9: Validation Error Feedback

### Setup

Create assessment with required field

### Test Steps

1. ✅ Start assessment
2. ✅ Navigate to step with required field
3. ✅ Leave field empty
4. ✅ Click Next
5. ✅ **VERIFY:** Button doesn't proceed (blocked)
6. ✅ Open browser console
7. ✅ **VERIFY:** See warning: "Missing required fields: [field_id]"
8. ✅ Fill the field
9. ✅ Click Next
10. ✅ **VERIFY:** Proceeds successfully

**⚠️ Known Issue:** Error message only in console, not shown in UI. Add error state display if needed.

---

## 🧪 Test 10: Design System Consistency

### Test Steps (Visual QA)

1. ✅ Run any wizard flow
2. ✅ **VERIFY Typography:**
   - No hardcoded `text-lg`, `text-2xl`, `font-bold` classes
   - Headings use natural sizing
   - Body text readable

3. ✅ **VERIFY Colors:**
   - Background: Light gray (#F5F5F5)
   - Cards: White (#FFFFFF)
   - Primary button: Dark gray (#2A2A2A)
   - Text: Near black (#151515), Muted gray (#717182)

4. ✅ **VERIFY Spacing:**
   - Consistent gaps between elements
   - Card padding: 16px
   - Section spacing: 24px

5. ✅ **VERIFY Borders:**
   - Input borders: Subtle gray
   - Border radius: 12px (buttons/inputs), 16px (cards)
   - No sharp corners

6. ✅ **VERIFY Touch Targets:**
   - All buttons minimum 44px height
   - Easy to tap on mobile
   - Option cards large enough

7. ✅ **VERIFY Motion:**
   - Smooth transitions between steps
   - Progress bar animates
   - No jarring jumps

---

## 📋 Test Results Template

Copy this for each test run:

```
Test Run Date: _______
Tester: _______
Device: _______ (Desktop/Mobile)
Browser: _______

| Test | Status | Notes |
|------|--------|-------|
| 1. Multi-Field Sleep Diary | ☐ Pass ☐ Fail | |
| 2. Auto-Advance Assessment | ☐ Pass ☐ Fail | |
| 3. Conditional "Other" | ☐ Pass ☐ Fail | |
| 4. Gratitude List | ☐ Pass ☐ Fail | |
| 5. Pros/Cons Table | ☐ Pass ☐ Fail | |
| 6. Habit Tracker | ☐ Pass ☐ Fail | |
| 7. Variable Substitution | ☐ Pass ☐ Fail | |
| 8. Skip & Resume | ☐ Pass ☐ Fail | |
| 9. Validation Errors | ☐ Pass ☐ Fail | |
| 10. Design Consistency | ☐ Pass ☐ Fail | |

Issues Found:
_______________________________
_______________________________
_______________________________
```

---

## 🎯 Success Criteria

**ALL 10 tests must PASS before production migration.**

If any test fails:
1. Document exact reproduction steps
2. Check browser console for errors
3. Inspect saved data structure
4. Report to development team
5. Do NOT proceed with content migration

**Ready to test? Start with Test 1!** 🚀
