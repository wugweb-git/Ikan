# Runtime Data Schema - Equip Programs (User Experience Layer)

## 🎯 OVERVIEW

This document defines the **complete data architecture** for the runtime user experience of Equip programs, including:

1. **Daily Entry & Progress Tracking**
2. **Block Completion & Responses**
3. **Progressive Data Handling**
4. **Report Card Metrics**
5. **User Journey State Management**

---

## 📊 DATABASE SCHEMA

### 1. **`equip_programs`** (Admin-Created Content)

Already exists. Stores program metadata and structure.

```sql
CREATE TABLE equip_programs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_weeks INTEGER,
  duration_days INTEGER,
  price_amount INTEGER,
  price_currency TEXT,
  difficulty TEXT,
  
  -- Content Structure
  daily_content JSONB, -- Array of DayContent
  onboarding_questions JSONB, -- Array of OnboardingQuestion
  
  -- Images
  cover_image_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadata
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**DayContent Structure:**
```json
{
  "day": 1,
  "title": "Let's Begin",
  "description": "Awareness & baseline",
  "image_url": "https://...", // Day hero image
  "activities": [
    {
      "id": "d1_b1",
      "title": "Welcome",
      "type": "lesson",
      "content": "...",
      "duration": 5,
      "required": true,
      "order": 0,
      "data_id": "",
      "image_url": "https://...", // Block image
      "exerciseConfig": {
        "subtype": "multi-select",
        "prompt": "...",
        "options": ["..."]
      }
    }
  ]
}
```

---

### 2. **`user_program_enrollments`** (User Journey State)

Tracks which programs a user is enrolled in and their overall progress.

```sql
CREATE TABLE user_program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES equip_programs(id) ON DELETE CASCADE,
  
  -- Enrollment Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'abandoned'
  enrolled_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP, -- When user started Day 1
  completed_at TIMESTAMP, -- When user finished all days
  
  -- Progress Tracking
  current_day INTEGER DEFAULT 0, -- Current unlocked day (0 = onboarding)
  last_accessed_at TIMESTAMP, -- Last time user opened the program
  
  -- Onboarding Responses
  onboarding_responses JSONB, -- { "q1": "answer", "q2": [...] }
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, program_id)
);

CREATE INDEX idx_user_enrollments ON user_program_enrollments(user_id, status);
CREATE INDEX idx_program_enrollments ON user_program_enrollments(program_id, status);
```

**Example Row:**
```json
{
  "id": "uuid-1",
  "user_id": "user-123",
  "program_id": "sleep-tight-uuid",
  "status": "active",
  "enrolled_at": "2025-01-01T10:00:00Z",
  "started_at": "2025-01-01T10:15:00Z",
  "current_day": 4,
  "last_accessed_at": "2025-01-04T20:30:00Z",
  "onboarding_responses": {
    "i01": "John Doe",
    "i02": ["😰 I feel anxious before bed", "🔄 My mind races"]
  }
}
```

---

### 3. **`user_day_progress`** (Day-Level Tracking)

Tracks completion status for each day.

```sql
CREATE TABLE user_day_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES user_program_enrollments(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'locked', -- 'locked', 'unlocked', 'in_progress', 'completed'
  unlocked_at TIMESTAMP, -- When day became accessible
  started_at TIMESTAMP, -- When user opened the day
  completed_at TIMESTAMP, -- When all required blocks done
  
  -- Progress
  total_blocks INTEGER NOT NULL, -- Total blocks in this day
  required_blocks INTEGER NOT NULL, -- Required blocks count
  completed_blocks INTEGER DEFAULT 0, -- Blocks user has completed
  
  -- Time Tracking
  estimated_time_minutes INTEGER, -- Admin-set estimate
  actual_time_minutes INTEGER DEFAULT 0, -- Time user actually spent
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(enrollment_id, day_number)
);

CREATE INDEX idx_day_progress ON user_day_progress(enrollment_id, day_number);
```

**Example Row:**
```json
{
  "id": "uuid-2",
  "enrollment_id": "uuid-1",
  "program_id": "sleep-tight-uuid",
  "day_number": 4,
  "status": "completed",
  "unlocked_at": "2025-01-04T00:00:00Z",
  "started_at": "2025-01-04T20:00:00Z",
  "completed_at": "2025-01-04T20:28:00Z",
  "total_blocks": 4,
  "required_blocks": 3,
  "completed_blocks": 4,
  "estimated_time_minutes": 30,
  "actual_time_minutes": 28
}
```

---

### 4. **`user_block_completions`** (Block-Level Tracking)

Tracks completion of individual blocks within a day.

```sql
CREATE TABLE user_block_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES user_program_enrollments(id) ON DELETE CASCADE,
  day_progress_id UUID NOT NULL REFERENCES user_day_progress(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  block_id TEXT NOT NULL, -- Matches activity.id from daily_content
  
  -- Block Metadata (denormalized for quick access)
  block_type TEXT NOT NULL, -- 'lesson', 'exercise', 'journal', etc.
  block_order INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL,
  
  -- Completion Status
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'skipped'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Response Data (if applicable)
  has_response BOOLEAN DEFAULT false, -- True if user provided input
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(enrollment_id, day_number, block_id)
);

CREATE INDEX idx_block_completions ON user_block_completions(enrollment_id, day_number);
CREATE INDEX idx_block_status ON user_block_completions(enrollment_id, status);
```

**Example Row:**
```json
{
  "id": "uuid-3",
  "enrollment_id": "uuid-1",
  "day_progress_id": "uuid-2",
  "program_id": "sleep-tight-uuid",
  "day_number": 4,
  "block_id": "d4_b3",
  "block_type": "exercise",
  "block_order": 2,
  "is_required": true,
  "status": "completed",
  "started_at": "2025-01-04T20:15:00Z",
  "completed_at": "2025-01-04T20:25:00Z",
  "time_spent_seconds": 600,
  "has_response": true
}
```

---

### 5. **`user_exercise_responses`** (Exercise Data Storage)

Stores user responses to exercises, linked to data IDs for progressive exercises.

```sql
CREATE TABLE user_exercise_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES user_program_enrollments(id) ON DELETE CASCADE,
  block_completion_id UUID NOT NULL REFERENCES user_block_completions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  block_id TEXT NOT NULL,
  
  -- Data ID Mapping (for progressive exercises)
  data_id TEXT, -- e.g., "i04", "i07", can include "+" for progressive
  base_data_id TEXT, -- e.g., "i04" (without +)
  
  -- Response Content
  response_type TEXT NOT NULL, -- 'multi-select', 'single-select', 'mcq', 'table', 'journal', 'list'
  response_data JSONB NOT NULL, -- Structured response data
  
  -- Validation (for MCQs)
  is_correct BOOLEAN, -- NULL if not applicable
  
  -- Metadata
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Auto-delete (for ephemeral journals)
  auto_delete_at TIMESTAMP, -- When to delete this response
  
  UNIQUE(enrollment_id, day_number, block_id)
);

CREATE INDEX idx_exercise_responses ON user_exercise_responses(enrollment_id, base_data_id);
CREATE INDEX idx_auto_delete ON user_exercise_responses(auto_delete_at) WHERE auto_delete_at IS NOT NULL;
```

**Response Data Structures by Type:**

#### Multi-Select
```json
{
  "response_type": "multi-select",
  "response_data": {
    "selected": [
      "😰 I feel anxious before bed",
      "🔄 My mind races with thoughts"
    ]
  }
}
```

#### Single-Select
```json
{
  "response_type": "single-select",
  "response_data": {
    "selected": "Option A"
  }
}
```

#### MCQ
```json
{
  "response_type": "mcq",
  "response_data": {
    "selected": "All of the above",
    "is_correct": true
  },
  "is_correct": true
}
```

#### Structured Table
```json
{
  "response_type": "table",
  "response_data": {
    "rows": [
      {
        "id": "row_1",
        "col_time": "11:30 PM",
        "col_situation": "Lying in bed",
        "col_thoughts": "I won't sleep",
        "col_feelings": "Anxious",
        "col_response": "Scrolled phone",
        "col_sleep_impact": true
      }
    ],
    "columns": ["col_time", "col_situation", "col_thoughts", "col_feelings", "col_response", "col_sleep_impact"]
  }
}
```

#### Ephemeral Journal
```json
{
  "response_type": "journal",
  "response_data": {
    "content": "Today was challenging. I...",
    "word_count": 247,
    "date": "2025-01-04"
  },
  "auto_delete_at": "2025-01-06T20:25:00Z"
}
```

#### Structured List
```json
{
  "response_type": "list",
  "response_data": {
    "items": [
      { "text": "Room temperature: 60-67°F", "checked": true },
      { "text": "Bedroom is dark", "checked": true },
      { "text": "No caffeine after 2 PM", "checked": false }
    ]
  }
}
```

---

### 6. **`user_habit_tracking`** (Daily Checklist Data)

For checklist-type blocks that track habits over time.

```sql
CREATE TABLE user_habit_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES user_program_enrollments(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  habit_name TEXT NOT NULL,
  
  -- Date Tracking
  tracking_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(enrollment_id, habit_name, tracking_date)
);

CREATE INDEX idx_habit_tracking ON user_habit_tracking(enrollment_id, tracking_date);
```

---

## 🔄 PROGRESSIVE DATA HANDLING

### How Progressive Exercises Work

**Day 2: Create Base Table (i04)**
```json
// Block: d2_b3
// Data ID: i04
{
  "exerciseConfig": {
    "subtype": "table",
    "tableColumns": [
      { "id": "col_time", "label": "Time", "type": "text" },
      { "id": "col_situation", "label": "Situation", "type": "text" }
    ]
  }
}

// User Response
{
  "base_data_id": "i04",
  "response_data": {
    "rows": [
      { "id": "row_1", "col_time": "11:30 PM", "col_situation": "In bed" }
    ]
  }
}
```

**Day 3: Continue Table (i04+)**
```json
// Block: d3_b1
// Data ID: i04+
// Progressive: true

// System loads previous i04 data
// Adds new column
{
  "exerciseConfig": {
    "progressive": true,
    "tableColumns": [
      { "id": "col_time", "label": "Time", "type": "text" },
      { "id": "col_situation", "label": "Situation", "type": "text" },
      { "id": "col_sleep_impact", "label": "Affect sleep?", "type": "boolean" } // NEW
    ]
  }
}

// User edits and adds to previous data
{
  "base_data_id": "i04",
  "response_data": {
    "rows": [
      { 
        "id": "row_1", 
        "col_time": "11:30 PM", 
        "col_situation": "In bed",
        "col_sleep_impact": true // NEW COLUMN
      },
      { 
        "id": "row_2", 
        "col_time": "12:00 AM", 
        "col_situation": "Still awake",
        "col_sleep_impact": true
      }
    ]
  }
}
```

**Backend Logic:**
```typescript
function loadProgressiveExerciseData(enrollmentId: string, dataId: string) {
  // Extract base ID: "i04+" → "i04"
  const baseDataId = dataId.replace(/\+/g, '');
  
  // Load most recent response with this base_data_id
  const previousResponse = await db.query(
    'SELECT response_data FROM user_exercise_responses WHERE enrollment_id = $1 AND base_data_id = $2 ORDER BY submitted_at DESC LIMIT 1',
    [enrollmentId, baseDataId]
  );
  
  return previousResponse?.response_data || { rows: [] };
}
```

---

## 🎮 RUNTIME USER FLOW

### Daily Entry Point

**User Home → Today's Card**
```
┌─────────────────────────────────┐
│  Today — Day 4                  │
│  Journaling                     │
│  ⏱ 30 min                       │
│                                 │
│  [Start / Continue]             │
└─────────────────────────────────┘
```

**Query:**
```sql
-- Get current day info
SELECT 
  dp.day_number,
  dc.title,
  dc.description,
  dc.image_url,
  dp.status,
  dp.estimated_time_minutes,
  dp.completed_blocks,
  dp.required_blocks
FROM user_day_progress dp
JOIN equip_programs ep ON dp.program_id = ep.id
WHERE dp.enrollment_id = $1 
  AND dp.status IN ('unlocked', 'in_progress')
ORDER BY dp.day_number ASC
LIMIT 1;
```

---

### In-Day Experience

**Day 4 Page Structure:**
```
┌───────────────────────────────────────┐
│  Day 4 Header                         │
│  Hero Image (day.image_url)           │
│  "Journaling"                         │
│  Progress: 2/3 blocks                 │
├───────────────────────────────────────┤
│                                       │
│  Block 1: Lesson                      │
│  📚 "Thought Dump & Journaling"       │
│  [Content...]                         │
│  ✓ Completed                          │
│                                       │
├───────────────────────────────────────┤
│                                       │
│  Block 2: Exercise (MCQ)              │
│  ✏️ "What Makes a Good Entry?"        │
│  [ ] Option A                         │
│  [ ] Option B                         │
│  [Submit]                             │
│                                       │
├───────────────────────────────────────┤
│                                       │
│  Block 3: Ephemeral Journal           │
│  📝 "Your Free Write"                 │
│  [Locked - Complete Block 2 first]   │
│                                       │
├───────────────────────────────────────┤
│                                       │
│  Block 4: Conclude                    │
│  🎯 "Well done..."                    │
│                                       │
└───────────────────────────────────────┘
```

**Block Progression Rules:**
```typescript
function canAccessBlock(blockOrder: number, completions: BlockCompletion[]) {
  // Required blocks must be completed in order
  const previousRequiredBlocks = completions.filter(
    bc => bc.block_order < blockOrder && bc.is_required
  );
  
  return previousRequiredBlocks.every(bc => bc.status === 'completed');
}
```

**Day Completion Logic:**
```typescript
function isDayComplete(dayProgress: DayProgress, blockCompletions: BlockCompletion[]) {
  const requiredCompletions = blockCompletions.filter(bc => bc.is_required);
  const completed = requiredCompletions.filter(bc => bc.status === 'completed');
  
  return completed.length === dayProgress.required_blocks;
}

// When day completes
async function completeDayAndUnlockNext(enrollmentId: string, currentDay: number) {
  // 1. Mark current day as completed
  await db.query(
    'UPDATE user_day_progress SET status = $1, completed_at = NOW() WHERE enrollment_id = $2 AND day_number = $3',
    ['completed', enrollmentId, currentDay]
  );
  
  // 2. Unlock next day
  const nextDay = currentDay + 1;
  await db.query(
    'UPDATE user_day_progress SET status = $1, unlocked_at = NOW() WHERE enrollment_id = $2 AND day_number = $3',
    ['unlocked', enrollmentId, nextDay]
  );
  
  // 3. Update enrollment current_day
  await db.query(
    'UPDATE user_program_enrollments SET current_day = $1, updated_at = NOW() WHERE id = $2',
    [nextDay, enrollmentId]
  );
  
  // 4. Show affirmation
  return {
    message: "Great work today! Come back tomorrow for Day " + nextDay,
    nextDayUnlocked: true
  };
}
```

---

## 📊 REPORT CARD METRICS (CBT-SAFE)

### Data Input Sources

| Source | Data Type | Storage |
|--------|-----------|---------|
| Block completion | Boolean | `user_block_completions.status` |
| Habit checklist | Boolean | `user_habit_tracking.completed` |
| Journal presence | Boolean | `user_exercise_responses.has_response` |
| Mood check-ins | Scale (1-10) | `user_exercise_responses.response_data` |
| Sleep impact flags | Yes/No | Table columns in responses |

---

### Core Metrics

#### 1. **Consistency Score**
```sql
-- Completed Days / Total Days
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / 
  COUNT(*) AS consistency_percentage
FROM user_day_progress
WHERE enrollment_id = $1;
```

**Display:**
```
Consistency Score: 78%
(7 out of 9 days completed)
```

---

#### 2. **Habit Adherence**
```sql
-- Completed habits per day (rolling 7-day average)
SELECT 
  AVG(daily_completion_rate) AS habit_adherence_7day
FROM (
  SELECT 
    tracking_date,
    COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*) AS daily_completion_rate
  FROM user_habit_tracking
  WHERE enrollment_id = $1
    AND tracking_date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY tracking_date
) daily_rates;
```

**Display:**
```
Habit Adherence (7-day avg): 82%
Sleep hygiene checklist completion
```

---

#### 3. **Cognitive Awareness Index**
```sql
-- Days with completed thought tracking (data_id: i04, i04+, i06, i07, etc.)
SELECT 
  COUNT(DISTINCT day_number) AS thought_tracking_days
FROM user_exercise_responses
WHERE enrollment_id = $1
  AND base_data_id IN ('i04', 'i06', 'i07')
  AND response_data IS NOT NULL;
```

**Display:**
```
Cognitive Awareness: 6 days
You've actively tracked your thought patterns
```

---

#### 4. **Sleep Hygiene Adoption**
```sql
-- % of nights with rituals followed (from Day 9+ data)
SELECT 
  COUNT(*) FILTER (WHERE completed = true) * 100.0 / 
  COUNT(*) AS ritual_adherence
FROM user_habit_tracking
WHERE enrollment_id = $1
  AND habit_name LIKE '%bedtime ritual%'
  AND tracking_date >= (
    SELECT completed_at::date FROM user_day_progress 
    WHERE enrollment_id = $1 AND day_number = 9
  );
```

**Display:**
```
Sleep Hygiene Adoption: 65%
(13 out of 20 nights with bedtime ritual)
```

---

#### 5. **Engagement Score**
```sql
-- Active participation days (NOT streaks)
SELECT 
  COUNT(DISTINCT DATE(updated_at)) AS active_days
FROM user_block_completions
WHERE enrollment_id = $1
  AND status IN ('in_progress', 'completed')
  AND updated_at >= (
    SELECT started_at FROM user_program_enrollments WHERE id = $1
  );
```

**Display:**
```
Engagement: 14 active days
You've logged in and participated
```

---

### Combined Report Card

```
┌─────────────────────────────────────────┐
│  Your Sleep Tight Report Card          │
├─────────────────────────────────────────┤
│                                         │
│  📅 Consistency Score        78%       │
│     7 out of 9 days completed          │
│                                         │
│  ✅ Habit Adherence (7-day)  82%       │
│     Sleep hygiene checklist            │
│                                         │
│  🧠 Cognitive Awareness      6 days    │
│     Active thought tracking            │
│                                         │
│  🌙 Sleep Hygiene Adoption   65%       │
│     13/20 nights with ritual           │
│                                         │
│  🎯 Engagement               14 days   │
│     Active participation               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 IMPORTANT CBT-SAFE PRINCIPLES

### ✅ SAFE TO TRACK
- Block completion (boolean)
- Habit adherence (% of checklist items done)
- Days with active participation
- Presence of journal entries (not content)
- Sleep hygiene checklist completion

### ❌ NEVER TRACK (CBT-UNSAFE)
- ❌ **Streaks** - Creates pressure and guilt
- ❌ **Mood trends** - Oversimplifies complex emotions
- ❌ **"Good" vs "Bad" days** - Judgmental framing
- ❌ **Journal content analysis** - Violates privacy
- ❌ **Comparisons to other users** - Harmful social pressure
- ❌ **Perfection metrics** - "100% completion" goals

### 🎯 GENTLE LANGUAGE
- ✅ "You've completed 7 days" (not "You missed 2 days")
- ✅ "Active participation" (not "Daily streak")
- ✅ "Sleep hygiene adoption" (not "Sleep score")
- ✅ "Cognitive awareness index" (not "Mental health rating")

---

## 🚀 IMPLEMENTATION CHECKLIST

### Backend Setup
- [ ] Create database tables (6 tables)
- [ ] Set up triggers for auto-unlock next day
- [ ] Implement progressive data loading logic
- [ ] Create auto-delete cron job for ephemeral journals
- [ ] Build report card calculation functions

### API Endpoints
- [ ] `POST /api/enroll` - Enroll in program
- [ ] `GET /api/programs/:id/current-day` - Get today's day
- [ ] `GET /api/programs/:id/day/:dayNum` - Get specific day
- [ ] `POST /api/day/:dayNum/block/:blockId/complete` - Mark block done
- [ ] `POST /api/day/:dayNum/block/:blockId/response` - Submit exercise response
- [ ] `GET /api/programs/:id/report-card` - Get metrics
- [ ] `GET /api/programs/:id/progress` - Get overall progress

### Runtime Components (User-Facing)
- [ ] `<TodayCard>` - Home screen entry point
- [ ] `<DayView>` - Day header + block list
- [ ] `<BlockRenderer>` - Dynamic block component
- [ ] `<MultiSelectExercise>` - Multi-select UI
- [ ] `<MCQExercise>` - Quiz UI with validation
- [ ] `<StructuredTable>` - Table editor
- [ ] `<EphemeralJournal>` - Journal with auto-delete notice
- [ ] `<StructuredList>` - Checklist UI
- [ ] `<DayCompletionModal>` - "Come back tomorrow"
- [ ] `<ReportCard>` - Metrics display

---

## 📝 SUMMARY

✅ **Database schema designed** for complete user journey  
✅ **Progressive data handling** with base_data_id logic  
✅ **Block-level completion tracking** with time spent  
✅ **CBT-safe metrics** (no streaks, no mood trends)  
✅ **Auto-unlock next day** when current day complete  
✅ **Ephemeral journal auto-delete** after X hours  
✅ **Report card calculations** with gentle language  

**Status:** ✅ **Data Schema Complete** - Ready for Backend Implementation  
**Next:** Build API endpoints and runtime components 🚀
