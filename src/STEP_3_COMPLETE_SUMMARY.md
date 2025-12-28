# ✅ Step 3: Onboarding - Complete CMS Implementation

## 🎯 WHAT WAS DELIVERED

A **complete CMS system** for Step 3: Onboarding with:

1. ✅ **4 Question Types** (single_select, multi_select, text, textarea)
2. ✅ **Conditional Logic** (IF/THEN question display)
3. ✅ **Privacy Controls** (general, sensitive, health)
4. ✅ **User Options** (skip, prefer not to answer, required)
5. ✅ **Validation** (max selections, character limits)
6. ✅ **Sleep Tight Template** (5 questions ready to import)

---

## 📦 DATA STRUCTURES

### Updated Interfaces

```typescript
interface ConditionalLogic {
  show_if_question_id: string; // Question that triggers this
  show_if_answer: string | string[]; // Answer(s) that trigger
}

interface OnboardingQuestion {
  id: string;
  order: number;
  question: string;
  helper_text?: string;
  
  // Input
  type: 'single_select' | 'multi_select' | 'text' | 'textarea';
  options?: string[];
  
  // User Options
  allow_skip: boolean;
  allow_prefer_not_to_answer: boolean;
  
  // Validation
  required: boolean;
  max_selections?: number;
  character_limit?: number;
  
  // Conditional
  conditional?: ConditionalLogic;
  
  // Privacy
  privacy_level: 'general' | 'sensitive' | 'health';
  storage_scope: 'equip-only' | 'profile';
  editable_later: boolean;
  
  // UI
  placeholder?: string;
}
```

---

## 🎨 ADMIN CMS - ENHANCED QUESTION EDITOR

### Question Card Layout

```
┌──────────────────────────────────────────────────┐
│  ① Question 1                                [X] │
├──────────────────────────────────────────────────┤
│                                                  │
│  Question Text *                                 │
│  [What do you do for a living?        ]         │
│                                                  │
│  Helper Text (Optional)                          │
│  [This helps us tailor...             ]         │
│                                                  │
│  Input Type *                                    │
│  [⚪ Single Select - One answer only ▼]         │
│                                                  │
│  Answer Options * (One per line)                 │
│  ┌────────────────────────────────────┐          │
│  │ Office worker (9-5)                │          │
│  │ Shift worker                       │          │
│  │ Student                            │          │
│  │ Self-employed                      │          │
│  │ Retired                            │          │
│  │ Prefer not to answer               │          │
│  └────────────────────────────────────┘          │
│                                                  │
│  ┌─ USER OPTIONS ──────────────────┐            │
│  │ ☑ Required                      │            │
│  │ ☑ Allow Skip                    │            │
│  │ ☑ "Prefer not to answer"        │            │
│  └─────────────────────────────────┘            │
│                                                  │
│  ┌─ ⚡ CONDITIONAL LOGIC ──────────┐            │
│  │ ☐ This is a conditional question│            │
│  │                                 │            │
│  │ (If checked, shows:)            │            │
│  │ Show if question...             │            │
│  │ [Select question... ▼]          │            │
│  │                                 │            │
│  │ ...equals answer                │            │
│  │ [e.g., Yes              ]       │            │
│  └─────────────────────────────────┘            │
│                                                  │
│  ┌─ 🔐 PRIVACY & DATA ─────────────┐            │
│  │ Privacy Level: [General ▼]      │            │
│  │ Storage Scope: [Equip Only ▼]   │            │
│  │ ☑ Editable Later                │            │
│  └─────────────────────────────────┘            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Color-Coded Sections

1. **USER OPTIONS** - Blue panel (`#F0F9FF`)
   - Required checkbox
   - Allow Skip checkbox
   - "Prefer not to answer" checkbox

2. **CONDITIONAL LOGIC** - Yellow panel (`#FEF3C7`)
   - Enable conditional checkbox
   - Trigger question dropdown
   - Trigger answer input

3. **PRIVACY & DATA** - Red panel (`#FEE2E2`)
   - Privacy level dropdown
   - Storage scope dropdown
   - Editable later checkbox

---

## 🔄 CONDITIONAL LOGIC FLOW

### Example: Sleep Tight Q2 → Q3

```
Q2: "Have you ever taken therapy before?"
├─ Yes        → Show Q3
├─ No         → Skip Q3
└─ PNTA       → Skip Q3

Q3 (CONDITIONAL): "If yes, what for?"
└─ Only shows if Q2 = "Yes"
```

**Admin Configuration:**
1. Create Q2 (no conditional)
2. Create Q3
3. Check "This is a conditional question"
4. Select "Q2: Have you ever taken therapy before?"
5. Enter "Yes" as trigger answer
6. Save

**Runtime Behavior:**
```typescript
function shouldShowQuestion(question, responses) {
  if (!question.conditional) return true;
  
  const triggerResponse = responses[question.conditional.show_if_question_id];
  return triggerResponse === question.conditional.show_if_answer;
}
```

---

## 📊 SLEEP TIGHT ONBOARDING - 5 QUESTIONS

### Q1: Occupation (General)
```
Question: "What do you do for a living?"
Helper: "This helps us tailor sleep strategies to your schedule"
Type: Single Select
Options:
  - Office worker (9-5)
  - Shift worker (nights/rotating)
  - Student
  - Self-employed
  - Retired
  - Unemployed
  - Prefer not to answer
Privacy: General
Skip: Allowed
```

### Q2: Therapy History (Sensitive)
```
Question: "Have you ever taken therapy before?"
Helper: "No judgment—this just helps us understand your familiarity with CBT techniques"
Type: Single Select
Options:
  - Yes
  - No
  - Prefer not to answer
Privacy: Sensitive
Skip: Allowed
```

### Q3: Therapy Reason (Sensitive, Conditional)
```
Question: "If yes, what for?"
Helper: "Select all that apply. This helps us understand what approaches might already be familiar to you."
Type: Multi-Select
Options:
  - Anxiety
  - Depression
  - Sleep issues
  - Trauma or PTSD
  - Stress management
  - Relationship issues
  - Other
Conditional: Show if Q2 = "Yes"
Privacy: Sensitive
Skip: Allowed
```

### Q4: Pre-existing Conditions (Health)
```
Question: "Do you have any pre-existing conditions you'd like us to be aware of?"
Helper: "This is completely optional. We only ask so we can provide appropriate support..."
Type: Single Select
Options:
  - Yes
  - No
  - Prefer not to answer
Privacy: Health
Skip: Allowed
```

### Q5: Condition Details (Health, Conditional)
```
Question: "If yes, what?"
Helper: "You can share as much or as little as you're comfortable with. This information stays private..."
Type: Textarea
Placeholder: "e.g., Diagnosed insomnia, chronic pain, sleep apnea, medication side effects, etc."
Character Limit: 500
Conditional: Show if Q4 = "Yes"
Privacy: Health
Skip: Allowed
```

---

## 🎮 RUNTIME USER EXPERIENCE

### Screen Flow

```
┌─────────────────────────────┐
│  Before We Begin            │
│                             │
│  Just 5 quick questions to  │
│  help us personalize your   │
│  Sleep Tight experience.    │
│                             │
│  [Start Onboarding]         │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│  Question 1 of 5            │ ← Progress
├─────────────────────────────┤
│                             │
│  What do you do for a       │
│  living?                    │
│                             │
│  This helps us tailor...    │ ← Helper text
│                             │
│  ⚪ Office worker (9-5)     │
│  ⚪ Shift worker           │
│  ⚪ Student                │
│  ⚪ Self-employed          │
│  ⚪ Retired                │
│  ⚪ Unemployed             │
│  ⚪ Prefer not to answer   │
│                             │
│  [Skip]      [Continue →]   │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│  Question 2 of 5            │
├─────────────────────────────┤
│                             │
│  Have you ever taken        │
│  therapy before?            │
│                             │
│  No judgment—this just...   │
│                             │
│  ⚪ Yes                     │
│  ⚪ No                      │
│  ⚪ Prefer not to answer    │
│                             │
│  [← Back]    [Continue →]   │
└─────────────────────────────┘
        ↓ (If "Yes")
┌─────────────────────────────┐
│  Question 3 of 5            │
├─────────────────────────────┤
│                             │
│  If yes, what for?          │
│                             │
│  Select all that apply...   │
│                             │
│  ☑ Anxiety                  │
│  ☐ Depression               │
│  ☑ Sleep issues             │
│  ☐ Trauma or PTSD           │
│  ☐ Stress management        │
│  ☐ Relationship issues      │
│  ☐ Other                    │
│                             │
│  [Skip]      [Continue →]   │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│  Question 4 of 5            │
├─────────────────────────────┤
│  (Pre-existing conditions)  │
└─────────────────────────────┘
        ↓ (If "Yes")
┌─────────────────────────────┐
│  Question 5 of 5            │
├─────────────────────────────┤
│  If yes, what?              │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │ [Textarea]            │  │
│  │                       │  │
│  └───────────────────────┘  │
│  0 / 500 characters         │
│                             │
│  [Skip]      [Continue →]   │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│  ✅ All Set!                │
│                             │
│  Thanks for sharing. We're  │
│  ready to start your Sleep  │
│  Tight journey!             │
│                             │
│  [Begin Day 1 →]            │
└─────────────────────────────┘
```

---

## 🗄️ DATA STORAGE

### Runtime Table: `user_onboarding_responses`

```sql
CREATE TABLE user_onboarding_responses (
  id UUID PRIMARY KEY,
  enrollment_id UUID REFERENCES user_program_enrollments(id),
  question_id TEXT,
  question_text TEXT, -- Snapshot at answer time
  question_type TEXT,
  
  -- Response
  answer TEXT, -- For single_select/text
  answers JSONB, -- For multi_select
  
  -- Metadata
  privacy_level TEXT,
  skipped BOOLEAN DEFAULT false,
  prefer_not_to_answer BOOLEAN DEFAULT false,
  
  -- Timestamps
  answered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```json
[
  {
    "question_id": "sleep_q1",
    "question_text": "What do you do for a living?",
    "question_type": "single_select",
    "answer": "Office worker (9-5)",
    "privacy_level": "general",
    "skipped": false
  },
  {
    "question_id": "sleep_q2",
    "question_text": "Have you ever taken therapy before?",
    "question_type": "single_select",
    "answer": "Yes",
    "privacy_level": "sensitive"
  },
  {
    "question_id": "sleep_q3",
    "question_text": "If yes, what for?",
    "question_type": "multi_select",
    "answers": ["Anxiety", "Sleep issues"],
    "privacy_level": "sensitive"
  },
  {
    "question_id": "sleep_q4",
    "privacy_level": "health",
    "skipped": true
  }
]
```

---

## 📝 FILES CREATED/MODIFIED

### Modified
1. ✅ `/components/screens/EquipProgramEditPageWizard.tsx`
   - Updated `OnboardingQuestion` interface (11 fields added)
   - Added `ConditionalLogic` interface
   - Updated `addOnboardingQuestion` function with defaults
   - Updated `questionTypeOptions` to 4 types
   - **Completely rebuilt Step 3 UI** with:
     - Question numbering
     - Helper text field
     - Conditional logic section
     - Privacy & data section
     - User options section

### Created (Documentation)
2. ✅ `/STEP_3_ONBOARDING_CMS.md` - Complete CMS guide
3. ✅ `/SLEEP_TIGHT_ONBOARDING_SEED.json` - 5 questions seed data
4. ✅ `/STEP_3_COMPLETE_SUMMARY.md` - This file

---

## 🧪 TESTING GUIDE

### Test Basic Question
1. Navigate to `/admin/equip/new`
2. Complete Steps 1-2
3. **Step 3: Onboarding**
4. Click "Add Question"
5. **Verify:** Question card appears with all sections
6. Fill in:
   - Question: "What do you do for a living?"
   - Helper text: "This helps us..."
   - Type: Single Select
   - Options: (add 5 options)
   - Check "Allow Skip"
   - Privacy: General
7. Save program
8. Reload
9. **Verify:** Question persisted correctly

### Test Conditional Question
1. Add Q2: "Have you ever taken therapy before?"
   - Type: Single Select
   - Options: Yes, No, PNTA
2. Add Q3: "If yes, what for?"
   - Type: Multi-Select
   - **Check "This is a conditional question"**
   - **Select "Q2" as trigger question**
   - **Enter "Yes" as trigger answer**
   - Add options
3. Save
4. Reload
5. **Verify:** Q3 has conditional config saved
6. **Verify:** Yellow conditional panel shows correctly

### Test Privacy Levels
1. Create 3 questions with different privacy levels:
   - Q1: General
   - Q2: Sensitive
   - Q3: Health
2. **Verify:** Privacy dropdown works for each
3. Save and reload
4. **Verify:** Privacy levels persisted

---

## 🚀 RUNTIME COMPONENTS (TO BUILD)

### Component Architecture

```
<OnboardingFlow>
  ├─ <OnboardingWelcome> - "Before We Begin" screen
  │
  ├─ <OnboardingQuestion> - Renders individual question
  │   ├─ <RadioGroup> (for single_select)
  │   ├─ <CheckboxGroup> (for multi_select)
  │   ├─ <Input> (for text)
  │   └─ <Textarea> (for textarea)
  │
  ├─ <OnboardingProgress> - "Question X of Y"
  │
  └─ <OnboardingComplete> - "All Set!" confirmation
```

### Example: `<OnboardingFlow>`

```tsx
function OnboardingFlow({ enrollmentId, program }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  
  // Filter visible questions based on conditional logic
  const visibleQuestions = program.onboarding_questions.filter(q => {
    if (!q.conditional) return true;
    const triggerResponse = responses[q.conditional.show_if_question_id];
    return triggerResponse === q.conditional.show_if_answer;
  });
  
  const currentQuestion = visibleQuestions[currentIndex];
  
  const handleAnswer = async (value) => {
    setResponses({ ...responses, [currentQuestion.id]: value });
    
    // Save to backend
    await saveOnboardingResponse(enrollmentId, currentQuestion.id, value);
    
    // Move to next question or complete
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Onboarding complete → redirect to Day 1
      router.push(`/programs/${program.id}/day/1`);
    }
  };
  
  const handleSkip = async () => {
    await saveOnboardingResponse(enrollmentId, currentQuestion.id, null, { skipped: true });
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push(`/programs/${program.id}/day/1`);
    }
  };
  
  return (
    <div>
      <OnboardingProgress 
        current={currentIndex + 1} 
        total={visibleQuestions.length} 
      />
      
      <OnboardingQuestion
        question={currentQuestion}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
        onBack={() => setCurrentIndex(currentIndex - 1)}
        canGoBack={currentIndex > 0}
      />
    </div>
  );
}
```

---

## ✅ SUCCESS CRITERIA

✅ **CMS Interface:**
- Questions can be added, edited, deleted
- All 4 input types supported
- Conditional logic can be configured
- Privacy levels assignable
- Helper text editable

✅ **Data Structure:**
- OnboardingQuestion interface complete
- ConditionalLogic interface working
- All fields persist correctly

✅ **Sleep Tight Template:**
- 5 questions defined
- 2 conditional questions configured
- 3 privacy levels demonstrated

✅ **Documentation:**
- Complete CMS guide
- Seed data JSON
- Runtime component specs

---

## 🎉 FINAL SUMMARY

**Step 3: Onboarding CMS** is now fully implemented with:

✨ **4 Question Types** - Single-select, multi-select, text, textarea  
✨ **Conditional Logic** - IF Q2="Yes" THEN show Q3  
✨ **Privacy Controls** - General, Sensitive, Health classifications  
✨ **User Experience Controls** - Skip, Prefer not to answer, Required  
✨ **Validation** - Max selections, character limits  
✨ **Sleep Tight Template** - 5 ready-to-use questions  

**Alignment with Requirements:**
- ✅ Minimal, context-specific intake
- ✅ Not duplicating profile data
- ✅ Optional per question
- ✅ Conditional logic supported
- ✅ Privacy metadata tracked
- ✅ One question per screen (runtime)

**Status:** ✅ **CMS Complete**  
**Next:** Build runtime onboarding flow components 🚀

---

## 📚 COMPLETE SYSTEM ARCHITECTURE

```
EQUIP PROGRAM STRUCTURE (4 STEPS)

Step 1: Basic Info
├─ Title, description, category
├─ Cover image, thumbnail
└─ Pricing

Step 2: Equip Details  
├─ Hero section
├─ What/Why/Benefits
├─ FAQ
└─ Instructor

Step 3: Onboarding ← ✅ COMPLETE
├─ 5 Questions for Sleep Tight
├─ Conditional logic (Q2 → Q3, Q4 → Q5)
├─ Privacy levels (General, Sensitive, Health)
└─ Runtime: One question per screen

Step 4: Daily Program Builder ← ✅ COMPLETE
├─ 9 days for Sleep Tight
├─ 35 blocks total
├─ 6 exercise subtypes
├─ Progressive data (i04+, i07++)
└─ Image uploads (day + block level)
```

**The complete Sleep Tight program is now ready to build! 🌙**
