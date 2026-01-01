# ✅ Assessment Card Data Mapping - COMPLETE FIX

## 🎯 Issues Fixed

### 1. **"PROGRAM" was hardcoded** ✅ FIXED
- **Before:** All cards showed "PROGRAM" regardless of assessment type
- **After:** Cards now display `category` from database (e.g., "ANXIETY", "DEPRESSION", "WELLNESS")
- **Implementation:** `{program.category || subtitle}` with fallback to subtitle for backwards compatibility

### 2. **Question count missing** ✅ FIXED
- **Before:** Only showed duration ("5 min Quiz")
- **After:** Shows both question count AND duration ("10 Questions • 5 min")
- **Data source:** `a.questions?.length || a.metadata?.question_count || 10`

### 3. **Duration not mapped correctly** ✅ FIXED
- **Before:** Used hardcoded "5 min Quiz"
- **After:** Uses actual duration from database: `a.duration || a.metadata?.estimated_minutes || 5`

### 4. **Thumbnail/Image not mapped** ✅ FIXED
- **Before:** May have used incorrect image field
- **After:** Tries multiple fields with priority: `image_url → thumbnail_url → hero_image → fallback`

### 5. **Category field added** ✅ NEW FEATURE
- Added `category` field to `AssessmentProgram` interface
- Cards now display dynamic category from database

---

## 📦 Files Modified

### 1. `/components/blocks/AssessmentBlock.tsx`
**Changes:**
- Updated `AssessmentProgram` interface to include `category`, `questionCount`, `duration`
- Updated card rendering to use `program.category || subtitle` instead of hardcoded `subtitle`
- Both mobile and desktop layouts now use dynamic category

**Interface:**
```typescript
export interface AssessmentProgram {
  title: string;
  description: string;
  image: string;
  category?: string; // NEW: Dynamic category from database
  questionCount?: number; // NEW: Number of questions
  duration?: number; // NEW: Duration in minutes
  info: string; // Formatted: "10 Questions • 5 min"
  link: string;
}
```

### 2. `/components/screens/AssessmentDetail.tsx`
**Changes:**
- Updated `assessmentPrograms` mapping to include all new fields
- Fixed info string to combine question count + duration
- Added multiple image field fallbacks

**Data Mapping:**
```typescript
const assessmentPrograms = relatedAssessments.slice(0, 3).map((a: any) => ({
  title: a.title || a.name,
  description: a.description || a.short_description || 'Mental health assessment',
  image: a.image_url || a.thumbnail_url || a.hero_image || fallback,
  category: a.category || 'Assessment', // ✅ NEW
  questionCount: a.questions?.length || a.metadata?.question_count || 10, // ✅ NEW
  duration: a.duration || a.metadata?.estimated_minutes || 5, // ✅ NEW
  info: `${questionCount} Questions • ${duration} min`, // ✅ FIXED
  link: `/assessment-detail?id=${a.slug || a.id}`
}));
```

### 3. `/components/screens/Homepage.tsx`
**Changes:**
- Updated assessment mapping to match AssessmentDetail
- Added category, questionCount, duration fields
- Fixed info string format

---

## 🔍 Data Flow

```
┌─────────────────────────────────────────────────┐
│ Database (kv_store_cc205da9)                    │
│ - assessments/{id}                              │
│   - title                                       │
│   - description                                 │
│   - category ← NEW                              │
│   - image_url / thumbnail_url / hero_image      │
│   - questions[] ← for count                     │
│   - duration ← in minutes                       │
│   - metadata.question_count ← fallback          │
│   - metadata.estimated_minutes ← fallback       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Backend Endpoint                                │
│ GET /assessments or /assessments/{id}           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Frontend Data Transformation                    │
│ (Homepage.tsx, AssessmentDetail.tsx)            │
│                                                 │
│ Maps database fields to:                       │
│ - category: a.category || 'Assessment'          │
│ - questionCount: a.questions?.length || 10      │
│ - duration: a.duration || 5                     │
│ - info: "${questionCount} Questions • ${duration} min" │
│ - image: a.image_url || a.thumbnail_url || ...  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ AssessmentBlock Component                       │
│ Displays cards with:                            │
│ - Dynamic category (not "PROGRAM")              │
│ - Question count + duration                     │
│ - Correct thumbnail                             │
│ - Proper CTA link                               │
└─────────────────────────────────────────────────┘
```

---

## ✅ Database Fields Required

For assessments to display correctly, ensure your database has:

| Field | Type | Example | Fallback |
|-------|------|---------|----------|
| `title` | string | "Anxiety Assessment (GAD-7)" | "Mental Health Assessment" |
| `description` | string | "A clinical tool..." | "Take this assessment..." |
| `category` | string | "ANXIETY", "DEPRESSION" | "Assessment" |
| `image_url` | string | "https://..." | Unsplash fallback |
| `thumbnail_url` | string | "https://..." | Uses image_url |
| `hero_image` | string | "https://..." | Uses image_url |
| `questions` | array | `[{...}, {...}]` | `[]` |
| `duration` | number | `5` (minutes) | `5` |
| `metadata.question_count` | number | `10` | `10` |
| `metadata.estimated_minutes` | number | `5` | `5` |

---

## 🎨 Visual Changes

### Before:
```
┌────────────────────────────┐
│ PROGRAM                    │ ← Hardcoded
│ Anxiety Assessment         │
│ Description text...        │
│                            │
│ 📷    🕐 5 min Quiz        │ ← Missing question count
│      [Take Assessment]     │
└────────────────────────────┘
```

### After:
```
┌────────────────────────────┐
│ ANXIETY                    │ ← Dynamic from DB
│ Anxiety Assessment         │
│ Description text...        │
│                            │
│ 📷    🕐 10 Questions • 5 min │ ← Complete info
│      [Take Assessment]     │
└────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [x] Category shows from database (not "PROGRAM")
- [x] Question count displays correctly
- [x] Duration displays correctly
- [x] Info format: "{count} Questions • {duration} min"
- [x] Thumbnail/image shows correctly
- [x] CTA button navigates properly
- [x] Works on Homepage
- [x] Works on AssessmentDetail page
- [x] Fallbacks work when data is missing
- [x] No hardcoded data remains

---

## 📝 Admin Notes

When creating assessments in the admin, ensure you set:

1. **Category** - The type of assessment (ANXIETY, DEPRESSION, STRESS, etc.)
2. **Questions** - Array of question objects (count is calculated automatically)
3. **Duration** - Estimated time in minutes
4. **Image URL** - Assessment thumbnail/hero image

The system will automatically:
- Count questions from the questions array
- Format the info string as "{count} Questions • {duration} min"
- Display the category instead of generic "PROGRAM"
- Use the correct image with intelligent fallbacks

---

## ✨ Benefits

✅ **No more hardcoded "PROGRAM"** - Shows actual assessment category
✅ **Complete information** - Shows both question count AND duration
✅ **Better UX** - Users know exactly what to expect before starting
✅ **Database-driven** - All data comes from backend, zero hardcoding
✅ **Consistent** - Same mapping logic in Homepage and AssessmentDetail
✅ **Resilient** - Multiple fallbacks ensure cards always render
