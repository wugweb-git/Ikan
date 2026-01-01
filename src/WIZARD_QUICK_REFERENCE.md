# Unified Wizard Engine - Quick Reference Card

**For:** Developers integrating the wizard into new flows  
**Version:** 1.0  
**Last Updated:** 2025-12-31

---

## 🚀 Basic Usage

```typescript
import { Wizard } from './components/wizard/Wizard';
import { WizardConfig } from './components/wizard/types';

function MyFlow() {
  const config: WizardConfig = {
    id: 'my-flow-123',
    title: 'My Assessment',
    mode: 'assessment', // or 'equip_onboarding' | 'equip_daily'
    showProgress: true,
    progressType: 'bar', // or 'dots' | 'count'
    steps: [
      // ... step definitions
    ]
  };

  return (
    <Wizard
      config={config}
      initialData={{}} // Resume data
      initialStepIndex={0} // Resume position
      onComplete={(results) => {
        console.log('User completed:', results);
      }}
      onSave={(state) => {
        localStorage.setItem('wizard_state', JSON.stringify(state));
      }}
      onExit={() => {
        navigate('/home');
      }}
    />
  );
}
```

---

## 📋 Step Types

| Type | Purpose | Example |
|------|---------|---------|
| `intro` | Welcome screen | "Welcome to Sleep Tight" |
| `info` | Read-only content | Lesson, instructions |
| `input` | Single/multi-field form | Questions, journal |
| `composite` | Same as input | (legacy alias) |
| `custom` | Custom React component | Advanced exercises |
| `outro` | Completion screen | "Day Complete!" |

---

## 🔧 Field Primitives (LOCKED - Do Not Expand)

### Text Inputs
```typescript
{ id: 'name', type: 'text', label: 'Name' }
{ id: 'notes', type: 'long_text', label: 'Notes', placeholder: 'Write here...' }
```

### Choices
```typescript
// Single select (radio)
{
  id: 'mood',
  type: 'single_select',
  label: 'How do you feel?',
  options: [
    { id: 'calm', label: 'Calm', value: 'calm' },
    { id: 'anxious', label: 'Anxious', value: 'anxious' }
  ],
  uiHints: ['cards'], // Large cards instead of radio buttons
  autoAdvance: true // Auto-proceed after selection
}

// Multi select (checkboxes)
{
  id: 'symptoms',
  type: 'multi_select',
  label: 'Select all that apply',
  options: [ /* ... */ ]
}

// Boolean (yes/no)
{
  id: 'share',
  type: 'boolean',
  label: 'Share with therapist?'
}
```

### Numbers & Time
```typescript
{ id: 'age', type: 'number', validation: { min: 18, max: 120 } }
{ id: 'bedtime', type: 'time', label: 'Bedtime' }
```

### Lists (Repeatable)
```typescript
// Simple list
{
  id: 'gratitude',
  type: 'text_list',
  label: 'List 3 things',
  validation: { maxItems: 3 }
}

// Structured rows
{
  id: 'pros_cons',
  type: 'row_list',
  label: 'Pros and Cons',
  validation: { maxItems: 10 },
  rowSchema: [
    { id: 'type', type: 'text', label: 'Pro/Con' },
    { id: 'thought', type: 'long_text', label: 'Explain' }
  ]
}
```

### Matrix (Grid)
```typescript
{
  id: 'habits',
  type: 'matrix',
  label: 'Weekly Habit Tracker',
  rows: [
    { id: 'exercise', label: 'Exercise', value: 'exercise' },
    { id: 'journal', label: 'Journal', value: 'journal' }
  ],
  columns: [
    { id: 'mon', label: 'Mon', value: 'monday' },
    { id: 'tue', label: 'Tue', value: 'tuesday' }
  ]
}
// Saves as: { exercise: 'monday', journal: 'tuesday' }
```

### Info (Read-Only)
```typescript
{
  id: 'lesson_content',
  type: 'info',
  description: 'Markdown or HTML content here...'
}
```

---

## 🎯 Multi-Field Steps

```typescript
{
  id: 'sleep_diary',
  type: 'input',
  title: 'Sleep Log',
  fields: [
    { id: 'bedtime', type: 'time', label: 'Bedtime', validation: { required: true } },
    { id: 'wake_time', type: 'time', label: 'Wake time', validation: { required: true } },
    { id: 'quality', type: 'number', label: 'Quality (1-10)', validation: { min: 1, max: 10 } },
    { id: 'nightmares', type: 'boolean', label: 'Nightmares?', validation: { required: false } }
  ]
}
// All 4 fields appear on ONE screen
```

---

## 🔀 Conditional Logic

### Field-Level (Show/Hide)
```typescript
{
  id: 'step_conditional',
  fields: [
    {
      id: 'has_pet',
      type: 'single_select',
      label: 'Do you have a pet?',
      options: [
        { id: 'yes', label: 'Yes', value: true },
        { id: 'no', label: 'No', value: false }
      ]
    },
    {
      id: 'pet_name',
      type: 'text',
      label: 'Pet name',
      dependsOn: {
        fieldId: 'has_pet',
        value: true,
        operator: 'equals'
      },
      validation: { required: true } // Required when visible
    }
  ]
}
```

### Step-Level (Skip)
```typescript
{
  id: 'nightmare_details',
  type: 'input',
  condition: {
    fieldId: 'had_nightmares',
    value: true,
    operator: 'equals'
  },
  fields: [
    { id: 'nightmare_desc', type: 'long_text', label: 'Describe' }
  ]
}
// Step automatically skipped if had_nightmares !== true
```

**Operators:** `equals`, `not_equals`, `contains`, `greater_than`, `less_than`

---

## 🎨 UI Hints

```typescript
uiHints: ['cards']       // Large clickable cards (single/multi select)
uiHints: ['inline']      // Horizontal radio buttons
uiHints: ['full-width']  // Full-width input
uiHints: ['compact']     // Reduced padding
```

---

## ✅ Validation Rules

```typescript
validation: {
  required: true,           // Field is required
  min: 1,                   // Min value (number)
  max: 10,                  // Max value (number)
  minLength: 10,            // Min characters (text)
  maxLength: 500,           // Max characters (text)
  pattern: '^[0-9]+$',      // Regex pattern
  maxItems: 5,              // Max array items (lists)
  customMessage: 'Error!'   // Custom error text
}
```

---

## 🧭 Navigation Options

```typescript
{
  id: 'step_custom_nav',
  title: 'Review',
  nextLabel: 'Submit',      // Custom "Next" text
  backLabel: 'Previous',    // Custom "Back" text
  rules: {
    skippable: true,        // Show "Skip" button
    resettable: true        // Show "Reset this step" button
  }
}
```

---

## 📊 Progress Indicators

```typescript
// Percentage bar (default for assessments)
{ progressType: 'bar', showProgress: true }

// Step counter (good for onboarding)
{ progressType: 'count', showProgress: true }

// Dots (good for short flows)
{ progressType: 'dots', showProgress: true }

// No progress
{ showProgress: false }
```

---

## 🔄 Data Lifecycle

### Save State
```typescript
onSave={(state) => {
  // Auto-called on every step change
  localStorage.setItem('wizard_state', JSON.stringify(state));
}}
```

### Resume
```typescript
const savedState = JSON.parse(localStorage.getItem('wizard_state'));

<Wizard
  config={config}
  initialData={savedState?.answers || {}}
  initialStepIndex={savedState?.currentStepIndex || 0}
/>
```

### Complete
```typescript
onComplete={(results) => {
  // Called when user finishes last step
  console.log(results); // { field_id: value, ... }
  
  // For assessments:
  const score = calculateScore(results);
  
  // For equip:
  markDayComplete(results);
}}
```

---

## 🔌 Variable Substitution

```typescript
// Reference earlier answers:
{
  title: "Hi {{user_name}}!",
  description: "Your goal was: {{primary_goal}}. Let's review progress."
}

// At runtime:
// user_name = "Sarah" → "Hi Sarah!"
// primary_goal = "Sleep better" → "Your goal was: Sleep better. Let's review progress."
```

---

## 🛠 Migration Utilities

### Convert Assessment
```typescript
import { mapAssessmentToWizard } from './components/wizard/migration-utils';

const assessment = await fetchAssessment(id);
const wizardConfig = mapAssessmentToWizard(assessment);

<Wizard config={wizardConfig} ... />
```

### Convert Equip Day
```typescript
import { mapEquipDayToWizard } from './components/wizard/migration-utils';

const dayData = await fetchEquipDay(programId, dayNumber);
const wizardConfig = mapEquipDayToWizard(dayData, dayNumber);

<Wizard config={wizardConfig} ... />
```

### Convert Onboarding
```typescript
import { mapOnboardingToWizard } from './components/wizard/migration-utils';

const questions = program.onboardingQuestions;
const wizardConfig = mapOnboardingToWizard(questions);

<Wizard config={wizardConfig} ... />
```

---

## ⚠️ Common Pitfalls

### ❌ DON'T: Create new field types
```typescript
{ type: 'custom_rating' } // ❌ NO - Use single_select with numbers
```

### ✅ DO: Use existing primitives
```typescript
{
  type: 'single_select',
  options: [
    { id: '1', label: '⭐', value: 1 },
    { id: '2', label: '⭐⭐', value: 2 },
    // ... up to 5
  ]
}
```

### ❌ DON'T: Add mode-specific logic
```typescript
if (config.mode === 'assessment') {
  // ❌ NO - Use config properties instead
}
```

### ✅ DO: Use configuration
```typescript
{
  showProgress: config.mode === 'assessment',
  progressType: config.mode === 'assessment' ? 'bar' : 'dots'
}
```

### ❌ DON'T: Modify answers during navigation
```typescript
const goToNext = () => {
  setAnswers({}); // ❌ NO - Erases data
}
```

### ✅ DO: Preserve state
```typescript
// Navigation only changes currentStepIndex
// answers{} persists automatically
```

---

## 📞 Support

**Documentation:**
- `/WIZARD_VERIFICATION.md` - Full spec compliance
- `/WIZARD_SANITY_CHECKS.md` - Pre-migration checks
- `/WIZARD_MANUAL_TEST_GUIDE.md` - Test procedures

**Code Locations:**
- Runtime: `/components/wizard/`
- Types: `/components/wizard/types.ts`
- Migration: `/components/wizard/migration-utils.ts`
- Flows: `/components/screens/`

**Design System:**
- Tokens: `/styles/globals.css`
- Guidelines: `/Guidelines.md`

---

## 🎓 Example: Complete Assessment

```typescript
const myAssessment: WizardConfig = {
  id: 'phq9',
  title: 'PHQ-9 Depression Screening',
  mode: 'assessment',
  showProgress: true,
  progressType: 'bar',
  
  steps: [
    // Intro
    {
      id: 'intro',
      type: 'intro',
      title: 'PHQ-9 Assessment',
      description: 'This will take about 5 minutes.',
      nextLabel: 'Begin'
    },
    
    // Question 1
    {
      id: 'q1',
      type: 'input',
      title: 'Little interest in things?',
      fields: [{
        id: 'phq9_q1',
        type: 'single_select',
        options: [
          { id: '0', label: 'Not at all', value: 0 },
          { id: '1', label: 'Several days', value: 1 },
          { id: '2', label: 'More than half', value: 2 },
          { id: '3', label: 'Nearly every day', value: 3 }
        ],
        uiHints: ['cards'],
        autoAdvance: true,
        validation: { required: true }
      }]
    },
    
    // ... Q2-Q9 similar structure
    
    // Outro
    {
      id: 'outro',
      type: 'outro',
      title: 'Assessment Complete',
      description: 'Calculating your results...'
    }
  ]
};

function PHQ9Flow() {
  return (
    <Wizard
      config={myAssessment}
      onComplete={(results) => {
        const score = Object.values(results)
          .reduce((sum, val) => sum + (Number(val) || 0), 0);
        
        const severity = 
          score <= 4 ? 'Minimal' :
          score <= 9 ? 'Mild' :
          score <= 14 ? 'Moderate' :
          score <= 19 ? 'Moderately Severe' : 'Severe';
        
        showResults(score, severity);
      }}
      onExit={() => navigate('/assessments')}
    />
  );
}
```

---

**Last Updated:** 2025-12-31  
**Version:** 1.0  
**Status:** ✅ Production Ready
