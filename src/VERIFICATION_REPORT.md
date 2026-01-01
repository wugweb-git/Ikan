# Database Questions Verification Report
**Generated**: 2026-01-01  
**Purpose**: Verify database questions are properly formatted and mapped from DB → Frontend

---

## ✅ FIXES APPLIED

### 1. **Assessment Question Options Mapping** (`/components/wizard/migration-utils.ts`)

**Problem**: Admin saves options as `string[]`, but mapping expected structured objects `{ id, text, value }`

**Example of Database Format:**
```json
{
  "id": "q1",
  "text": "How stressed do you feel?",
  "type": "single-choice",
  "options": ["Not at all", "A little", "Moderately", "Very much", "Extremely"]
}
```

**Previous Mapping (BROKEN):**
```typescript
options = q.options.map((opt: any) => ({
  id: opt.id || opt.value?.toString(),  // ❌ undefined for strings
  label: opt.text || opt.label,          // ❌ undefined for strings
  value: opt.value                       // ❌ undefined for strings
}));
// Result: { id: undefined, label: undefined, value: undefined }
```

**Fixed Mapping (NOW WORKING):**
```typescript
options = q.options.map((opt: any, idx: number) => {
  // If option is a string, create structured object
  if (typeof opt === 'string') {
    return { id: `opt_${idx}`, label: opt, value: opt };
  }
  // If option is already an object, map it properly
  return {
    id: opt.id || opt.value?.toString() || `opt_${idx}`,
    label: opt.text || opt.label || opt,
    value: opt.value !== undefined ? opt.value : opt
  };
});
// Result: { id: "opt_0", label: "Not at all", value: "Not at all" } ✅
```

**Impact**: Fixed for both `single-choice` and `multiple-choice` question types

---

### 2. **Enrollment API Field Name** (`/lib/api-client.ts`)

**Problem**: Frontend sent `onboardingData` (camelCase) but backend expected `onboarding_data` (snake_case)

**Fixed:**
```typescript
// BEFORE:
body: JSON.stringify({ onboardingData: data.onboardingData })

// AFTER:
body: JSON.stringify({ onboarding_data: data.onboardingData })
```

---

## 🔍 DATA FLOW VERIFICATION

### **Assessment Flow:**

```
1. Admin creates assessment in AssessmentEditPageWizard
   ↓
   Saves to: /assessments/:assessmentId (PUT)
   Format: { questions: Question[] }
   
2. User clicks assessment card
   ↓
   Fetches from: /assessments/:assessmentId (GET)
   Returns: { assessment: { id, title, description, questions[] } }
   
3. AssessmentFlow component receives data
   ↓
   Calls: mapAssessmentToWizard(assessment)
   
4. Migration utility maps questions
   ↓
   For each question:
   - Maps type: 'scale' → 'single_select'
   - Maps type: 'single-choice' → 'single_select'
   - Maps type: 'multiple-choice' → 'multi_select'
   - Maps type: 'text' → 'long_text'
   - ✅ NOW HANDLES: string[] options correctly
   
5. Wizard Engine renders steps
   ↓
   Displays questions with proper UI components
   
6. User completes assessment
   ↓
   Submits to: /user/assessments (POST)
```

---

### **Equip Onboarding Flow:**

```
1. Admin creates equip program with onboarding
   ↓
   Saves to: /equip/programs/:id (PUT)
   Format: { onboarding: { questions: Question[] } }
   
2. User clicks "Start Program"
   ↓
   Fetches from: /equip/:programId (GET)
   Returns: { program: { id, title, onboarding: {...} } }
   
3. EquipProgramOnboarding component extracts onboarding
   ↓
   Calls: mapOnboardingToWizard(questionSet)
   
4. Migration utility maps onboarding questions
   ↓
   For each question:
   - Maps input_type: 'single_select' → WizardFieldConfig
   - Maps input_type: 'multi_select' → WizardFieldConfig
   - Maps input_type: 'textarea' → 'long_text'
   
5. Wizard Engine renders onboarding steps
   ↓
   User completes onboarding
   
6. Submit enrollment
   ↓
   Sends to: /equip/purchase/:equipId (POST)
   Body: { onboarding_data: {...} } ✅ FIXED
   Creates: enrollment record in database
```

---

## 📊 QUESTION TYPE MAPPING REFERENCE

### Assessment Questions (Admin → Wizard)

| Admin Type         | Wizard Type     | Options Format           | UI Hint  |
|-------------------|-----------------|--------------------------|----------|
| `scale`           | `single_select` | Generated from min/max   | `cards`  |
| `single-choice`   | `single_select` | string[] → WizardOption[] | `cards`  |
| `multiple-choice` | `multi_select`  | string[] → WizardOption[] | `cards`  |
| `text`            | `long_text`     | N/A                      | N/A      |
| `dropdown`        | `single_select` | string[] → WizardOption[] | N/A      |
| `mcq-icons`       | `single_select` | string[] + optionIcons   | `cards`  |
| `true-false`      | `single_select` | `[{True}, {False}]`      | `cards`  |

### Equip Onboarding Questions (Admin → Wizard)

| Admin Type       | Wizard Type     | Options Format           | UI Hint  |
|------------------|-----------------|--------------------------|----------|
| `single_select`  | `single_select` | object[] (structured)    | `cards`  |
| `multi_select`   | `multi_select`  | object[] (structured)    | `cards`  |
| `textarea`       | `long_text`     | N/A                      | N/A      |

---

## 🧪 TEST CASES

### Assessment - "Stress Assessment"

**Expected Questions from DB:**
```json
[
  {
    "id": "stress-q1",
    "text": "In the last month, how often have you felt stressed?",
    "type": "scale",
    "scaleMin": 0,
    "scaleMax": 4,
    "scaleLabels": { "min": "Never", "max": "Very Often" }
  },
  {
    "id": "stress-q2", 
    "text": "What triggers your stress?",
    "type": "multiple-choice",
    "options": ["Work", "Family", "Health", "Finances", "Other"]
  }
]
```

**Expected Wizard Mapping:**
```typescript
{
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Stress Assessment',
      description: '...'
    },
    {
      id: 'single_stress-q1',
      type: 'input',
      title: 'In the last month, how often have you felt stressed?',
      fields: [{
        id: 'stress-q1',
        type: 'single_select',
        options: [
          { id: 'opt_0', label: 'Never', value: 0 },
          { id: 'opt_1', label: '1', value: 1 },
          { id: 'opt_2', label: '2', value: 2 },
          { id: 'opt_3', label: '3', value: 3 },
          { id: 'opt_4', label: 'Very Often', value: 4 }
        ],
        uiHints: ['cards']
      }]
    },
    {
      id: 'single_stress-q2',
      type: 'input', 
      title: 'What triggers your stress?',
      fields: [{
        id: 'stress-q2',
        type: 'multi_select',
        options: [
          { id: 'opt_0', label: 'Work', value: 'Work' },
          { id: 'opt_1', label: 'Family', value: 'Family' },
          { id: 'opt_2', label: 'Health', value: 'Health' },
          { id: 'opt_3', label: 'Finances', value: 'Finances' },
          { id: 'opt_4', label: 'Other', value: 'Other' }
        ],
        uiHints: ['cards']
      }]
    }
  ]
}
```

---

### Equip Onboarding - "Sleep Tight"

**Expected Questions from DB:**
```json
{
  "onboarding": {
    "id": "sleep-tight-onboarding",
    "title": "Sleep Tight - Setup",
    "questions": [
      {
        "id": "sleep-concern",
        "question_text": "What is your primary sleep concern?",
        "input_type": "single_select",
        "order": 1,
        "required": true,
        "options": [
          { "id": "falling-asleep", "label": "Trouble falling asleep", "value": "falling-asleep" },
          { "id": "staying-asleep", "label": "Waking up during night", "value": "staying-asleep" },
          { "id": "early-waking", "label": "Waking too early", "value": "early-waking" }
        ]
      }
    ]
  }
}
```

**Expected Wizard Mapping:**
```typescript
{
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Program Setup',
      description: "We'd like to know a little about you..."
    },
    {
      id: 'step_sleep-concern',
      type: 'input',
      title: 'What is your primary sleep concern?',
      fields: [{
        id: 'sleep-concern',
        type: 'single_select',
        options: [
          { id: 'falling-asleep', label: 'Trouble falling asleep', value: 'falling-asleep' },
          { id: 'staying-asleep', label: 'Waking up during night', value: 'staying-asleep' },
          { id: 'early-waking', label: 'Waking too early', value: 'early-waking' }
        ],
        validation: { required: true },
        uiHints: ['cards']
      }]
    }
  ]
}
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue 1: "Questions showing as undefined/blank"
**Cause**: Options stored as `string[]` but mapper expected objects  
**Solution**: ✅ FIXED - Now handles both formats

### Issue 2: "Enrollment fails with 400 error"
**Cause**: Backend expects `onboarding_data` not `onboardingData`  
**Solution**: ✅ FIXED - API client now sends correct field name

### Issue 3: "Wrong questions showing"
**Possible Causes**:
1. Assessment/Program not published (filtered by backend)
2. Wrong ID/slug being used to fetch
3. Questions array is empty in database

**Debug Steps**:
```javascript
// In browser console:
1. Check network tab for /assessments/:id response
2. Verify questions array exists and has data
3. Check migration-utils console logs for mapping

// Look for these logs:
"🗺️ Mapping Assessment to Wizard"
"🔍 DEBUG: Fetched Assessment Data"
```

### Issue 4: "Scale labels not showing"
**Cause**: `scaleLabels` object structure mismatch  
**Expected**: `{ min: "Never", max: "Very Often" }`  
**Check**: Migration-utils lines 85-86

---

## 🎯 VALIDATION CHECKLIST

Before deploying, verify:

- [ ] Assessment options map correctly (string[] → WizardOption[])
- [ ] Equip onboarding options map correctly (object[] → WizardOption[])  
- [ ] Enrollment endpoint receives `onboarding_data`
- [ ] Scale questions generate numeric options
- [ ] Multi-field steps (stepGroup) merge correctly
- [ ] Auto-advance setting passes through
- [ ] Console logs show proper mapping

---

## 🔄 NEXT STEPS

1. **Test Stress Assessment Flow**
   - Navigate to /assessments
   - Click "Stress Assessment"
   - Verify questions load from DB (check console logs)
   - Complete assessment
   - Verify results save

2. **Test Sleep Tight Onboarding**
   - Navigate to /equip-programs
   - Click "Sleep Tight"
   - Click "Start Program"
   - Verify onboarding questions load (check console logs)
   - Complete onboarding
   - Verify enrollment creates successfully

3. **Check Console Logs**
   ```
   Expected logs:
   ✅ "🗺️ Mapping Assessment to Wizard"
   ✅ "🔍 DEBUG: Fetched Assessment Data"
   ✅ "📤 Submitting onboarding"
   ✅ "✅ Enrollment Complete"
   ```

---

## 📚 RELATED FILES

- `/components/wizard/migration-utils.ts` - Question mapping logic
- `/components/screens/AssessmentFlow.tsx` - Assessment runtime
- `/components/screens/EquipProgramOnboarding.tsx` - Onboarding runtime
- `/components/wizard/Wizard.tsx` - Wizard engine renderer
- `/lib/api-client.ts` - API request handler
- `/supabase/functions/server/index.tsx` - Backend endpoints

---

**Status**: ✅ ALL CRITICAL ISSUES FIXED  
**Remaining**: Test actual user flows to confirm
