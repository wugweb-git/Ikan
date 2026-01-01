# Quick Start: Use the New Features in 5 Minutes

**Choose your path:**

---

## 🎯 Path 1: I Want Multiple Questions on One Screen

### Example: Name + Age + Gender on one screen

**Steps:**

1. **Go to:** `/admin/assessments`
2. **Click:** "Edit" on any assessment (or create new)
3. **Find Question 1** (or add new question)
   - Question Text: "What is your name?"
   - Type: Text
4. **Look for this box:**
   ```
   Step Group ID (optional)
   ┌─────────────────────┐
   │ demographics        │  ← Type "demographics"
   └─────────────────────┘
   ```
5. **Add Question 2:**
   - Question Text: "What is your age?"
   - Type: Number
   - **Step Group ID:** Type "demographics" (SAME as Q1)
6. **Add Question 3:**
   - Question Text: "What is your gender?"
   - Type: Single Choice (Male, Female, Other)
   - **Step Group ID:** Type "demographics" (SAME as Q1)
7. **Click:** "Save Assessment"
8. **Test:** Take the assessment

**✅ Success:** All 3 questions appear on ONE screen together!

---

## ⚡ Path 2: I Want Questions to Auto-Advance

### Example: Mood rating that skips to next screen after clicking

**Steps:**

1. **Go to:** `/admin/assessments`
2. **Click:** "Edit" on any assessment
3. **Find a Single Choice question** (or add new)
   - Question Text: "How are you feeling?"
   - Type: **Single Choice** (important!)
   - Options: Happy, Sad, Anxious, Calm
4. **Look for this checkbox:**
   ```
   ☐ Advance automatically after selection
   ```
5. **Check the box:** ☑️
6. **Click:** "Save Assessment"
7. **Test:** Take the assessment → Click an option

**✅ Success:** After clicking, it auto-advances to next screen (no Next button needed)!

---

## 🚀 Path 3: I Want BOTH Features

### Example: Demographics on one screen + Auto-advance on mood questions

**Steps:**

1. **Create questions with SAME Step Group ID:**
   - Q1: "Name" → Step Group: `demographics`
   - Q2: "Age" → Step Group: `demographics`
   - Q3: "Gender" → Step Group: `demographics`
   
2. **Add a separate auto-advance question:**
   - Q4: "Mood today?"
   - Type: Single Choice
   - **NO Step Group ID** (leave empty)
   - ☑️ Check "Auto-advance"

3. **Save and test**

**✅ Result:**
- Screen 1: Name + Age + Gender together (click Next)
- Screen 2: Mood (click answer → auto-advances)

---

## 🔑 Key Rules

### Multi-Field Steps (Step Group ID)
- **Same ID = Same screen**
- **Leave empty = Solo screen**
- **Must be consecutive questions**
- Works with ANY question type

### Auto-Advance
- **ONLY works with Single Choice** questions
- **Does NOT work** with text, long text, or multiple choice
- **350ms delay** (gives user visual feedback)
- Good for ratings, bad for "Other - please specify"

---

## 🧪 Test in 60 Seconds

Copy this into a test assessment:

```
Question 1:
  Text: "Your name?"
  Type: Text
  Step Group ID: demo

Question 2:
  Text: "Your age?"
  Type: Number
  Step Group ID: demo

Question 3:
  Text: "Pick a color"
  Type: Single Choice (Red, Blue, Green)
  Auto-advance: ☑️ YES
```

**Take the test:**
1. Q1 + Q2 appear together → Fill both → Click Next
2. Q3 appears → Click "Red" → Auto-advances ✅

---

## 📍 Where to Find the Controls

**When editing a question, scroll down to see:**

```
┌─────────────────────────────────────────┐
│ Question Text: ___________________      │
│ Type: [Single Choice ▼]                 │
│                                          │
│ ╔════════════════╦═══════════════════╗  │ ← LOOK HERE
│ ║ Step Group ID  ║ Auto-advance      ║  │
│ ║ ______________ ║ ☐ Auto-advance   ║  │
│ ╚════════════════╩═══════════════════╝  │
│                                          │
│ Options: ...                             │
└─────────────────────────────────────────┘
```

**Can't find it?**
- Make sure you're **editing** a question (not just viewing)
- Click the **▼** arrow to expand the question
- Scroll down past the question text field

---

## ❓ Common Questions

**Q: How many questions can I group?**  
A: Technically unlimited, but 2-4 is best for user experience.

**Q: What happens if I use different Step Group IDs?**  
A: Each unique ID creates a different screen.
- `demographics` → Screen 1
- `sleep_log` → Screen 2
- (empty) → Solo screens

**Q: Can I group questions that aren't next to each other?**  
A: No. Questions must be consecutive (right after each other).

**Q: Does auto-advance work on text fields?**  
A: No. Only Single Choice (radio buttons, dropdowns, scales).

**Q: How do I turn off auto-advance?**  
A: Uncheck the box and save.

**Q: Can I use auto-advance on multi-field steps?**  
A: Yes, but it's confusing. When user selects the auto-advance field, it skips the entire step. Not recommended.

---

## ✅ You're Done!

That's it! Go try it now:

1. **Test multi-field:** Add 2 questions with same Step Group ID
2. **Test auto-advance:** Add single-choice question, check the box
3. **Take the assessment** and see the magic happen 🎉

**Need more details?**
- Full guide: `/HOW_TO_USE_NEW_FEATURES.md`
- Visual guide: `/VISUAL_GUIDE.md`
- Developer docs: `/WIZARD_QUICK_REFERENCE.md`
