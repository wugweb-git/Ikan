# EquipDetail Page ↔ Admin Panel Mapping

## 🎯 OVERVIEW

This document maps the **user-facing EquipDetail landing page** to the **Admin CMS (Step 2: Equip Details)**.

**Files:**
- **User Page:** `/components/screens/EquipDetail.tsx`
- **Admin CMS:** `/components/screens/EquipProgramEditPageWizard.tsx` (Step 2, `currentStep === 1`)

---

## 📊 COMPLETE MAPPING TABLE

| # | User-Facing Section | EquipDetail Component | Admin Field (Step 2) | Field Type | Notes |
|---|---------------------|----------------------|---------------------|------------|-------|
| **1** | **HERO SECTION** | `<EquipHero>` | | | |
| 1.1 | Hero Title | `title` prop | `hero_title` | Input | Falls back to `title` from Step 1 |
| 1.2 | Hero Description | `description` prop | `hero_subtitle` | Textarea | Falls back to `description` from Step 1 |
| 1.3 | Hero Background Image | `backgroundImage` prop | `hero_image` | Input (URL) | Falls back to `cover_image` from Step 1 |
| 1.4 | CTA Button Text | `buttonText` prop | `cta_button_text` | Input | Hardcoded fallback: "Start Program" |
| 1.5 | CTA Button Link | `buttonLink` prop | `cta_button_link` | Input | Fallback: `/equip-program-onboarding?id={equipId}` |
| **2** | **WHY SECTION** | `<ContextBlock>` | | | |
| 2.1 | Section Title | `title` prop | `why_title` | Input | Falls back to "About This Program" |
| 2.2 | Section Content | `content` prop | `why_content` | Textarea | Main explanation text |
| 2.3 | Section Image | `image` prop | `about_image` | Input (URL) | Falls back to thumbnail |
| 2.4 | Video Caption | `videoCaption` prop | `video_caption` | Input | Optional - shows play button if set |
| **3** | **WHAT SECTION** | `<InfoBlock>` | | | |
| 3.1 | Main Title | `mainTitle` prop | `what_title` | Input | "What You'll Experience" |
| 3.2 | Main Content | `mainContent` prop | `what_content` | Textarea | Converted to array (split by `\n`) |
| 3.3 | Highlights Title | `highlightsTitle` prop | `benefits_title` | Input | "Program Benefits" |
| 3.4 | Highlights | `highlights` prop | `benefits_list` | Textarea (array) | Shown with ✓ CheckCircle icons |
| 3.5 | Notes Title | `notesTitle` prop | `remember_title` | Input | "Important Information" |
| 3.6 | Notes | `notes` prop | `remember_points` | Textarea (array) | Shown with ⚠️ AlertCircle icons |
| **4** | **RELATED PROGRAMS** | `<EquipBlock>` | N/A (Auto-fetched) | | |
| 4.1 | Block Title | Hardcoded | N/A | N/A | "More Equip Programs" |
| 4.2 | Footer Text | Hardcoded | N/A | N/A | "Explore other programs..." |
| 4.3 | Programs List | Fetched from API | N/A | N/A | Auto-fetched via `/equip/programs?limit=3` |
| **5** | **RESOURCES** | `<ResourceBlock>` | N/A (Auto-fetched) | | |
| 5.1 | Resources | Auto-fetched | N/A | N/A | From `/resources?limit=3` |
| **6** | **NEWSLETTER** | `<NewsletterBlock>` | N/A (Hardcoded) | | |
| 6.1 | Newsletter CTA | Hardcoded component | N/A | N/A | Standard newsletter signup |

---

## 🗺️ VISUAL MAPPING

### USER PAGE STRUCTURE

```
┌────────────────────────────────────────────────────┐
│  1. HERO SECTION (EquipHero)                       │
│  ================================================   │
│                                                    │
│  [Background Image] ← hero_image                  │
│                                                    │
│  Hero Title ← hero_title (or title)               │
│  Hero Description ← hero_subtitle (or desc)       │
│                                                    │
│  [CTA Button] ← cta_button_text / link            │
│                                                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  2. WHY SECTION (ContextBlock)                     │
│  ================================================   │
│                                                    │
│  [Image] ← about_image         Section Title      │
│                                ← why_title         │
│                                                    │
│                                Content Paragraph   │
│                                ← why_content       │
│                                                    │
│                                [Optional Video]    │
│                                ← video_caption     │
│                                                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  3. WHAT SECTION (InfoBlock)                       │
│  ================================================   │
│                                                    │
│  Main Title ← what_title                          │
│  ─────────────────────────────────────────────     │
│  Content Paragraphs ← what_content (array)        │
│                                                    │
│  Highlights Title ← benefits_title                │
│  ─────────────────────────────────────────────     │
│  ✓ Benefit 1 ←┐                                   │
│  ✓ Benefit 2  │ benefits_list (array)             │
│  ✓ Benefit 3 ←┘                                   │
│                                                    │
│  Notes Title ← remember_title                     │
│  ─────────────────────────────────────────────     │
│  ⚠️ Note 1 ←┐                                     │
│  ⚠️ Note 2  │ remember_points (array)             │
│  ⚠️ Note 3 ←┘                                     │
│                                                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  4. RELATED PROGRAMS (EquipBlock)                  │
│  ================================================   │
│  Auto-fetched from backend                         │
│  Shows 3 related equip programs                    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  5. RESOURCES (ResourceBlock)                      │
│  ================================================   │
│  Auto-fetched from backend                         │
│  Shows 3 latest resources                          │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  6. NEWSLETTER (NewsletterBlock)                   │
│  ================================================   │
│  Hardcoded newsletter signup component             │
└────────────────────────────────────────────────────┘
```

---

## 🎨 ADMIN CMS STRUCTURE (Step 2)

### Current Admin Panel Layout

```
Step 2: Equip Details (Landing Page)
─────────────────────────────────────

┌─ Overview Section ────────────────────────────┐
│  Overview Title                               │
│  Overview Description                         │
│  Benefits (one per line)                      │
│  What You'll Learn (one per line)             │
└───────────────────────────────────────────────┘

┌─ 🎯 Hero Section ─────────────────────────────┐
│  (Blue panel - #F9FAFB)                       │
│                                               │
│  Hero Title                                   │
│  Hero Subtitle                                │
│  Hero Image URL                               │
└───────────────────────────────────────────────┘

┌─ ❓ What Section ─────────────────────────────┐
│  (Green panel - #F0FDF4)                      │
│                                               │
│  Section Title                                │
│  Content (textarea)                           │
└───────────────────────────────────────────────┘

┌─ 💡 Why Section ──────────────────────────────┐
│  (Yellow panel - #FEF3C7)                     │
│                                               │
│  Section Title                                │
│  Content (textarea)                           │
│  Key Reasons (one per line)                   │
└───────────────────────────────────────────────┘

┌─ ✨ Benefits Section ─────────────────────────┐
│  (Purple panel - #EDE9FE)                     │
│                                               │
│  Section Title                                │
│  Benefits List (one per line)                 │
└───────────────────────────────────────────────┘

┌─ ⚠️ Things to Remember ───────────────────────┐
│  (Red panel - #FEE2E2)                        │
│                                               │
│  Section Title                                │
│  Important Points (one per line)              │
└───────────────────────────────────────────────┘

┌─ Program Details ─────────────────────────────┐
│  Time Commitment                              │
│  Access Period                                │
│  Total Modules                                │
│  Total Exercises                              │
│  Total Assessments                            │
└───────────────────────────────────────────────┘

┌─ Instructor Information ──────────────────────┐
│  Name                                         │
│  Credentials                                  │
│  Bio                                          │
│  Photo URL                                    │
└───────────────────────────────────────────────┘

┌─ FAQ Section ─────────────────────────────────┐
│  [Add FAQ Item]                               │
│  Q1: Question / Answer                        │
│  Q2: Question / Answer                        │
└───────────────────────────────────────────────┘
```

---

## ❌ GAPS & MISSING MAPPINGS

### 🔴 CRITICAL GAPS

| Admin Field | Used in User Page? | Notes |
|-------------|-------------------|-------|
| `overview_title` | ❌ NOT USED | Orphaned field |
| `overview_description` | ❌ NOT USED | Orphaned field |
| `overview_benefits` | ❌ NOT USED | Orphaned field (use `benefits_list` instead) |
| `what_youll_learn` | ❌ NOT USED | Orphaned field |
| `why_points` | ❌ NOT USED | Orphaned field (key reasons) |
| `time_commitment` | ❌ NOT USED | Not displayed anywhere |
| `access_period` | ❌ NOT USED | Not displayed anywhere |
| `total_modules` | ❌ NOT USED | Not displayed anywhere |
| `total_exercises` | ❌ NOT USED | Not displayed anywhere |
| `total_assessments` | ❌ NOT USED | Not displayed anywhere |
| `instructor_name` | ❌ NOT USED | Not displayed anywhere |
| `instructor_credentials` | ❌ NOT USED | Not displayed anywhere |
| `instructor_bio` | ❌ NOT USED | Not displayed anywhere |
| `instructor_photo` | ❌ NOT USED | Not displayed anywhere |
| `faq` | ❌ NOT USED | Not displayed anywhere |

### 🟡 INCORRECT MAPPINGS

| User Page Field | Currently Pulls From | Should Pull From | Fix Needed |
|----------------|---------------------|------------------|------------|
| `why_content` | `about_content` | `why_content` | ✅ Already correct |
| `what_content` | Hardcoded array | `what_content` (parsed) | ⚠️ Needs update |
| `highlights` | Hardcoded | `benefits_list` | ✅ Already mapped |
| `notes` | Hardcoded | `remember_points` | ✅ Already mapped |

### 🟢 MISSING USER PAGE SECTIONS

| Admin Data | User Page Component | Status |
|------------|-------------------|--------|
| `why_points` (bullet list) | Should be in `<ContextBlock>` | ❌ NOT RENDERED |
| `faq` | Should have `<FAQBlock>` | ❌ NOT RENDERED |
| `instructor_*` | Should have `<InstructorBlock>` | ❌ NOT RENDERED |
| `time_commitment`, etc. | Should be in `<ProgramDetailsBlock>` | ❌ NOT RENDERED |

---

## 🔧 DATA TRANSFORMATION LOGIC

### Current Backend Response → EquipDetail Transformation

```typescript
// In EquipDetail.tsx (lines 189-232)
const transformedData = {
  // Hero
  title: data.title || data.name,
  description: data.description || data.summary,
  hero_image: data.hero_image || data.thumbnail,
  cta_button_text: data.cta_button_text || "Start Program",
  cta_button_link: data.cta_button_link || `/equip-program-onboarding?id=${equipId}`,
  
  // Why (About)
  about_title: data.about_title || "Why This Program?",
  about_content: data.about_content || data.long_description,
  about_image: data.about_image || data.thumbnail,
  video_caption: data.video_caption,
  
  // What (Main)
  main_title: data.main_title || "What You'll Experience",
  main_content: data.main_content || [
    `This program takes approximately ${data.duration_days || 18} days...`,
    "Daily guided exercises...",
    "Track your progress..."
  ],
  
  // Highlights (Benefits)
  highlights_title: data.highlights_title || "Program Benefits",
  highlights: data.highlights || [
    "Evidence-based techniques...",
    "Self-paced learning...",
    "Personalized insights..."
  ],
  
  // Notes (Remember)
  notes_title: data.notes_title || "Important Information",
  notes: data.notes || [
    "This program is designed to complement...",
    "If you are experiencing a mental health crisis..."
  ]
};
```

**Issues:**
- ❌ Hardcoded fallbacks instead of using admin fields
- ❌ No mapping for `why_points`, `faq`, `instructor_*`, etc.
- ❌ `what_content` not using actual admin field

---

## ✅ RECOMMENDED FIXES

### 1. **Map `what_content` Correctly**

**Current (Hardcoded):**
```typescript
main_content: data.main_content || [
  "This program takes approximately...",
  "Daily guided exercises...",
  "Track your progress..."
]
```

**Should Be:**
```typescript
main_content: data.what_content 
  ? data.what_content.split('\n').filter(p => p.trim() !== '')
  : [`This program takes approximately ${data.duration_days || 18} days...`]
```

### 2. **Add `why_points` to ContextBlock**

**Update ContextBlock interface:**
```typescript
interface ContextBlockProps {
  title: string;
  content: string;
  image?: string;
  imageAlt?: string;
  videoCaption?: string;
  showPlayButton?: boolean;
  onVideoClick?: () => void;
  keyPoints?: string[]; // ← ADD THIS
}
```

**Render in ContextBlock:**
```tsx
{keyPoints && keyPoints.length > 0 && (
  <ul className="mt-6 space-y-3">
    {keyPoints.map((point, idx) => (
      <li key={idx} className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
        <span>{point}</span>
      </li>
    ))}
  </ul>
)}
```

**Pass from EquipDetail:**
```tsx
<ContextBlock
  title={equipData.why_title}
  content={equipData.why_content}
  image={equipData.about_image}
  keyPoints={equipData.why_points} // ← ADD THIS
/>
```

### 3. **Add FAQ Section**

**Create `<FAQBlock>` component:**
```tsx
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  items: FAQItem[];
}

export function FAQBlock({ items }: FAQBlockProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-medium mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {items.map((faq, idx) => (
            <Accordion key={idx}>
              <AccordionItem>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Use in EquipDetail:**
```tsx
{equipData.faq && equipData.faq.length > 0 && (
  <FAQBlock items={equipData.faq} />
)}
```

### 4. **Add Instructor Section**

**Create `<InstructorBlock>` component:**
```tsx
interface InstructorBlockProps {
  name: string;
  credentials: string;
  bio: string;
  photo?: string;
}

export function InstructorBlock({ name, credentials, bio, photo }: InstructorBlockProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-medium mb-8 text-center">
          Meet Your Instructor
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {photo && (
            <img 
              src={photo} 
              alt={name}
              className="w-48 h-48 rounded-full object-cover"
            />
          )}
          
          <div className="flex-1">
            <h3 className="text-2xl font-medium">{name}</h3>
            <p className="text-gray-600 mb-4">{credentials}</p>
            <p className="text-gray-700">{bio}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Use in EquipDetail:**
```tsx
{equipData.instructor_name && (
  <InstructorBlock
    name={equipData.instructor_name}
    credentials={equipData.instructor_credentials || ''}
    bio={equipData.instructor_bio || ''}
    photo={equipData.instructor_photo}
  />
)}
```

### 5. **Add Program Details Stats**

**Create inline stats section in InfoBlock or separate component:**
```tsx
{(equipData.time_commitment || equipData.total_modules) && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
    {equipData.time_commitment && (
      <StatCard 
        icon={<Calendar />} 
        label="Time Commitment" 
        value={equipData.time_commitment} 
      />
    )}
    {equipData.total_modules && (
      <StatCard 
        icon={<Users />} 
        label="Modules" 
        value={equipData.total_modules} 
      />
    )}
    {equipData.total_exercises && (
      <StatCard 
        icon={<CheckCircle2 />} 
        label="Exercises" 
        value={equipData.total_exercises} 
      />
    )}
    {equipData.access_period && (
      <StatCard 
        icon={<Calendar />} 
        label="Access" 
        value={equipData.access_period} 
      />
    )}
  </div>
)}
```

---

## 📋 COMPLETE UPDATED MAPPING

### After Implementing Fixes

| Admin Field | User Component | Status |
|------------|---------------|--------|
| `hero_title` | ✅ `<EquipHero>` title | MAPPED |
| `hero_subtitle` | ✅ `<EquipHero>` description | MAPPED |
| `hero_image` | ✅ `<EquipHero>` backgroundImage | MAPPED |
| `cta_button_text` | ✅ `<EquipHero>` buttonText | MAPPED |
| `cta_button_link` | ✅ `<EquipHero>` buttonLink | MAPPED |
| `why_title` | ✅ `<ContextBlock>` title | MAPPED |
| `why_content` | ✅ `<ContextBlock>` content | MAPPED |
| `why_points` | ✅ `<ContextBlock>` keyPoints | FIXED |
| `about_image` | ✅ `<ContextBlock>` image | MAPPED |
| `video_caption` | ✅ `<ContextBlock>` videoCaption | MAPPED |
| `what_title` | ✅ `<InfoBlock>` mainTitle | MAPPED |
| `what_content` | ✅ `<InfoBlock>` mainContent | FIXED |
| `benefits_title` | ✅ `<InfoBlock>` highlightsTitle | MAPPED |
| `benefits_list` | ✅ `<InfoBlock>` highlights | MAPPED |
| `remember_title` | ✅ `<InfoBlock>` notesTitle | MAPPED |
| `remember_points` | ✅ `<InfoBlock>` notes | MAPPED |
| `time_commitment` | ✅ `<StatCard>` | ADDED |
| `total_modules` | ✅ `<StatCard>` | ADDED |
| `total_exercises` | ✅ `<StatCard>` | ADDED |
| `access_period` | ✅ `<StatCard>` | ADDED |
| `instructor_name` | ✅ `<InstructorBlock>` | ADDED |
| `instructor_credentials` | ✅ `<InstructorBlock>` | ADDED |
| `instructor_bio` | ✅ `<InstructorBlock>` | ADDED |
| `instructor_photo` | ✅ `<InstructorBlock>` | ADDED |
| `faq` | ✅ `<FAQBlock>` | ADDED |

---

## 🎯 FINAL UPDATED USER PAGE STRUCTURE

```
1. ✅ Hero (EquipHero)
2. ✅ Why Section (ContextBlock) with key points
3. ✅ What Section (InfoBlock) with benefits & notes
4. ✅ Program Details Stats (StatCards) ← NEW
5. ✅ Instructor (InstructorBlock) ← NEW
6. ✅ FAQ (FAQBlock) ← NEW
7. ✅ Related Programs (EquipBlock)
8. ✅ Resources (ResourceBlock)
9. ✅ Newsletter (NewsletterBlock)
```

---

## ✅ SUCCESS CRITERIA

✅ **All admin fields mapped** to user page  
✅ **No orphaned fields** in admin  
✅ **New components created** for instructor, FAQ, stats  
✅ **Data transformation** uses actual admin values  
✅ **Fallbacks** only for optional fields  

**Status:** ⚠️ **Gaps Identified** - Ready for implementation 🚀
