# Visual Guide: Where to Find the New Controls

**Quick visual reference for admins**

---

## 📍 Assessment Admin Interface

### Location: `/admin/assessments` → Edit Assessment

When editing any assessment, scroll to the questions section. For each question, you'll see:

```
┌────────────────────────────────────────────────────────────────┐
│  Question 2                                          [▼] [×]    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Question Text                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ How are you feeling today?                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Type        Required                                           │
│  [Single Choice ▼]  ☑️ Yes                                      │
│                                                                 │
│  ┌─────────────────────────────┬──────────────────────────┐   │
│  │ Step Group ID (optional)    │ Auto-advance             │   │
│  ├─────────────────────────────┼──────────────────────────┤   │
│  │ ┌─────────────────────────┐ │ ☐ Advance automatically  │   │
│  │ │ demographics            │ │    after selection       │   │
│  │ └─────────────────────────┘ │                          │   │
│  │                             │                          │   │
│  │ Questions with the same ID  │                          │   │
│  │ appear together in one step │                          │   │
│  └─────────────────────────────┴──────────────────────────┘   │
│                                                                 │
│  Answer Options                                                 │
│  ○ Happy      [×]                                               │
│  ○ Sad        [×]                                               │
│  ○ Anxious    [×]                                               │
│  [+ Add Option]                                                 │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**What to look for:**
1. **Left box (Step Group ID):**
   - Text input field
   - Placeholder: "e.g., demographics"
   - Gray helper text below
   
2. **Right box (Auto-advance):**
   - Checkbox
   - Label: "Advance automatically after selection"
   - Only effective on single-choice questions

---

## 📍 Equip Program Admin Interface

### Location: `/admin/equip` → Edit Program → Select Day → Edit Activity

When editing activities/lessons within a day:

```
┌────────────────────────────────────────────────────────────────┐
│  Activity 3: Sleep Diary                             [▼] [×]    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Title                                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Tonight's Sleep Log                                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Type: [Exercise ▼]                                             │
│                                                                 │
│  ┌─────────────────────────────┬──────────────────────────┐   │
│  │ Step Group ID (optional)    │ Auto-advance             │   │
│  ├─────────────────────────────┼──────────────────────────┤   │
│  │ ┌─────────────────────────┐ │ ☐ Advance automatically  │   │
│  │ │ sleep_log               │ │                          │   │
│  │ └─────────────────────────┘ │                          │   │
│  │                             │                          │   │
│  │ Group lessons together      │                          │   │
│  │ in one step                 │                          │   │
│  └─────────────────────────────┴──────────────────────────┘   │
│                                                                 │
│  Duration (min)  [ 10  ]                                        │
│                                                                 │
│  Exercise Config                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ { "subtype": "time", "label": "Bedtime?" }              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**What to look for:**
1. **Same two-column layout** as assessments
2. **Left: Step Group ID** text input
3. **Right: Auto-advance** checkbox
4. Slightly smaller text (to fit more info)

---

## 🎨 Visual Examples

### Example 1: Creating a Multi-Field Sleep Diary

**Step 1:** Edit Activity 1
```
Title: "Bedtime"
Type: Exercise
Step Group ID: ┌──────────────┐
               │ sleep_log    │  ← Type this
               └──────────────┘
```

**Step 2:** Edit Activity 2
```
Title: "Wake Time"
Type: Exercise
Step Group ID: ┌──────────────┐
               │ sleep_log    │  ← Same as above
               └──────────────┘
```

**Step 3:** Edit Activity 3
```
Title: "Sleep Quality"
Type: Exercise
Step Group ID: ┌──────────────┐
               │ sleep_log    │  ← Same as above
               └──────────────┘
```

**Result for Users:**
```
┌────────────────────────────────────┐
│  Tonight's Sleep Log               │
│                                    │
│  Bedtime                           │
│  [ 22:30 ]                         │
│                                    │
│  Wake Time                         │
│  [ 06:45 ]                         │
│                                    │
│  Sleep Quality (1-10)              │
│  ①②③④⑤⑥⑦⑧⑨⑩                     │
│                                    │
│         [Next]                     │
└────────────────────────────────────┘
```

---

### Example 2: Enabling Auto-Advance on a Mood Question

**Edit Question:**
```
Question Text: "How are you feeling?"
Type: Single Choice
Options: Happy, Sad, Anxious, Calm

Auto-advance: ☑️ Advance automatically after selection  ← Check this!
```

**Result for Users:**
```
Before:
┌────────────────────────────────────┐
│  How are you feeling?              │
│                                    │
│  [😊 Happy]  [😢 Sad]              │
│  [😰 Anxious] [😌 Calm]            │
│                                    │
│         [Next]  ← Must click       │
└────────────────────────────────────┘

After (with auto-advance):
┌────────────────────────────────────┐
│  How are you feeling?              │
│                                    │
│  [😊 Happy]  [😢 Sad]              │
│  [😰 Anxious] [😌 Calm]            │
│                                    │
│  (No Next button needed)           │
│  Click answer → Auto-advance! ⚡    │
└────────────────────────────────────┘
```

---

## 🔍 How to Test It

### Quick Test 1: Multi-Field
1. Create new test assessment
2. Add Question 1: "Name" (Step Group: `test`)
3. Add Question 2: "Age" (Step Group: `test`)
4. Save
5. **Test:** Take assessment → Both questions on one screen ✅

### Quick Test 2: Auto-Advance
1. Create new test assessment
2. Add Question 1: "Pick color" (Type: Single Choice, ☑️ Auto-advance)
3. Add options: Red, Blue, Green
4. Save
5. **Test:** Take assessment → Click "Red" → Auto-advances ✅

---

## ❓ Troubleshooting

### "I don't see the Step Group ID field"
**Check:**
- Are you using the **detailed editor** (not the simple one)?
- Scroll down past the question text and type fields
- Look for a **two-column grid** layout

### "Auto-advance checkbox is there but does nothing"
**Check:**
- Question type must be **Single Choice** (not Multiple Choice)
- Not Text or Long Text (those can't auto-advance)
- Try taking the assessment as a user (not just previewing)

### "Questions won't group together"
**Check:**
- Step Group ID is **exactly the same** (case-sensitive)
  - ✅ `sleep_log` and `sleep_log` → Groups
  - ❌ `sleep_log` and `Sleep_Log` → Won't group
- Questions are **consecutive** (no other questions in between)
- You saved after making changes

### "Auto-advance is too fast/slow"
**Note:** The delay is hardcoded to 350ms (0.35 seconds). This can't be changed via admin interface. If you need adjustment, contact development team.

---

## 📸 Where Exactly Are These Fields?

### In the Code
If you want to verify the controls exist:

**Assessment Admin:**
- File: `/components/admin/AssessmentDetailedEditor.tsx`
- Lines: 383-410

**Equip Admin:**
- File: `/components/admin/EquipProgramDetailedEditor.tsx`
- Lines: 472-500

### Visual Position
**In the question/activity edit panel:**
1. Title (at top)
2. Type selector
3. **→ STEP GROUP ID + AUTO-ADVANCE (HERE)** ← 
4. Options/Config (below)
5. Delete button (bottom)

---

## 🎯 Quick Reference

| Feature | Control Type | Location | Works With |
|---------|-------------|----------|------------|
| **Multi-Field** | Text input | Step Group ID field | All question types |
| **Auto-Advance** | Checkbox | Below Step Group ID | Single-choice only |

**Color coding:**
- Step Group ID label: Regular text
- Auto-advance label: Regular text
- Helper text: Gray/muted color

**Field states:**
- Empty Step Group ID = Question appears alone
- Filled Step Group ID = Groups with matching IDs
- Unchecked Auto-advance = Normal navigation
- Checked Auto-advance = Instant navigation after selection

---

**Still can't find it?** 
1. Make sure you're on the **Edit** page (not the list page)
2. Expand a question (click the ▼ arrow if collapsed)
3. Scroll down past the main question text
4. Look for the **two-column grid** with gray borders

**The controls are there!** 🎉
