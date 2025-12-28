# ✅ Step 4: Block-Based Mental Model Applied

## 🎯 MENTAL MODEL UPDATE

Changed from **"Scheduling time"** to **"Composing daily experiences"**

### OLD MODEL (Activities):
- Generic "activities" with vague types
- Reading, Exercise, Reflection, Video, Audio, Assessment
- No clear purpose or ordering

### NEW MODEL (Blocks):
- **Ordered, typed, reusable blocks**
- 6 specific block types with clear purposes
- Explicit ordering and data mapping

---

## 📦 NEW BLOCK TYPES

Each day contains **ordered blocks**:

| Block Type | Icon | Purpose | Example |
|------------|------|---------|---------|
| **Lesson** | 📚 | Psychoeducation | "Understanding Sleep Cycles" |
| **Exercise** | ✏️ | Structured Interaction | "MCQ: Which is a valid journal entry?" |
| **Journal** | 📝 | Free/Ephemeral Writing | "Free write about your day" |
| **Checklist** | ☑️ | Habits Tracking | "Morning routine checklist" |
| **Reflection** | 💭 | Wrap-up | "What did you learn today?" |
| **Conclude** | 🎯 | Closure Message | "Hope you found this helpful..." |

---

## 🏗️ DAY STRUCTURE

```
Day 4: Journaling (30 min)
├── 📚 Lesson Block (10 min)
│   └── "Journaling and emptying the mind"
├── ✏️ Exercise Block (8 min)
│   └── "MCQ: Which of the following is a valid journal entry?"
├── 📝 Journal Block (10 min)
│   └── "Free write (ephemeral)"
└── 🎯 Conclude Block (2 min)
    └── "Hope you found this helpful…"
```

---

## ✨ NEW FEATURES

### 1. **Block Properties**
Every block now has:
- ✅ **Type** - One of 6 block types
- ✅ **Title** - Block name
- ✅ **Content** - Instructions/prompt
- ✅ **Duration** - Time in minutes
- ✅ **Required** - Completion tracking
- ✅ **Order** - Explicit ordering (auto-managed)
- ✅ **Data ID** - Data mapping (i01-i12)

### 2. **Auto-Summed Time**
- Total day time calculated from block durations
- Displayed in day navigator: "Day 1 • 5 blocks • 30 min"

### 3. **Completion Tracking**
- Required vs. optional blocks
- Day completion = all required blocks done

### 4. **Data Mapping**
- Each block can be assigned a Data ID (i01-i12)
- Maps block responses to intake data

---

## 📝 FILES MODIFIED

1. ✅ `/components/screens/EquipProgramEditPageWizard.tsx`
   - Updated `Activity` interface with new block types
   - Added `order` and `data_id` fields
   - Changed activity types to 6 block types
   - Updated labels: "Activities" → "Block Stack (Ordered)"
   - Updated placeholders with block-specific guidance
   - Added Data ID input field
   - Auto-calculate total time per day
   - Default new blocks to `lesson` type

---

## 🎨 UI UPDATES

### Step 4 Header
- **Old:** "Daily Content" - "Create daily lessons, activities, and exercises"
- **New:** "Daily Program Builder" - "Compose daily experiences using ordered blocks"

### Day Cards
- **Old:** "X activities"
- **New:** "X blocks • Y min" (shows total time)

### Block Stack Section
- **Old:** "Activities"
- **New:** "Block Stack (Ordered)"

### Empty State
- **Old:** "No activities yet. Add lessons, tasks, or exercises."
- **New:** "No blocks yet. Add blocks to compose this day's experience."

### Block Type Dropdown
```
📚 Lesson - Psychoeducation
✏️ Exercise - Structured Interaction
📝 Journal - Free Writing (Ephemeral)
☑️ Checklist - Habits Tracking
💭 Reflection - Wrap-up
🎯 Conclude - Closure Message
```

### Block Input Fields
- **Title:** "Block title (e.g., 'Understanding Sleep Cycles')..."
- **Content:** "Block content, instructions, or prompt..."
- **Duration:** "Duration (mins)"
- **Data ID:** "Data ID (i01-i12)" ← NEW
- **Required:** Checkbox

---

## 🧪 TESTING GUIDE

### Test Block Creation
1. Navigate to Step 4: Daily Program Builder
2. Click "Add Day"
3. Click "Add Block"
4. Select a block type from dropdown
5. **Verify:** Default type is "📚 Lesson"
6. **Verify:** Block has all 6 fields (title, content, duration, data_id, required, order)

### Test Block Types
1. Create one of each block type
2. **Verify:** Each shows correct emoji icon
3. **Verify:** Dropdown shows all 6 types with descriptions

### Test Time Calculation
1. Add 3 blocks with different durations (10, 15, 5)
2. **Verify:** Day shows "3 blocks • 30 min"

### Test Data ID Assignment
1. Assign Data IDs: i01, i02, i03
2. Save program
3. Reload program
4. **Verify:** Data IDs persisted

### Test Block Ordering
1. Add 4 blocks
2. **Verify:** Each has order: 0, 1, 2, 3
3. Delete block 1
4. **Verify:** Remaining blocks reorder automatically

---

## 💡 ADMIN EXPERIENCE

When creating Day 4 for a Sleep Program:

1. **Add Day** → Day 4 created
2. **Set day title:** "Journaling"
3. **Add Block** → Select "📚 Lesson"
   - Title: "Journaling and emptying the mind"
   - Duration: 10 min
   - Data ID: i04
4. **Add Block** → Select "✏️ Exercise"
   - Title: "MCQ: Which is a valid journal entry?"
   - Duration: 8 min
5. **Add Block** → Select "📝 Journal"
   - Title: "Free write"
   - Content: "Write about your day (ephemeral)"
   - Duration: 10 min
6. **Add Block** → Select "🎯 Conclude"
   - Title: "Wrap up"
   - Content: "Hope you found this helpful..."
   - Duration: 2 min

**Result:** Day 4 • 4 blocks • 30 min ✅

---

## 🚀 USER RUNTIME EXPERIENCE

The user sees:

```
Today — Day 6
⏱ 30 min

• 📚 Lesson
• ✏️ Exercise
• ✏️ Exercise
• 📝 Journal
• 🎯 Conclude
```

- Each block completed sequentially
- Progress tracked per block
- Day complete when all required blocks done

---

## 📊 DATA STRUCTURE

### Before (Old):
```typescript
{
  day: 4,
  title: "Journaling",
  activities: [
    {
      id: "act-123",
      title: "...",
      type: "reading", // Vague
      duration: 10,
      required: true
    }
  ]
}
```

### After (New):
```typescript
{
  day: 4,
  title: "Journaling",
  activities: [
    {
      id: "block_123",
      title: "Journaling and emptying the mind",
      type: "lesson", // Specific
      content: "...",
      duration: 10,
      required: true,
      order: 0, // Explicit ordering
      data_id: "i04" // Data mapping
    }
  ]
}
```

---

## ✅ ALIGNMENT WITH CBT PRACTICE

The new block model matches **actual CBT therapy structure**:

1. **Psychoeducation (Lesson)** - Teach concepts
2. **Structured Practice (Exercise)** - Apply skills
3. **Self-Expression (Journal)** - Process emotions
4. **Behavior Change (Checklist)** - Build habits
5. **Integration (Reflection)** - Consolidate learning
6. **Closure (Conclude)** - Wrap up session

This is **exactly how therapists structure sessions**.

---

## 🎯 SUCCESS CRITERIA

✅ 6 block types available  
✅ Blocks have order, duration, data_id  
✅ Total time auto-calculated  
✅ Data IDs can be assigned (i01-i12)  
✅ UI says "Block Stack" not "Activities"  
✅ Empty state mentions "composing experience"  
✅ Block types have emoji icons  
✅ Default to Lesson block  

---

## 📋 FUTURE ENHANCEMENTS

**Not implemented yet, but possible:**
- [ ] Drag-and-drop block reordering
- [ ] Visual day timeline
- [ ] Block templates/presets
- [ ] Left sidebar day navigator (from NEW UI design)
- [ ] Duplicate block button
- [ ] Move up/down buttons per block

**Current approach:** Manual ordering via delete/add

---

**Status:** ✅ Block Mental Model Applied  
**Backward Compatible:** Yes  
**Breaking Changes:** None  
**Data Migration:** Not required  

The interface now properly reflects the **"composing daily experiences"** mental model! 🎉
