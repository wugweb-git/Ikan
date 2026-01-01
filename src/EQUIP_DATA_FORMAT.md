# Equip Program Data Format Guide

## 📋 Required Structure for Equip Program Data in Database

When creating Equip programs via the Admin Wizard or directly in the database, the program object MUST follow this structure:

### ✅ Complete Equip Program Object Structure

```json
{
  "id": "sleep-tight-program",
  "equip_id": "sleep-tight-program",
  "slug": "sleep-tight-program",
  "title": "Sleep Tight: 9 Nights to Better Sleep",
  "subtitle": "Transform your sleep patterns in just 9 days",
  "description": "A comprehensive CBT-I based program to help you overcome insomnia and develop healthy sleep habits.",
  "published": true,
  "category": "sleep",
  "duration_weeks": 2,
  "estimated_minutes_per_day": 15,
  "difficulty": "beginner",
  "metadata": {
    "badge_icon": "moon",
    "color_theme": "purple",
    "success_rate": 87
  },
  "onboarding": {
    "id": "sleep-tight-onboarding",
    "title": "Program Setup",
    "description": "Let's personalize your sleep program",
    "is_required_before_start": true,
    "version": "1.0.0",
    "sections": [],
    "questions": [
      {
        "id": "q-sleep-goal",
        "question_text": "What's your primary sleep goal?",
        "input_type": "single_select",
        "options": [
          { "id": "opt1", "label": "Fall asleep faster", "value": "fall_asleep" },
          { "id": "opt2", "label": "Stay asleep through the night", "value": "stay_asleep" },
          { "id": "opt3", "label": "Wake up feeling refreshed", "value": "wake_refreshed" }
        ],
        "order": 1,
        "required": true,
        "section_id": "goals"
      },
      {
        "id": "q-sleep-hours",
        "question_text": "How many hours do you typically sleep per night?",
        "input_type": "number",
        "order": 2,
        "required": true,
        "section_id": "baseline"
      },
      {
        "id": "q-sleep-time",
        "question_text": "What time do you usually go to bed?",
        "input_type": "time",
        "order": 3,
        "required": true,
        "section_id": "baseline"
      },
      {
        "id": "q-sleep-concerns",
        "question_text": "What sleep concerns do you have? (Select all that apply)",
        "input_type": "multi_select",
        "options": [
          { "id": "con1", "label": "Racing thoughts", "value": "racing_thoughts" },
          { "id": "con2", "label": "Physical discomfort", "value": "discomfort" },
          { "id": "con3", "label": "Environmental factors", "value": "environment" },
          { "id": "con4", "label": "Anxiety about sleep", "value": "anxiety" }
        ],
        "order": 4,
        "required": false,
        "section_id": "concerns"
      },
      {
        "id": "q-additional-info",
        "question_text": "Is there anything else you'd like us to know?",
        "input_type": "textarea",
        "placeholder": "Share any additional information...",
        "order": 5,
        "required": false,
        "section_id": "additional"
      }
    ]
  },
  "pricing": {
    "amount": 499,
    "currency": "INR",
    "description": "One-time payment • Lifetime access"
  },
  "created_at": "2025-01-01T12:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z"
}
```

---

## 🔑 Critical Field Explanations

### **Top-Level Program Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ Yes | Unique identifier | `"sleep-tight-program"` |
| `equip_id` | string | ✅ Yes | Same as id (for compatibility) | `"sleep-tight-program"` |
| `slug` | string | ✅ Yes | URL-friendly identifier | `"sleep-tight-program"` |
| `title` | string | ✅ Yes | Program display name | `"Sleep Tight: 9 Nights"` |
| `subtitle` | string | No | Brief tagline | `"Better sleep in 9 days"` |
| `description` | string | ✅ Yes | Full program description | `"A comprehensive..."` |
| `published` | boolean | ✅ Yes | Whether visible to users | `true` |
| `category` | string | No | Program category | `"sleep"`, `"anxiety"` |
| `duration_weeks` | number | No | Program duration | `2` |
| `estimated_minutes_per_day` | number | No | Daily time commitment | `15` |
| `onboarding` | object | ✅ **CRITICAL** | Onboarding questions config | See below |

### **Onboarding Object Structure**

The `onboarding` object is **CRITICAL** and must be properly structured:

```json
{
  "onboarding": {
    "id": "program-id-onboarding",
    "title": "Program Setup",
    "description": "Let's get started!",
    "is_required_before_start": true,
    "version": "1.0.0",
    "sections": [],
    "questions": [ /* Array of question objects */ ]
  }
}
```

### **Onboarding Question Object Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ Yes | Unique question identifier | `"q-sleep-goal"` |
| `question_text` | string | ✅ Yes | The question displayed to user | `"What's your goal?"` |
| `input_type` | string | ✅ Yes | Question type (see types below) | `"single_select"`, `"text"` |
| `options` | array | For select types | Array of option objects | See options format below |
| `order` | number | ✅ Yes | Display order (1-based) | `1`, `2`, `3` |
| `required` | boolean | No (default: false) | Whether answer is required | `true` |
| `section_id` | string | No | Grouping identifier | `"goals"`, `"baseline"` |
| `placeholder` | string | For text types | Placeholder text | `"Type your answer..."` |
| `helper_text` | string | No | Additional help text | `"This helps us..."` |
| `conditional_logic` | object | No | Show/hide based on other answers | See conditional logic below |

---

## 📝 Onboarding Question Types

### 1. **Single Select** (`input_type: "single_select"`)
Radio buttons or dropdown - one choice only.

```json
{
  "id": "q-goal",
  "question_text": "What's your primary goal?",
  "input_type": "single_select",
  "options": [
    { "id": "opt1", "label": "Better Sleep", "value": "sleep" },
    { "id": "opt2", "label": "Less Anxiety", "value": "anxiety" },
    { "id": "opt3", "label": "More Energy", "value": "energy" }
  ],
  "order": 1,
  "required": true
}
```

### 2. **Multiple Select** (`input_type: "multi_select"`)
Checkboxes - multiple choices allowed.

```json
{
  "id": "q-concerns",
  "question_text": "What concerns you? (Select all that apply)",
  "input_type": "multi_select",
  "options": [
    { "id": "c1", "label": "Racing thoughts", "value": "racing_thoughts" },
    { "id": "c2", "label": "Physical discomfort", "value": "discomfort" },
    { "id": "c3", "label": "Anxiety", "value": "anxiety" }
  ],
  "order": 2,
  "required": false
}
```

### 3. **Text** (`input_type: "text"`)
Short text input (single line).

```json
{
  "id": "q-name",
  "question_text": "What should we call you?",
  "input_type": "text",
  "placeholder": "Enter your preferred name",
  "order": 1,
  "required": true
}
```

### 4. **Textarea** (`input_type: "textarea"`)
Long text input (multiple lines).

```json
{
  "id": "q-additional",
  "question_text": "Any additional information?",
  "input_type": "textarea",
  "placeholder": "Share anything else we should know...",
  "order": 5,
  "required": false
}
```

### 5. **Number** (`input_type: "number"`)
Numeric input.

```json
{
  "id": "q-hours",
  "question_text": "How many hours do you sleep per night?",
  "input_type": "number",
  "order": 2,
  "required": true
}
```

### 6. **Time** (`input_type: "time"`)
Time picker (HH:MM format).

```json
{
  "id": "q-bedtime",
  "question_text": "What time do you usually go to bed?",
  "input_type": "time",
  "order": 3,
  "required": true
}
```

### 7. **Date** (`input_type: "date"`)
Date picker.

```json
{
  "id": "q-start-date",
  "question_text": "When would you like to start?",
  "input_type": "date",
  "order": 1,
  "required": true
}
```

---

## 🔀 Conditional Logic

Show/hide questions based on previous answers:

```json
{
  "id": "q-medication-details",
  "question_text": "Which medication are you taking?",
  "input_type": "text",
  "order": 4,
  "required": true,
  "conditional_logic": {
    "trigger_question_id": "q-taking-medication",
    "condition": "equals",
    "value": "yes"
  }
}
```

**Supported Conditions:**
- `"equals"` - Show if answer equals value
- `"not_equals"` - Show if answer doesn't equal value
- `"contains"` - Show if answer array contains value
- `"greater_than"` - Show if answer > value
- `"less_than"` - Show if answer < value

---

## ❌ Common Mistakes to Avoid

### 1. **Missing `onboarding` Object**
```json
// ❌ WRONG - No onboarding!
{
  "id": "my-program",
  "title": "My Program",
  "description": "A program",
  "published": true
  // Missing onboarding object!
}

// ✅ CORRECT
{
  "id": "my-program",
  "title": "My Program",
  "onboarding": {
    "id": "my-program-onboarding",
    "questions": [ /* ... */ ]
  }
}
```

### 2. **Empty Questions Array**
```json
// ❌ WRONG
{
  "onboarding": {
    "id": "onboarding",
    "questions": []  // No questions!
  }
}

// ✅ CORRECT
{
  "onboarding": {
    "id": "onboarding",
    "questions": [
      { "id": "q1", "question_text": "Question?", "input_type": "text", "order": 1 }
    ]
  }
}
```

### 3. **Options Missing for Select Types**
```json
// ❌ WRONG
{
  "input_type": "single_select",
  // Missing options array!
}

// ✅ CORRECT
{
  "input_type": "single_select",
  "options": [
    { "id": "opt1", "label": "Option 1", "value": "option_1" }
  ]
}
```

### 4. **Missing Required Fields in Options**
```json
// ❌ WRONG
{
  "options": [
    { "id": "opt1", "value": "val1" }  // Missing "label"!
  ]
}

// ✅ CORRECT
{
  "options": [
    { "id": "opt1", "label": "Option 1", "value": "val1" }
  ]
}
```

### 5. **Wrong `order` Values**
```json
// ❌ WRONG - Order should start at 1, not 0
{
  "questions": [
    { "id": "q1", "order": 0, ... },
    { "id": "q2", "order": 1, ... }
  ]
}

// ✅ CORRECT
{
  "questions": [
    { "id": "q1", "order": 1, ... },
    { "id": "q2", "order": 2, ... }
  ]
}
```

---

## 🔍 How to Verify Your Data

### Check in Browser Console

When starting program onboarding, open the browser console (F12) and look for:

```
📥 Fetching onboarding questions for program: sleep-tight-program
🔍 DEBUG: Fetched Program Data: { programId: "...", title: "...", onboardingQuestionsCount: X, ... }
✅ Onboarding questions loaded: { id: "...", questionsCount: X }
```

**If you see:**
- ✅ `onboardingQuestionsCount: 5` → Good!
- ❌ `onboardingQuestionsCount: 0` → Questions array is empty
- ❌ `hasOnboarding: false` → Onboarding object is missing
- ❌ `onboardingRaw: undefined` → No onboarding property in program

---

## 🛠️ How to Fix Your Database

### If Using Admin Wizard

1. Go to **Admin Panel** → **Equip Programs**
2. Find your program
3. Click **Edit**
4. In the **Onboarding** step, make sure:
   - ✅ At least one question is added
   - ✅ Each question has correct type selected
   - ✅ For select types: Options are added with labels
   - ✅ Questions have proper order (1, 2, 3...)
5. Click **Save Draft**, then **Publish**

### If Editing Database Directly

Use this minimal template:

```json
{
  "id": "your-program-id",
  "equip_id": "your-program-id",
  "slug": "your-program-slug",
  "title": "Your Program Title",
  "description": "Your program description",
  "published": true,
  "onboarding": {
    "id": "your-program-id-onboarding",
    "title": "Program Setup",
    "description": "Let's get started!",
    "is_required_before_start": true,
    "questions": [
      {
        "id": "q1",
        "question_text": "What's your name?",
        "input_type": "text",
        "order": 1,
        "required": true
      },
      {
        "id": "q2",
        "question_text": "What's your goal?",
        "input_type": "single_select",
        "options": [
          { "id": "opt1", "label": "Goal A", "value": "goal_a" },
          { "id": "opt2", "label": "Goal B", "value": "goal_b" }
        ],
        "order": 2,
        "required": true
      }
    ]
  }
}
```

---

## 📝 Quick Checklist

Before publishing a program, verify:

- [ ] `onboarding` object exists
- [ ] `onboarding.questions` is an **array** (not empty)
- [ ] Each question has: `id`, `question_text`, `input_type`, `order`
- [ ] Select questions have: `options` array with `id`, `label`, `value`
- [ ] Questions are ordered correctly (1, 2, 3...)
- [ ] `published` is set to `true`

---

## 🆘 Still Having Issues?

Check the browser console for the debug logs mentioned above. The logs will show exactly what data the wizard is receiving from the database, and you can compare it against this guide to spot issues.
