# How to Use Multi-Field Steps & Auto-Advance

**New Features Guide for Admins**

---

## 🎯 Feature 1: Multi-Field Steps (Grouping Questions)

### What It Does
**Before:** Each question appears on its own screen  
**After:** Multiple questions can appear together on ONE screen

### Why You'd Use It
- Sleep diaries (bedtime + wake time + quality all together)
- Demographics (name + age + gender on one screen)
- Multi-part exercises (pros + cons + conclusion together)
- Reduce clicking for users

---

## 📝 How to Create Multi-Field Steps

### Step-by-Step: Assessment Example

#### 1. Go to Admin → Assessments
Navigate to: `/admin/assessments`

#### 2. Edit or Create an Assessment
Click "Edit" on existing assessment or "Create New"

#### 3. Add Your First Question
Example:
- **Question Text:** "What time did you go to bed last night?"
- **Type:** Text (or any type)
- **Required:** ✅ Yes

**NEW FIELD:** Look for **"Step Group ID"** input box

#### 4. Set the Step Group ID
In the **"Step Group ID"** field, enter: `sleep_log`

This is like giving this question a "team name"

#### 5. Add Your Second Question
Click "+ Add Question"
- **Question Text:** "What time did you wake up?"
- **Type:** Text
- **Required:** ✅ Yes

**IMPORTANT:** In **"Step Group ID"**, enter the SAME value: `sleep_log`

#### 6. Add Your Third Question (Optional)
Click "+ Add Question"
- **Question Text:** "How would you rate your sleep quality (1-10)?"
- **Type:** Scale (1-10)
- **Required:** ✅ Yes

**SAME Step Group ID:** `sleep_log`

#### 7. Save the Assessment
Click "Save Assessment"

---

### 🎬 What Users See

**WITHOUT Step Group ID:**
```
Screen 1: "What time did you go to bed?"
[Next button]

Screen 2: "What time did you wake up?"
[Next button]

Screen 3: "How would you rate your sleep quality?"
[Next button]
```

**WITH Step Group ID = "sleep_log":**
```
Screen 1: ALL THREE QUESTIONS TOGETHER:

  What time did you go to bed?
  [____________]

  What time did you wake up?
  [____________]

  How would you rate your sleep quality (1-10)?
  [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

  [Next button]
```

---

### 🔑 Important Rules

1. **Same Step Group ID = Same Screen**
   - Questions with `sleep_log` appear together
   - Questions with `demographics` appear together
   - Questions with NO Step Group ID appear alone

2. **Questions Must Be Consecutive**
   ```
   ✅ CORRECT:
   Q1: Step Group = "sleep_log"
   Q2: Step Group = "sleep_log"
   Q3: Step Group = "sleep_log"
   Q4: Step Group = "morning_routine"
   
   ❌ WRONG (won't group):
   Q1: Step Group = "sleep_log"
   Q2: Step Group = "morning_routine"  ← Breaks the group
   Q3: Step Group = "sleep_log"        ← Won't merge with Q1
   ```

3. **Validation Works Per Field**
   - Required fields still required
   - Optional fields still optional
   - User must fill ALL required fields before clicking Next

---

## 📋 Practical Examples

### Example 1: Demographics Section
```
Step Group ID: "demographics"

Q1: What is your name?
Q2: What is your age?
Q3: What is your gender?
Q4: What is your location?
```
**Result:** All 4 questions on ONE screen titled "Demographics"

---

### Example 2: Mood Check-in
```
Step Group ID: "mood_checkin"

Q1: How are you feeling today? (Single choice: Happy/Sad/Anxious/Calm)
Q2: Describe your mood in detail (Long text)
Q3: Is this different from yesterday? (Yes/No)
```
**Result:** Choice + text field + yes/no all together

---

### Example 3: Mixed (Some Grouped, Some Solo)
```
Q1: Welcome screen (No Step Group) → Solo screen
Q2: Name (Step Group: "demographics") → \
Q3: Age (Step Group: "demographics")   →  Together on one screen
Q4: Gender (Step Group: "demographics") → /
Q5: Mood rating (No Step Group) → Solo screen
Q6: Bedtime (Step Group: "sleep") → \
Q7: Wake time (Step Group: "sleep") →  Together on one screen
```

---

## 🚀 Feature 2: Auto-Advance (Instant Navigation)

### What It Does
**Before:** User clicks answer → Must click "Next" button  
**After:** User clicks answer → Automatically goes to next screen

### Why You'd Use It
- Faster assessments (less clicking)
- Better mobile experience
- Good for simple choice questions
- **Don't use for:** Questions that need explanation or reflection

---

## 📝 How to Enable Auto-Advance

### Step-by-Step: Assessment Example

#### 1. Edit Your Assessment
Go to the question you want to auto-advance

#### 2. Check the Question Type
**Auto-advance ONLY works with:**
- ✅ Single Choice (MCQ)
- ✅ True/False
- ✅ Scale (1-10 rating)
- ✅ Dropdown (single select)

**Does NOT work with:**
- ❌ Text input
- ❌ Long text
- ❌ Multiple choice (checkboxes)
- ❌ Any field that requires typing

#### 3. Find the "Auto-advance" Checkbox
Look for: **☐ Auto-advance after selection**

#### 4. Check the Box
Click: **☑️ Auto-advance after selection**

#### 5. Save
Click "Save Assessment"

---

### 🎬 What Users See

**WITHOUT Auto-Advance:**
```
How are you feeling today?

[😊 Happy]  [😢 Sad]  [😰 Anxious]  [😌 Calm]

[Next button]  ← User must click this
```

**WITH Auto-Advance:**
```
How are you feeling today?

[😊 Happy]  [😢 Sad]  [😰 Anxious]  [😌 Calm]

User clicks "Happy" → ⏱️ Wait 350ms → 🎯 Automatically goes to next screen
(No "Next" button click needed)
```

---

### 🎯 Best Practices

#### ✅ GOOD Uses for Auto-Advance
- Simple mood ratings
- Yes/No questions
- 1-10 scales
- Clear single-choice questions
- Quick check-ins

#### ❌ BAD Uses for Auto-Advance
- Questions where users might want to read more
- Questions followed by "Other - please specify"
- First question of assessment (let them get oriented)
- Questions with long option text
- Anything where users might want to double-check their answer

---

## 🔄 Combining Both Features

You can use **both features together**!

### Example: Fast Demographics Screen

```
Step Group ID: "demographics"

Q1: What is your age group?
    Type: Single Choice (18-24, 25-34, 35-44, etc.)
    ☑️ Auto-advance: YES

Q2: What is your gender?
    Type: Single Choice (Male, Female, Non-binary, Prefer not to say)
    ☑️ Auto-advance: NO  (because next question might be "Other")

Q3: What is your location?
    Type: Text
    ☐ Auto-advance: N/A (text fields don't auto-advance)
```

**Result:**
- All 3 questions on ONE screen
- User selects age → Auto-advances WITHIN the same screen to Q2
- User selects gender → Stays on screen (no auto-advance)
- User types location
- User clicks Next to go to next screen

**Wait, that doesn't make sense!** 

Actually, auto-advance on multi-field steps will advance to the NEXT SCREEN, not the next field. So better example:

### Better Example: Separate Screens with Auto-Advance

```
Q1: How are you feeling? (No Step Group)
    Type: Single Choice
    ☑️ Auto-advance: YES
    → Advances to next screen after selection

Q2: Name (Step Group: "demographics")
Q3: Age (Step Group: "demographics")
    → Both on same screen, Next button to proceed

Q4: Sleep quality? (No Step Group)
    Type: Scale 1-10
    ☑️ Auto-advance: YES
    → Advances to next screen after selection
```

---

## 🛠 Where to Find These Controls

### In Assessment Admin

1. Navigate to: `/admin/assessments`
2. Click "Edit" on any assessment
3. Scroll down to the questions list
4. For each question, you'll see:

```
┌─────────────────────────────────────────┐
│ Question 1                               │
├─────────────────────────────────────────┤
│ Question Text: ____________________     │
│ Type: [Single Choice ▼]                 │
│ Required: ☑️                             │
│                                          │
│ Step Group ID: ____________________     │  ← NEW!
│   (Leave empty for solo screen, or      │
│    enter same ID to group questions)    │
│                                          │
│ ☐ Auto-advance after selection          │  ← NEW!
│   (Only for single-choice questions)    │
│                                          │
│ Options:                                 │
│   • Option 1: ___________               │
│   • Option 2: ___________               │
└─────────────────────────────────────────┘
```

### In Equip Program Admin

1. Navigate to: `/admin/equip`
2. Click "Edit" on any program
3. Go to a specific day
4. Scroll to the activities list
5. For each activity, you'll see:

```
┌─────────────────────────────────────────┐
│ Activity 1                               │
├─────────────────────────────────────────┤
│ Title: ____________________              │
│ Type: [Exercise ▼]                       │
│                                          │
│ Step Group ID: ____________________     │  ← NEW!
│   (Group multiple activities together)  │
│                                          │
│ Exercise Type: [Single-select ▼]        │
│ ☐ Auto-advance after selection          │  ← NEW!
│                                          │
│ Exercise Config: ________________       │
└─────────────────────────────────────────┘
```

---

## 🧪 Quick Test

### Test Multi-Field Steps

1. Create a test assessment
2. Add 3 questions:
   - Q1: "First Name" (Step Group: `test_group`)
   - Q2: "Last Name" (Step Group: `test_group`)
   - Q3: "Email" (Step Group: `test_group`)
3. Save
4. Go to "Take Assessment" view
5. **✅ SUCCESS:** All 3 questions appear on one screen

---

### Test Auto-Advance

1. Create a test assessment
2. Add 1 question:
   - Text: "Pick a color"
   - Type: Single Choice
   - Options: Red, Blue, Green
   - **☑️ Check:** Auto-advance after selection
3. Save
4. Take the assessment
5. Click "Red"
6. **✅ SUCCESS:** After ~0.3 seconds, automatically goes to next screen

---

## ❓ FAQ

### Q: What happens if I use different Step Group IDs?
**A:** Each unique Step Group ID creates a separate screen.
```
Q1: Step Group "A" → Screen 1
Q2: Step Group "A" → Screen 1
Q3: Step Group "B" → Screen 2
Q4: Step Group "B" → Screen 2
```

### Q: Can I group 10 questions together?
**A:** Yes, but consider UX:
- ✅ 2-4 questions: Good
- ⚠️ 5-7 questions: OK if related
- ❌ 8+ questions: Too overwhelming, split into multiple groups

### Q: What if I enable auto-advance on a text field?
**A:** The checkbox will appear but won't work. Auto-advance only works on single-select fields (radio buttons, dropdowns, scales).

### Q: Can I change Step Group ID after users have started?
**A:** Yes, but:
- Old data is preserved (field IDs don't change)
- Users who resume will see new screen layout
- Completed assessments won't retroactively change

### Q: What's the delay for auto-advance?
**A:** 350 milliseconds (0.35 seconds). This gives visual feedback that their choice was registered before the screen changes.

### Q: Can I disable the delay?
**A:** Not via admin UI. It's hardcoded to prevent accidental clicks. If you need this, contact development team.

### Q: Does auto-advance work with multi-field steps?
**A:** Yes! If one field in a multi-field step has auto-advance enabled:
1. User selects that field
2. Wizard advances to NEXT SCREEN (not next field)
3. Other fields in the same step are ignored

**Recommendation:** Don't use auto-advance on multi-field steps (creates confusion).

---

## 🎓 Complete Example: Sleep Assessment

Let me show you a FULL assessment using both features:

```
ASSESSMENT: "Sleep Quality Check"

─────────────────────────────────────────
QUESTION 1 (Solo screen)
  Text: "Welcome! This will take 2 minutes."
  Type: Info (no input)
  Step Group ID: (empty)
  Auto-advance: N/A
  
─────────────────────────────────────────
QUESTION 2 (Solo screen with auto-advance)
  Text: "Did you sleep last night?"
  Type: Single Choice
  Options: Yes, No
  Step Group ID: (empty)
  Auto-advance: ☑️ YES
  
  User clicks → Auto-advances
  
─────────────────────────────────────────
QUESTION 3-6 (Multi-field screen)
  Step Group ID: "sleep_details"
  
  Q3: "What time did you go to bed?"
      Type: Time
      Required: Yes
      
  Q4: "What time did you wake up?"
      Type: Time
      Required: Yes
      
  Q5: "How many times did you wake during the night?"
      Type: Number
      Required: No
      
  Q6: "Did you have nightmares?"
      Type: Yes/No
      Required: No
  
  All 4 questions on ONE screen → User clicks Next
  
─────────────────────────────────────────
QUESTION 7 (Solo screen with auto-advance)
  Text: "Overall sleep quality?"
  Type: Scale (1-10)
  Step Group ID: (empty)
  Auto-advance: ☑️ YES
  
  User selects 7 → Auto-advances
  
─────────────────────────────────────────
QUESTION 8 (Solo screen)
  Text: "Any additional notes about your sleep?"
  Type: Long Text
  Step Group ID: (empty)
  Auto-advance: N/A (text fields don't auto-advance)
  Required: No
  
  User types or skips → Clicks Next
  
─────────────────────────────────────────
COMPLETION
  Show results
```

**User Experience:**
1. See welcome → Click Start
2. "Did you sleep?" → Click Yes → **AUTO** next screen
3. See 4 sleep questions together → Fill all → Click Next
4. "Sleep quality 1-10" → Click 7 → **AUTO** next screen
5. Optional notes → Type or skip → Click Next
6. Done!

**Total clicks:** 4 (instead of 8 without these features!)

---

## 🎯 Summary

### Multi-Field Steps
- **Where:** "Step Group ID" field in question/activity editor
- **How:** Give multiple questions the SAME Step Group ID
- **Result:** They appear on ONE screen together
- **Use for:** Related questions (demographics, sleep diary, multi-part exercises)

### Auto-Advance
- **Where:** "☑️ Auto-advance after selection" checkbox
- **How:** Check the box on single-choice questions
- **Result:** User's selection automatically advances to next screen
- **Use for:** Simple ratings, quick check-ins, fast assessments
- **Don't use for:** Text fields, multi-choice, reflection questions

### Both Together
- Group related questions with Step Group ID
- Add auto-advance to the LAST question in the group (if appropriate)
- Or use auto-advance on solo screens between multi-field screens

---

**Need Help?**
1. Try the Quick Test above
2. Create a "Test" assessment to experiment
3. Check `/WIZARD_MANUAL_TEST_GUIDE.md` for detailed testing
4. Review `/WIZARD_QUICK_REFERENCE.md` for technical details

**Ready to try it?** Go create your first multi-field step! 🚀
