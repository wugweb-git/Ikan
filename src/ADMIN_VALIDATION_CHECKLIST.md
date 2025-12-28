# iKan Admin Panel - Content Operations Validation Checklist

## 🚨 CRITICAL ISSUE IDENTIFIED

### Current 4-Button Action Bar Mapping
The new `AdminPageLayout.tsx` now expects **exactly 4 actions**:

```
Button 1 (Cancel)      → secondaryActions[0]
Button 2 (Delete)      → secondaryActions[1]  
Button 3 (Save Draft)  → secondaryActions[2]
Button 4 (Publish)     → primaryAction
```

### ❌ PROBLEM
**ALL admin edit pages** currently only pass:
- `secondaryActions = [{ Delete }]` (only 1 action)
- `primaryAction = { Publish/Unpublish }`

This means:
- ✅ Button 1 (Cancel) → Works (uses Delete action)
- ⚠️ Button 2 (Delete) → **BROKEN** (secondaryActions[1] is undefined)
- ⚠️ Button 3 (Save Draft) → **BROKEN** (secondaryActions[2] is undefined)
- ✅ Button 4 (Publish) → Works

---

## 📋 VALIDATION CHECKLIST BY CONTENT TYPE

### 1. ✅ Equip Programs (`AdminEquipProgramManager.tsx`)

**Backend API Endpoints:**
- ✅ `POST /make-server-cc205da9/equip/programs` - Create
- ✅ `PUT /make-server-cc205da9/equip/programs/:id` - Update
- ✅ `DELETE /make-server-cc205da9/equip/programs/:id` - Delete
- ✅ `GET /make-server-cc205da9/equip/programs` - List
- ✅ `GET /make-server-cc205da9/equip/programs/:id` - Get One

**Frontend API Client Methods:**
- ✅ `apiClient.createEquipProgram(data)`
- ✅ `apiClient.updateEquipProgram(id, data)`
- ✅ `apiClient.deleteEquipProgram(id)`
- ✅ `apiClient.getEquipPrograms()`
- ✅ `apiClient.getEquipProgram(id)`

**Edit Page:** `/components/screens/EquipProgramEditPageWizard.tsx`

**Operations to Test:**
- [ ] Create new program
- [ ] Update program name
- [ ] Update program description
- [ ] Upload thumbnail image
- [ ] Add/edit daily content
- [ ] Add/edit onboarding questions
- [ ] Publish program (sets `published: true`, `published_at: timestamp`)
- [ ] Unpublish program (sets `published: false`)
- [ ] Delete program
- [ ] Save as draft (keeps `published: false`)

**Known Issues:**
- ⚠️ User reported: "Name changes and image uploads aren't being saved"
- ⚠️ Action buttons broken due to new 4-button layout

---

### 2. ✅ Resources (`AdminResourceManager.tsx`)

**Backend API Endpoints:**
- ✅ `POST /make-server-cc205da9/admin/resources` - Create
- ✅ `PUT /make-server-cc205da9/admin/resources/:id` - Update
- ✅ `DELETE /make-server-cc205da9/admin/resources/:id` - Delete
- ✅ `GET /make-server-cc205da9/library/resources` - List
- ✅ `GET /make-server-cc205da9/library/resources/:id` - Get One

**Frontend API Client Methods:**
- ✅ `apiClient.createResource(data)`
- ✅ `apiClient.updateResource(id, data)`
- ✅ `apiClient.deleteResource(id)`
- ✅ `apiClient.getResources()`
- ✅ `apiClient.getResource(id)`

**Edit Page:** `/components/screens/ResourceEditPage.tsx`

**Storage Keys:**
- `library:resource:{id}` or `resource:{id}`

**Operations to Test:**
- [ ] Create new resource
- [ ] Update resource title
- [ ] Update resource description
- [ ] Upload thumbnail
- [ ] Update content/URL
- [ ] Change category
- [ ] Publish resource
- [ ] Unpublish resource
- [ ] Delete resource
- [ ] Toggle featured status

**Known Issues:**
- ⚠️ Action buttons broken due to new 4-button layout

---

### 3. ✅ Assessments (`AdminAssessmentManager.tsx`)

**Backend API Endpoints:**
- ✅ `POST /make-server-cc205da9/assessments` - Create (requireAuth + admin check)
- ✅ `PUT /make-server-cc205da9/assessments/:id` - Update
- ✅ `DELETE /make-server-cc205da9/assessments/:id` - Delete
- ✅ `GET /make-server-cc205da9/assessments` - List
- ✅ `GET /make-server-cc205da9/assessments/:id` - Get One

**Frontend API Client Methods:**
- ✅ `apiClient.createAssessment(data)`
- ✅ `apiClient.updateAssessment(id, data)`
- ✅ `apiClient.deleteAssessment(id)`
- ✅ `apiClient.getAssessments()`
- ✅ `apiClient.getAssessment(id)`

**Edit Page:** `/components/screens/AssessmentEditPageWizard.tsx`

**Storage Keys:**
- `assessment:{id}`
- `assessment_by_slug:{slug}`

**Question Types Supported (8 types):**
1. Multiple Choice
2. Single Choice
3. Yes/No
4. Scale (1-10)
5. Text Input
6. Likert Scale
7. Ranking
8. Matrix

**Operations to Test:**
- [ ] Create new assessment
- [ ] Update assessment name
- [ ] Update assessment description
- [ ] Add questions (all 8 types)
- [ ] Edit questions
- [ ] Delete questions
- [ ] Reorder questions
- [ ] Set scoring rules
- [ ] Publish assessment
- [ ] Unpublish assessment
- [ ] Delete assessment

**Known Issues:**
- ⚠️ Action buttons broken due to new 4-button layout

---

### 4. ⚠️ Pages (`AdminPageManager.tsx`)

**Status:** Need to verify CRUD operations

**Operations to Test:**
- [ ] Create new page
- [ ] Update page content
- [ ] Publish page
- [ ] Unpublish page
- [ ] Delete page

**Known Issues:**
- ⚠️ Action buttons broken due to new 4-button layout
- ⚠️ CRUD operations not validated yet

---

### 5. ⚠️ Categories (`AdminCategoryManager.tsx`)

**Location:** `/components/admin/AdminCategoryManager.tsx`

**Status:** Need to verify CRUD operations

**Operations to Test:**
- [ ] Create new category
- [ ] Update category name
- [ ] Update category icon
- [ ] Delete category
- [ ] Reorder categories

**Known Issues:**
- ⚠️ CRUD operations not validated yet
- ⚠️ May not use new AdminPageLayout (check implementation)

---

### 6. ⚠️ Moods (`AdminMoodManager.tsx`)

**Location:** `/components/admin/AdminMoodManager.tsx`

**Status:** Need to verify CRUD operations

**Operations to Test:**
- [ ] Create new mood
- [ ] Update mood name
- [ ] Update mood emoji/icon
- [ ] Delete mood
- [ ] Reorder moods

**Known Issues:**
- ⚠️ CRUD operations not validated yet
- ⚠️ May not use new AdminPageLayout (check implementation)

---

## 🔧 REQUIRED FIXES

### Priority 1: Fix Action Bar for ALL Edit Pages

**Files to Update:**
1. `/components/screens/EquipProgramEditPageWizard.tsx`
2. `/components/screens/ResourceEditPage.tsx`
3. `/components/screens/AssessmentEditPageWizard.tsx`
4. Any other edit pages using `AdminPageLayout`

**Required Changes:**
Each edit page must pass **3 secondary actions**:

```tsx
secondaryActions={[
  // Button 1: Cancel
  {
    label: 'Cancel',
    icon: <X className="w-4 h-4" />,
    onClick: onBack, // or handleCancel with unsaved changes warning
    variant: 'outline' as const
  },
  // Button 2: Delete
  ...(itemId ? [{
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    onClick: () => setIsDeleteDialogOpen(true),
    variant: 'destructive' as const
  }] : []),
  // Button 3: Save Draft
  {
    label: 'Save Draft',
    icon: <FileText className="w-4 h-4" />,
    onClick: () => handleSave(false), // false = don't publish
    variant: 'outline' as const
  }
]}
```

### Priority 2: Fix Equip Program Save Issue

**Investigation needed:**
1. Check if `formData` changes are being properly tracked
2. Verify image upload handling
3. Add console logs to `handleSave()` to see what data is being sent
4. Check server logs for the update request

**Debugging Steps:**
```tsx
console.log('📤 Saving program data:', dataToSave);
console.log('📤 Program ID:', programId);
console.log('📤 Title:', dataToSave.title);
console.log('📤 Image:', dataToSave.thumbnail);
```

---

## 📊 Database Storage Patterns

### KV Store Key Patterns:

1. **Equip Programs:**
   - `equip_program:{id}`
   - `equip_program_by_slug:{slug}`

2. **Resources:**
   - `library:resource:{id}` (new pattern)
   - `resource:{id}` (legacy pattern)

3. **Assessments:**
   - `assessment:{id}`
   - `assessment_by_slug:{slug}`

4. **Users:**
   - `user:{id}`

### Common Fields:

**All content types should have:**
- `id` - Unique identifier
- `slug` - URL-friendly identifier
- `title` or `name` - Display name
- `description` - Brief description
- `published` - Boolean (true/false)
- `published_at` - ISO timestamp (set when published)
- `created_at` - ISO timestamp
- `updated_at` - ISO timestamp
- `created_by` - User ID
- `updated_by` - User ID

---

## 🧪 TESTING PROTOCOL

### For Each Content Type:

1. **Create Operation:**
   - Fill all required fields
   - Click "Save Draft" → Should save with `published: false`
   - Verify item appears in list with "Draft" badge
   - Open item → Verify all fields saved correctly

2. **Update Operation:**
   - Edit item (change name, description, etc.)
   - Click "Save Draft" → Should update without publishing
   - Verify changes reflected in list
   - Re-open item → Verify changes persisted

3. **Publish Operation:**
   - Open draft item
   - Click "Publish" button → Should set `published: true` and `published_at`
   - Verify "Published" badge appears
   - Check that item is visible to end users

4. **Unpublish Operation:**
   - Open published item
   - Click "Unpublish" button → Should set `published: false`
   - Verify "Draft" badge appears
   - Check that item is hidden from end users

5. **Delete Operation:**
   - Open item
   - Click "Delete" button
   - Confirm deletion
   - Verify item removed from list
   - Verify item removed from database

6. **Image Upload (if applicable):**
   - Upload image
   - Save item
   - Verify image URL saved
   - Re-open item → Verify image displays correctly

---

## 🐛 DEBUGGING CHECKLIST

If saves are not working:

1. **Check Browser Console:**
   - Look for API errors
   - Check network tab for failed requests
   - Verify request payload

2. **Check Server Logs:**
   - Look for update/create logs
   - Check for authentication errors
   - Verify data being received

3. **Verify Authentication:**
   - Ensure user has admin role
   - Check `is_admin` flag in user profile
   - Verify JWT token is valid

4. **Check KV Store:**
   - Use Admin Debug Panel
   - Search for items by prefix
   - Verify data structure matches expected format

5. **Common Issues:**
   - Wrong storage key prefix
   - ID vs slug mismatch
   - Missing required fields
   - Validation errors not displayed
   - Form state not updating

---

## ✅ SUCCESS CRITERIA

**All content types should support:**
- ✅ Create new items
- ✅ Edit existing items
- ✅ Delete items
- ✅ Publish/unpublish toggle
- ✅ Save as draft
- ✅ Image/media upload (where applicable)
- ✅ Proper validation messages
- ✅ Loading states during operations
- ✅ Success/error toast notifications
- ✅ Data persistence in database
- ✅ Timestamp tracking (created_at, updated_at, published_at)
- ✅ User tracking (created_by, updated_by)

---

## 📝 NEXT STEPS

1. **URGENT:** Fix the 4-button action bar for all edit pages
2. **URGENT:** Debug Equip Program save issue
3. Validate all CRUD operations for each content type
4. Test publish/unpublish workflows
5. Test image upload functionality
6. Verify data persistence across page refreshes
7. Check end-user visibility of published vs draft content

---

**Last Updated:** {{ current_date }}
**Status:** 🔴 CRITICAL ISSUES IDENTIFIED - Action bar broken, Equip save not working
