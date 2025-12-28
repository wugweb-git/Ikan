# Step 3: Onboarding CMS - Complete Implementation

## 🎯 OVERVIEW

Step 3 is a **lightweight, Equip-specific intake** that collects minimal context before the user starts the daily program. It is:

- ✅ **NOT** a profile or global assessment
- ✅ **NOT** personalization or adaptive content
- ✅ **NOT** required for program access
- ✅ **ONLY** context-setting for better support

**Key Principle:** "One question per screen, always skippable"

---

## 📊 DATA STRUCTURE

### ConditionalLogic Interface
```typescript
interface ConditionalLogic {
  show_if_question_id: string; // ID of triggering question
  show_if_answer: string | string[]; // Answer(s) that trigger display
}
```

### OnboardingQuestion Interface
```typescript
interface OnboardingQuestion {
  id: string;
  order: number; // Drag-and-drop ordering
  question: string;
  helper_text?: string; // Reassurance text below question
  
  // Input Configuration
  type: 'single_select' | 'multi_select' | 'text' | 'textarea';
  options?: string[]; // For select types
  
  // User Options
  allow_skip: boolean; // Show "Skip" button
  allow_prefer_not_to_answer: boolean; // Add "Prefer not to answer" option
  
  // Validation
  required: boolean; // Block continuation if unanswered
  max_selections?: number; // For multi_select
  character_limit?: number; // For text/textarea
  
  // Conditional Logic
  conditional?: ConditionalLogic; // Show only if...
  
  // Privacy & Data Classification
  privacy_level: 'general' | 'sensitive' | 'health';
  storage_scope: 'equip-only' | 'profile';
  editable_later: boolean; // Can user edit after submission?
  
  // UI
  placeholder?: string;
}
```

---

## 🎨 ADMIN UI - STEP 3 CMS

### Question Card Structure

```
┌────────────────────────────────────────────────────────┐
│  ① Question 1                                      [X] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Question Text * (Required)                            │
│  [What do you do for a living?              ]         │
│                                                        │
│  Helper Text (Optional)                                │
│  [This helps us tailor the program...       ]         │
│                                                        │
│  Input Type * (Required)                               │
│  [⚪ Single Select - One answer only ▼       ]         │
│                                                        │
│  Answer Options * (One per line)                       │
│  ┌─────────────────────────────────────┐              │
│  │ Office worker                       │              │
│  │ Student                             │              │
│  │ Self-employed                       │              │
│  │ Retired                             │              │
│  │ Prefer not to answer                │              │
│  └─────────────────────────────────────┘              │
│                                                        │
│  ┌─ USER OPTIONS ────────────────────────┐            │
│  │ ☑ Required                            │            │
│  │ ☑ Allow Skip                          │            │
│  │ ☑ "Prefer not to answer"              │            │
│  └───────────────────────────────────────┘            │
│                                                        │
│  ┌─ ⚡ CONDITIONAL LOGIC ────────────────┐            │
│  │ ☐ This is a conditional question      │            │
│  └───────────────────────────────────────┘            │
│                                                        │
│  ┌─ 🔐 PRIVACY & DATA ───────────────────┐            │
│  │ Privacy Level: [General ▼]            │            │
│  │ Storage Scope: [Equip Only ▼]         │            │
│  │ ☑ Editable Later                      │            │
│  └───────────────────────────────────────┘            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 CONDITIONAL LOGIC EXAMPLE

### Question 2: "Have you ever taken therapy before?"
```json
{
  "id": "q2",
  "order": 1,
  "question": "Have you ever taken therapy before?",
  "type": "single_select",
  "options": ["Yes", "No", "Prefer not to answer"],
  "conditional": null // Not conditional
}
```

### Question 3: "If yes, what for?" (CONDITIONAL)
```json
{
  "id": "q3",
  "order": 2,
  "question": "If yes, what for?",
  "type": "multi_select",
  "options": ["Anxiety", "Depression", "Sleep issues", "Trauma", "Other"],
  "conditional": {
    "show_if_question_id": "q2",
    "show_if_answer": "Yes" // Only shows if Q2 = "Yes"
  }
}
```

**Admin UI for Q3:**
```
┌─ ⚡ CONDITIONAL LOGIC ─────────────────────────┐
│ ☑ This is a conditional question               │
│                                                 │
│ Show if question...                             │
│ [Q2: Have you ever taken therapy before? ▼]    │
│                                                 │
│ ...equals answer                                │
│ [Yes                                    ]       │
└─────────────────────────────────────────────────┘
```

---

## 🧩 QUESTION TYPES & UI MAPPING

| Type | Admin Label | User UI Component | Example |
|------|-------------|-------------------|---------|
| `single_select` | ⚪ Single Select | RadioGroup | "What do you do?" → Office worker |
| `multi_select` | ☑️ Multi-Select | CheckboxGroup | "What for?" → [Anxiety, Sleep] |
| `text` | 📝 Short Text | Input | "Occupation?" → "Software Engineer" |
| `textarea` | 📄 Long Text | Textarea | "Tell us more..." → (paragraph) |

---

## 🔐 PRIVACY LEVELS

### General
- **Examples:** Occupation, age range, interests
- **Storage:** Can be used for analytics
- **Display:** May appear in profile summary

### Sensitive
- **Examples:** Therapy history, life events
- **Storage:** Encrypted, limited access
- **Display:** Never shown publicly

### Health
- **Examples:** Pre-existing conditions, medications
- **Storage:** HIPAA-compliant if applicable
- **Display:** Visible only to user and authorized admins

---

## 🎮 RUNTIME USER EXPERIENCE

### Flow: One Question Per Screen

```
Screen 1: Question 1
┌─────────────────────────────────┐
│  Question 1 of 5                │
├─────────────────────────────────┤
│                                 │
│  What do you do for a living?   │
│                                 │
│  This helps us tailor...        │
│                                 │
│  ⚪ Office worker               │
│  ⚪ Student                     │
│  ⚪ Self-employed               │
│  ⚪ Retired                     │
│  ⚪ Prefer not to answer        │
│                                 │
│  [Skip]       [Continue →]      │
│                                 │
└─────────────────────────────────┘

Screen 2: Question 2
┌─────────────────────────────────┐
│  Question 2 of 5                │
├─────────────────────────────────┤
│                                 │
│  Have you ever taken therapy    │
│  before?                        │
│                                 │
│  ⚪ Yes                         │
│  ⚪ No                          │
│  ⚪ Prefer not to answer        │
│                                 │
│  [← Back]     [Continue →]      │
│                                 │
└─────────────────────────────────┘

Screen 3 (CONDITIONAL - Only if Q2 = "Yes")
┌─────────────────────────────────┐
│  Question 3 of 5                │
├─────────────────────────────────┤
│                                 │
│  If yes, what for?              │
│                                 │
│  ☑ Anxiety                      │
│  ☐ Depression                   │
│  ☑ Sleep issues                 │
│  ☐ Trauma                       │
│  ☐ Other                        │
│                                 │
│  [Skip]       [Continue →]      │
│                                 │
└─────────────────────────────────┘
```

**Rules:**
- ✅ Always show progress indicator (e.g., "Question 2 of 5")
- ✅ Always show "Skip" button (unless required)
- ✅ Always show "Back" button (except on Q1)
- ✅ Never show section headers or multiple questions per screen
- ✅ Conditional questions don't count toward total if not shown

---

## 📦 SLEEP TIGHT ONBOARDING - 5 QUESTIONS

### Q1: Occupation
```json
{
  "id": "q1",
  "order": 0,
  "question": "What do you do for a living?",
  "helper_text": "This helps us tailor sleep strategies to your schedule",
  "type": "single_select",
  "options": [
    "Office worker (9-5)",
    "Shift worker",
    "Student",
    "Self-employed",
    "Retired",
    "Prefer not to answer"
  ],
  "allow_skip": true,
  "allow_prefer_not_to_answer": true,
  "required": false,
  "privacy_level": "general",
  "storage_scope": "equip-only",
  "editable_later": true
}
```

### Q2: Therapy History
```json
{
  "id": "q2",
  "order": 1,
  "question": "Have you ever taken therapy before?",
  "helper_text": "No judgment—this just helps us understand your familiarity with CBT techniques",
  "type": "single_select",
  "options": [
    "Yes",
    "No",
    "Prefer not to answer"
  ],
  "allow_skip": true,
  "allow_prefer_not_to_answer": true,
  "required": false,
  "privacy_level": "sensitive",
  "storage_scope": "equip-only",
  "editable_later": true
}
```

### Q3: Therapy Reason (CONDITIONAL)
```json
{
  "id": "q3",
  "order": 2,
  "question": "If yes, what for?",
  "helper_text": "Select all that apply",
  "type": "multi_select",
  "options": [
    "Anxiety",
    "Depression",
    "Sleep issues",
    "Trauma or PTSD",
    "Relationship issues",
    "Other"
  ],
  "allow_skip": true,
  "allow_prefer_not_to_answer": false,
  "required": false,
  "max_selections": null,
  "conditional": {
    "show_if_question_id": "q2",
    "show_if_answer": "Yes"
  },
  "privacy_level": "sensitive",
  "storage_scope": "equip-only",
  "editable_later": true
}
```

### Q4: Pre-existing Conditions
```json
{
  "id": "q4",
  "order": 3,
  "question": "Do you have any pre-existing conditions you'd like us to be aware of?",
  "helper_text": "This is optional. We only ask so we can provide appropriate support.",
  "type": "single_select",
  "options": [
    "Yes",
    "No",
    "Prefer not to answer"
  ],
  "allow_skip": true,
  "allow_prefer_not_to_answer": true,
  "required": false,
  "privacy_level": "health",
  "storage_scope": "equip-only",
  "editable_later": true
}
```

### Q5: Condition Details (CONDITIONAL)
```json
{
  "id": "q5",
  "order": 4,
  "question": "If yes, what?",
  "helper_text": "You can share as much or as little as you're comfortable with",
  "type": "textarea",
  "placeholder": "e.g., Diagnosed insomnia, chronic pain, etc.",
  "allow_skip": true,
  "allow_prefer_not_to_answer": false,
  "required": false,
  "character_limit": 500,
  "conditional": {
    "show_if_question_id": "q4",
    "show_if_answer": "Yes"
  },
  "privacy_level": "health",
  "storage_scope": "equip-only",
  "editable_later": true
}
```

---

## 🗄️ RUNTIME DATA STORAGE

### Database Table: `user_onboarding_responses`

```sql
CREATE TABLE user_onboarding_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES user_program_enrollments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL, -- Snapshot of question at time of answer
  question_type TEXT NOT NULL,
  
  -- Response
  answer TEXT, -- Single value for single_select/text
  answers JSONB, -- Array for multi_select
  
  -- Metadata
  privacy_level TEXT NOT NULL,
  skipped BOOLEAN DEFAULT false,
  prefer_not_to_answer BOOLEAN DEFAULT false,
  
  -- Timestamps
  answered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(enrollment_id, question_id)
);

CREATE INDEX idx_onboarding_responses ON user_onboarding_responses(enrollment_id);
```

**Example Rows:**
```json
// Q1 Response
{
  "enrollment_id": "uuid-1",
  "question_id": "q1",
  "question_text": "What do you do for a living?",
  "question_type": "single_select",
  "answer": "Office worker (9-5)",
  "answers": null,
  "privacy_level": "general",
  "skipped": false,
  "prefer_not_to_answer": false
}

// Q2 Response
{
  "enrollment_id": "uuid-1",
  "question_id": "q2",
  "question_text": "Have you ever taken therapy before?",
  "question_type": "single_select",
  "answer": "Yes",
  "privacy_level": "sensitive",
  "skipped": false
}

// Q3 Response (Conditional - shown because Q2 = "Yes")
{
  "enrollment_id": "uuid-1",
  "question_id": "q3",
  "question_text": "If yes, what for?",
  "question_type": "multi_select",
  "answer": null,
  "answers": ["Anxiety", "Sleep issues"],
  "privacy_level": "sensitive",
  "skipped": false
}

// Q4 Response (Skipped)
{
  "enrollment_id": "uuid-1",
  "question_id": "q4",
  "question_type": "single_select",
  "privacy_level": "health",
  "skipped": true
}
```

---

## 🧪 CMS TESTING CHECKLIST

### Basic Question Creation
- [ ] Add question
- [ ] Set question text and helper text
- [ ] Select input type
- [ ] Add options (if select type)
- [ ] Toggle required/skip/prefer not to answer
- [ ] Set privacy level and storage scope
- [ ] Save and reload → verify persistence

### Conditional Logic
- [ ] Create Q2 (trigger question)
- [ ] Create Q3 (conditional question)
- [ ] Check "This is a conditional question" for Q3
- [ ] Select Q2 as trigger
- [ ] Set "Yes" as trigger answer
- [ ] Save and reload → verify conditional config

### Question Types
- [ ] Test single_select with options
- [ ] Test multi_select with max selections
- [ ] Test text with character limit
- [ ] Test textarea with placeholder

### Ordering
- [ ] Add 5 questions
- [ ] Reorder them
- [ ] Verify order persists

---

## 🚀 RUNTIME COMPONENTS (TO BUILD)

### 1. `<OnboardingFlow>` - Main container
```tsx
function OnboardingFlow({ enrollmentId, programId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  
  // Load onboarding questions from program
  const questions = useProgramOnboarding(programId);
  
  // Filter visible questions based on conditional logic
  const visibleQuestions = questions.filter(q => {
    if (!q.conditional) return true;
    const triggerAnswer = responses[q.conditional.show_if_question_id];
    return triggerAnswer === q.conditional.show_if_answer;
  });
  
  return (
    <OnboardingQuestion
      question={visibleQuestions[currentIndex]}
      onAnswer={handleAnswer}
      onSkip={handleSkip}
      onBack={handleBack}
      progress={`${currentIndex + 1} of ${visibleQuestions.length}`}
    />
  );
}
```

### 2. `<OnboardingQuestion>` - Individual question screen
```tsx
function OnboardingQuestion({ question, onAnswer, onSkip, onBack, progress }) {
  return (
    <div>
      <ProgressIndicator>{progress}</ProgressIndicator>
      
      <h2>{question.question}</h2>
      {question.helper_text && <p>{question.helper_text}</p>}
      
      {question.type === 'single_select' && (
        <RadioGroup options={question.options} onChange={onAnswer} />
      )}
      
      {question.type === 'multi_select' && (
        <CheckboxGroup options={question.options} onChange={onAnswer} />
      )}
      
      {question.type === 'text' && (
        <Input placeholder={question.placeholder} onChange={onAnswer} />
      )}
      
      {question.type === 'textarea' && (
        <Textarea 
          placeholder={question.placeholder} 
          maxLength={question.character_limit}
          onChange={onAnswer} 
        />
      )}
      
      <div className="actions">
        <Button onClick={onBack}>← Back</Button>
        {question.allow_skip && <Button onClick={onSkip}>Skip</Button>}
        <Button onClick={onAnswer}>Continue →</Button>
      </div>
    </div>
  );
}
```

---

## ✅ SUCCESS CRITERIA

✅ **CMS Capabilities:**
- Questions can be added, edited, deleted
- All 4 input types supported
- Conditional logic configurable
- Privacy levels assignable

✅ **Runtime Behavior:**
- One question per screen
- Conditional questions shown/hidden correctly
- Skip and "Prefer not to answer" work
- Progress indicator accurate

✅ **Data Storage:**
- Responses saved to database
- Privacy levels respected
- Conditional responses linked correctly

---

## 🎉 SUMMARY

**Step 3: Onboarding** is now a fully-featured CMS system with:

✨ **4 Question Types** - Single-select, multi-select, text, textarea  
✨ **Conditional Logic** - IF/THEN question display  
✨ **Privacy Controls** - General, sensitive, health classifications  
✨ **User Options** - Skip, prefer not to answer, required  
✨ **Validation** - Max selections, character limits  
✨ **Sleep Tight Template** - 5 questions ready to use  

**Status:** ✅ **CMS Complete**  
**Next:** Build runtime onboarding flow components 🚀
