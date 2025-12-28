# 🚨 IMMEDIATE FIXES REQUIRED

**Priority: CRITICAL**  
**Estimated Time: 2-3 hours**

---

## 1. Update UI Kit Route ✅ (5 min)

**File:** `/App.tsx` line 937  
**Current:**
```tsx
<UIKitShowcase />
```

**Should be:**
```tsx
<UIKitShowcasePage onBack={() => handleNavigate('/admin')} />
```

**Also update import on line 48:**
```tsx
import { UIKitShowcasePage } from './components/screens/UIKitShowcasePage';
```

---

## 2. Add Category API Methods (30 min)

**File:** `/lib/api-client.ts`

**Add these methods:**
```typescript
// Category Management
async createCategory(data: Category): Promise<Category> {
  return this.post('/make-server-cc205da9/categories', data);
}

async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return this.put(`/make-server-cc205da9/categories/${id}`, data);
}

async deleteCategory(id: string): Promise<void> {
  return this.delete(`/make-server-cc205da9/categories/${id}`);
}

async listCategories(filters?: { type?: string; active?: boolean }): Promise<Category[]> {
  const params = new URLSearchParams(filters as any);
  return this.get(`/make-server-cc205da9/categories?${params}`);
}

async getCategory(id: string): Promise<Category> {
  return this.get(`/make-server-cc205da9/categories/${id}`);
}
```

---

## 3. Add Mood API Methods (30 min)

**File:** `/lib/api-client.ts`

**Add these methods:**
```typescript
// Mood Management
async createMood(data: Mood): Promise<Mood> {
  return this.post('/make-server-cc205da9/moods', data);
}

async updateMood(id: string, data: Partial<Mood>): Promise<Mood> {
  return this.put(`/make-server-cc205da9/moods/${id}`, data);
}

async deleteMood(id: string): Promise<void> {
  return this.delete(`/make-server-cc205da9/moods/${id}`);
}

async listMoods(filters?: { category?: string; active?: boolean }): Promise<Mood[]> {
  const params = new URLSearchParams(filters as any);
  return this.get(`/make-server-cc205da9/moods?${params}`);
}

async getMood(id: string): Promise<Mood> {
  return this.get(`/make-server-cc205da9/moods/${id}`);
}
```

---

## 4. Connect CategoryManager to API (15 min)

**File:** `/components/admin/AdminCategoryManager.tsx`

**Find the save/delete functions and update:**

```typescript
const handleSave = async () => {
  try {
    setSaving(true);
    if (editingCategory.id) {
      // Update existing
      await apiClient.updateCategory(editingCategory.id, editingCategory);
      showToast({
        id: `category-updated-${Date.now()}`,
        type: 'success',
        title: 'Category Updated',
        message: 'Category has been updated successfully',
        duration: 3000
      });
    } else {
      // Create new
      await apiClient.createCategory({ ...editingCategory, id: generateId() });
      showToast({
        id: `category-created-${Date.now()}`,
        type: 'success',
        title: 'Category Created',
        message: 'Category has been created successfully',
        duration: 3000
      });
    }
    loadCategories(); // Refresh list
    setEditingCategory(null);
  } catch (error) {
    showToast({
      id: `category-error-${Date.now()}`,
      type: 'error',
      title: 'Save Failed',
        message: 'Could not save category',
      duration: 5000
    });
  } finally {
    setSaving(false);
  }
};

const handleDelete = async (id: string) => {
  try {
    await apiClient.deleteCategory(id);
    showToast({
      id: `category-deleted-${Date.now()}`,
      type: 'success',
      title: 'Category Deleted',
      message: 'Category has been deleted',
      duration: 3000
    });
    loadCategories();
  } catch (error) {
    showToast({
      id: `category-delete-error-${Date.now()}`,
      type: 'error',
      title: 'Delete Failed',
      message: 'Could not delete category',
      duration: 5000
    });
  }
};

const loadCategories = async () => {
  try {
    const data = await apiClient.listCategories();
    setCategories(data);
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

// Call on mount
useEffect(() => {
  loadCategories();
}, []);
```

---

## 5. Connect MoodManager to API (15 min)

**File:** `/components/admin/AdminMoodManager.tsx`

**Same pattern as CategoryManager above**

---

## 6. Add Backend Routes for Category/Mood (45 min)

**File:** `/supabase/functions/server/index.tsx`

**Add these routes:**

```typescript
import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

// Category routes
app.get('/make-server-cc205da9/categories', async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    return c.json(categories);
  } catch (error) {
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

app.get('/make-server-cc205da9/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const category = await kv.get(`category:${id}`);
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    return c.json(category);
  } catch (error) {
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

app.post('/make-server-cc205da9/categories', async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || `cat-${Date.now()}`;
    const category = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await kv.set(`category:${id}`, category);
    return c.json(category, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

app.put('/make-server-cc205da9/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`category:${id}`);
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }
    const category = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };
    await kv.set(`category:${id}`, category);
    return c.json(category);
  } catch (error) {
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

app.delete('/make-server-cc205da9/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// Mood routes (same pattern)
app.get('/make-server-cc205da9/moods', async (c) => {
  try {
    const moods = await kv.getByPrefix('mood:');
    return c.json(moods);
  } catch (error) {
    return c.json({ error: 'Failed to fetch moods' }, 500);
  }
});

app.get('/make-server-cc205da9/moods/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const mood = await kv.get(`mood:${id}`);
    if (!mood) {
      return c.json({ error: 'Mood not found' }, 404);
    }
    return c.json(mood);
  } catch (error) {
    return c.json({ error: 'Failed to fetch mood' }, 500);
  }
});

app.post('/make-server-cc205da9/moods', async (c) => {
  try {
    const data = await c.req.json();
    const id = data.id || `mood-${Date.now()}`;
    const mood = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await kv.set(`mood:${id}`, mood);
    return c.json(mood, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create mood' }, 500);
  }
});

app.put('/make-server-cc205da9/moods/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`mood:${id}`);
    if (!existing) {
      return c.json({ error: 'Mood not found' }, 404);
    }
    const mood = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };
    await kv.set(`mood:${id}`, mood);
    return c.json(mood);
  } catch (error) {
    return c.json({ error: 'Failed to update mood' }, 500);
  }
});

app.delete('/make-server-cc205da9/moods/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`mood:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete mood' }, 500);
  }
});
```

---

## 7. Verify Week/Daily Structure Saves (10 min)

**File:** `/components/screens/EquipProgramEditPageWizard.tsx`

**In the `handleSave` function, verify these fields are included:**

```typescript
const dataToSave = {
  ...formData,
  // Ensure these are explicitly included
  week_structure: formData.week_structure || [],
  daily_content: formData.daily_content || [],
  // ... rest of fields
};
```

---

## 8. Add ImageUpload Error Handling (15 min)

**File:** `/components/ui/image-upload.tsx`

**Wrap upload logic in try/catch:**

```typescript
const handleUpload = async (file: File) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast({
      id: `upload-error-${Date.now()}`,
      type: 'error',
      title: 'Invalid File Type',
      message: 'Please upload an image file (JPG, PNG, WebP)',
      duration: 5000
    });
    return;
  }

  // Validate file size (e.g., 5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    showToast({
      id: `upload-error-${Date.now()}`,
      type: 'error',
      title: 'File Too Large',
      message: 'Image must be smaller than 5MB',
      duration: 5000
    });
    return;
  }

  try {
    setUploading(true);
    // Upload logic here
    const url = await uploadToStorage(file);
    onChange(url);
    showToast({
      id: `upload-success-${Date.now()}`,
      type: 'success',
      title: 'Upload Successful',
      message: 'Image uploaded successfully',
      duration: 3000
    });
  } catch (error) {
    console.error('Upload failed:', error);
    showToast({
      id: `upload-error-${Date.now()}`,
      type: 'error',
      title: 'Upload Failed',
      message: 'Could not upload image. Please try again.',
      duration: 5000
    });
  } finally {
    setUploading(false);
  }
};
```

---

## PRIORITY ORDER:

1. **Update UI Kit route** (5 min) - So you can view the showcase
2. **Add backend Category/Mood routes** (45 min) - Foundation for managers
3. **Add API client methods** (30 min each = 60 min) - Connect frontend to backend
4. **Connect managers to API** (15 min each = 30 min) - Make managers functional
5. **Verify Equip saves** (10 min) - Ensure data persists
6. **Add ImageUpload errors** (15 min) - Better UX

**Total Time: ~2.5 hours**

---

## TO TEST AFTER FIXES:

1. Visit `/ui-kit` route ✓
2. Create a category in CategoryManager ✓
3. Create a mood in MoodManager ✓
4. Save an Equip program with weeks/days ✓
5. Try uploading invalid image ✓
6. Try uploading oversized image ✓

---

**After these fixes, the app will be much more stable and functional!** 🚀
