# Assessment Data Format Guide

## 📋 Required Structure for Assessment Data in Database

When creating assessments via the Admin Wizard or directly in the database, the assessment object MUST follow this structure:

### ✅ Complete Assessment Object Structure

```json
{
  "id": "stress-assessment",
  "assessment_id": "stress-assessment",
  "slug": "stress-assessment",
  "title": "Perceived Stress Scale",
  "description": "Gauge how overwhelmed or in control you've felt over the last month to understand your stress levels.",
  "published": true,
  "questions": [
    {
      "id": "q1",
      "text": "In the last month, how often have you been upset because of something that happened unexpectedly?",
      "type": "scale",
      "scaleMin": 0,
      "scaleMax": 4,
      "scaleLabels": {
        "min": "Never",
        "max": "Very Often"
      },
      "required": true,
      "autoAdvance": false,
      "stepGroup": null
    },
    {
      "id": "q2",
      "text": "In the last month, how often have you felt that you were unable to control the important things in your life?",
      "type": "scale",
      "scaleMin": 0,
      "scaleMax": 4,
      "scaleLabels": {
        "min": "Never",
        "max": "Very Often"
      },
      "required": true,
      "autoAdvance": false,
      "stepGroup": null
    }
  ],
  "scoring": {
    "type": "sum",
    "ranges": [
      {
        "min": 0,
        "max": 13,
        "label": "Low Stress",
        "interpretation": "Your stress levels are low. You're managing well.",
        "icon": "success"
      },
      {
        "min": 14,
        "max": 26,
        "label": "Moderate Stress",
        "interpretation": "You're experiencing moderate stress. Consider stress management techniques.",
        "icon": "warning"
      },
      {
        "min": 27,
        "max": 40,
        "label": "High Stress",
        "interpretation": "You're experiencing high stress. Professional support may be beneficial.",
        "icon": "error"
      }
    ]
  },
  "metadata": {
    "estimated_minutes": 5,
    "category": "stress",
    "version": "1.0"
  },
  "created_at": "2025-01-01T12:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z"
}
```

---

## 🔑 Critical Field Explanations

### **Question Object Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ Yes | Unique identifier for the question | `"q1"`, `"stress_q1"` |
| `text` | string | ✅ Yes | The question text displayed to user | `"How often do you feel stressed?"` |
| `type` | string | ✅ Yes | Question type (see types below) | `"scale"`, `"single-choice"`, `"multiple-choice"`, `"text"` |
| `scaleMin` | number | For scale type | Minimum value for scale (usually 0) | `0` |
| `scaleMax` | number | For scale type | Maximum value for scale | `4` |
| `scaleLabels` | object | For scale type | Labels for min/max endpoints | `{ "min": "Never", "max": "Always" }` |
| `options` | array | For choice types | Array of option objects | See options format below |
| `required` | boolean | No (default: true) | Whether answer is required | `true` |
| `autoAdvance` | boolean | No (default: false) | Auto-advance to next after selection | `false` |
| `stepGroup` | string/null | No | Group questions into single step | `null` or `"section-1"` |

### **Question Types**

#### 1. **Scale Type** (`type: "scale"`)
Used for Likert scales, rating questions, etc.

```json
{
  "id": "q1",
  "text": "How stressed do you feel?",
  "type": "scale",
  "scaleMin": 0,
  "scaleMax": 4,
  "scaleLabels": {
    "min": "Not at all",
    "max": "Extremely"
  },
  "required": true
}
```

**Renders as:** Card-based buttons with labels (0 = "Not at all", 1, 2, 3, 4 = "Extremely")

#### 2. **Single Choice** (`type: "single-choice"`)
Multiple choice with one answer.

```json
{
  "id": "q2",
  "text": "What best describes your current situation?",
  "type": "single-choice",
  "options": [
    { "id": "opt1", "text": "Working full-time", "value": 1 },
    { "id": "opt2", "text": "Student", "value": 2 },
    { "id": "opt3", "text": "Retired", "value": 3 }
  ],
  "required": true
}
```

#### 3. **Multiple Choice** (`type: "multiple-choice"`)
Multiple choice with multiple answers allowed.

```json
{
  "id": "q3",
  "text": "Which symptoms have you experienced? (Select all that apply)",
  "type": "multiple-choice",
  "options": [
    { "id": "sym1", "text": "Headaches", "value": "headaches" },
    { "id": "sym2", "text": "Fatigue", "value": "fatigue" },
    { "id": "sym3", "text": "Insomnia", "value": "insomnia" }
  ],
  "required": false
}
```

#### 4. **Text** (`type: "text"`)
Free-text response (textarea).

```json
{
  "id": "q4",
  "text": "Please describe your main concerns:",
  "type": "text",
  "placeholder": "Type your response here...",
  "required": false
}
```

### **Scoring Object**

```json
{
  "scoring": {
    "type": "sum",  // or "average"
    "ranges": [
      {
        "min": 0,
        "max": 10,
        "label": "Low Risk",
        "interpretation": "Your scores suggest low stress levels.",
        "icon": "success"  // "success", "warning", or "error"
      },
      {
        "min": 11,
        "max": 20,
        "label": "Moderate Risk",
        "interpretation": "You may benefit from stress management techniques.",
        "icon": "warning"
      }
    ]
  }
}
```

---

## ❌ Common Mistakes to Avoid

### 1. **Missing `scaleMin` / `scaleMax` for Scale Questions**
```json
// ❌ WRONG - Options will be empty!
{
  "type": "scale",
  "scaleLabels": { "min": "Never", "max": "Always" }
  // Missing scaleMin and scaleMax!
}

// ✅ CORRECT
{
  "type": "scale",
  "scaleMin": 0,
  "scaleMax": 4,
  "scaleLabels": { "min": "Never", "max": "Always" }
}
```

### 2. **Options Array with Missing Fields**
```json
// ❌ WRONG - Missing 'text' or 'label' field
{
  "type": "single-choice",
  "options": [
    { "id": "opt1", "value": 1 }  // No "text" field!
  ]
}

// ✅ CORRECT
{
  "type": "single-choice",
  "options": [
    { "id": "opt1", "text": "Option 1", "value": 1 }
  ]
}
```

### 3. **Questions Array is String Instead of Array**
```json
// ❌ WRONG
{
  "questions": "[]"  // String, not array!
}

// ✅ CORRECT
{
  "questions": []  // Actual array
}
```

### 4. **Nested Questions in Wrong Format**
The wizard expects questions to be a flat array at the top level, NOT nested in a `steps` array.

```json
// ❌ WRONG
{
  "steps": [
    {
      "fields": [
        { "id": "q1", "text": "Question 1", ... }
      ]
    }
  ]
}

// ✅ CORRECT
{
  "questions": [
    { "id": "q1", "text": "Question 1", ... }
  ]
}
```

---

## 🔍 How to Verify Your Data

### Check in Browser Console

When you take an assessment, open the browser console (F12) and look for these logs:

```
🔍 DEBUG: Fetched Assessment Data: { id: "...", title: "...", questionsCount: X, ... }
🗺️ Mapping Assessment to Wizard: { assessmentId: "...", title: "...", questionsCount: X, questions: [...] }
🧙 Unified Wizard Engine Active: stress-assessment (Mode: assessment)
```

**If you see:**
- ✅ `questionsCount: 10` → Good!
- ❌ `questionsCount: 0` → Questions array is empty or wrong format
- ❌ `questions: undefined` → Questions field is missing

### Check the First Question Structure

The console will also log `firstQuestion`. It should look like:
```json
{
  "id": "q1",
  "text": "Your question text here",
  "type": "scale",
  "scaleMin": 0,
  "scaleMax": 4,
  "scaleLabels": { "min": "Never", "max": "Always" },
  "required": true
}
```

**If options are empty/blank on screen**, check:
1. For `type: "scale"`: Are `scaleMin` and `scaleMax` defined?
2. For `type: "single-choice"`: Does `options` array have `text` or `label` fields?

---

## 🛠️ How to Fix Your Database

### If Using Admin Wizard

The Admin Wizard should automatically create the correct structure. But if you manually edited the database:

1. Go to **Admin Panel** → **Assessments**
2. Find your assessment
3. Click **Edit**
4. In the **Questions** step, make sure each question has:
   - ✅ Question Text
   - ✅ Question Type selected
   - ✅ For scales: Min/Max values set
   - ✅ For choices: Options added with text
5. Click **Save Draft**, then **Publish**

### If Editing Database Directly

Use this template and replace values:

```json
{
  "id": "your-assessment-id",
  "assessment_id": "your-assessment-id",
  "slug": "your-assessment-slug",
  "title": "Your Assessment Title",
  "description": "Your description",
  "published": true,
  "questions": [
    {
      "id": "q1",
      "text": "Your question?",
      "type": "scale",
      "scaleMin": 0,
      "scaleMax": 4,
      "scaleLabels": { "min": "Never", "max": "Always" },
      "required": true
    }
  ],
  "scoring": {
    "type": "sum",
    "ranges": [
      { "min": 0, "max": 20, "label": "Result", "interpretation": "Interpretation text", "icon": "success" }
    ]
  }
}
```

---

## 📝 Quick Checklist

Before publishing an assessment, verify:

- [ ] `questions` is an **array** (not a string)
- [ ] Each question has: `id`, `text`, `type`
- [ ] Scale questions have: `scaleMin`, `scaleMax`, `scaleLabels`
- [ ] Choice questions have: `options` array with `id`, `text`, `value`
- [ ] `scoring.ranges` is defined with at least one range
- [ ] `published` is set to `true`

---

## 🆘 Still Having Issues?

Check the browser console for the debug logs mentioned above. The logs will tell you exactly what data the wizard is receiving, and you can compare it against this guide to spot discrepancies.
