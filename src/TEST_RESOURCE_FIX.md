# 🧪 Quick Test Guide: Resource Display Fix

## 5-Minute Test Plan

### Test 1: Basic Display (1 minute)
1. Open Admin Dashboard → Resources
2. Create a test resource:
   ```
   Title: "Test Article - Understanding Anxiety"
   Category: "Mental Health"
   Content Type: "Article"
   Description: "A comprehensive guide to understanding anxiety"
   Published: ✅ Yes
   ```
3. Save
4. Navigate to /library
5. **✅ PASS:** Resource appears in grid
6. **❌ FAIL:** Resource does NOT appear → Check console logs

---

### Test 2: Published Filter (1 minute)
1. Create another resource with Published = **No** (Draft)
2. Navigate to /library
3. **✅ PASS:** Draft does NOT appear in list
4. **❌ FAIL:** Draft appears → Check filter logic

---

### Test 3: Type Filters (1 minute)
1. Create 3 resources:
   - Content Type: "Article"
   - Content Type: "Video"  
   - Content Type: "Tool"
2. Navigate to /library
3. Click "Videos" filter
4. **✅ PASS:** Only video resource shows
5. Click "Tools" filter
6. **✅ PASS:** Only tool resource shows

---

### Test 4: Console Logs (1 minute)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to /library
4. **✅ PASS:** See logs like:
   ```
   📚 Loading resources from API...
   📚 API Response: {isArray: true, count: X, ...}
   📄 Mapping resource: {id: "...", title: "...", published: true}
   ✅ Resources loaded and mapped: {total: X, published: X, categories: [...]}
   ```
5. **❌ FAIL:** No logs or error messages → API issue

---

### Test 5: Resource Detail (1 minute)
1. From /library, click on a resource card
2. **✅ PASS:** ResourceDetail page loads with content
3. **❌ FAIL:** 404 or blank page → Check routing/API

---

## Debug Checklist

If resources don't appear:

### ✅ Backend Check
```bash
# Check if resource was saved
# In Supabase dashboard, check KV store for keys like:
resource:resource-1234567890
```

**Expected:** Resource object with `id`, `title`, `published: true`

### ✅ API Check
Open browser console and run:
```javascript
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-cc205da9/library/resources', {
  headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
})
.then(r => r.json())
.then(console.log)
```

**Expected:** `{ resources: [...] }` with your created resources

### ✅ Frontend Console
Look for these logs:
```
📚 Loading resources from API...
📚 API Response: {isArray: true, count: 5, firstResource: {...}}
📄 Mapping resource: {id: "...", title: "...", category: "...", contentType: "...", published: true}
✅ Resources loaded and mapped: {total: 5, published: 4, categories: [...], types: [...]}
```

**Red flags:**
- `count: 0` → Backend not returning resources
- `published: false` on all → All are drafts
- Error messages → Check stack trace

---

## Common Issues & Solutions

### Issue #1: "No resources found" but admin shows resources
**Cause:** All resources have `published: false`  
**Solution:** Edit resources and set Published = Yes

### Issue #2: Resources appear but have wrong category/type
**Cause:** contentType field mismatch  
**Solution:** Check console logs for mapped types, verify backend data

### Issue #3: Console shows API error
**Cause:** Backend not deployed or route mismatch  
**Solution:** 
1. Deploy backend: `npm run supabase:deploy`
2. Check backend logs: `npm run supabase:logs`

### Issue #4: Resources appear in admin but not library
**Cause:** Field mapping issue  
**Solution:** Check console logs - the fix includes detailed logging for each resource

---

## Expected Console Output (Success)

```javascript
📚 Loading resources from API...

📚 API Response: {
  isArray: true, 
  count: 3, 
  firstResource: {
    id: "resource-1234567890",
    title: "Understanding Anxiety",
    category: "Mental Health",
    contentType: "Article",
    published: true,
    created_at: "2025-12-20T10:30:00.000Z",
    // ... other fields
  }
}

📄 Mapping resource: {
  id: "resource-1234567890",
  title: "Understanding Anxiety",
  category: "Mental Health",
  contentType: "Article",
  published: true
}

📄 Mapping resource: {
  id: "resource-9876543210",
  title: "Meditation Guide",
  category: "Wellness",
  contentType: "Video",
  published: true
}

📄 Mapping resource: {
  id: "resource-5555555555",
  title: "Mood Tracker Template",
  category: "Tools",
  contentType: "Tool",
  published: true
}

✅ Resources loaded and mapped: {
  total: 3,
  published: 3,
  categories: ["Mental Health", "Wellness", "Tools"],
  types: ["article", "video", "tool"]
}

ℹ️ Resources loaded successfully from API {count: 3}
```

---

## Expected Console Output (Failure)

### Scenario 1: No resources in database
```javascript
📚 Loading resources from API...
📚 API Response: {isArray: true, count: 0, firstResource: undefined}
⚠️ No resources returned from API
```
**Action:** Create resources in admin first

### Scenario 2: All resources are drafts
```javascript
📚 Loading resources from API...
📚 API Response: {isArray: true, count: 2, firstResource: {...}}
📄 Mapping resource: {id: "...", title: "...", published: false}
📄 Mapping resource: {id: "...", title: "...", published: false}
✅ Resources loaded and mapped: {total: 2, published: 0, categories: [], types: []}
```
**Action:** Set resources to Published = Yes in admin

### Scenario 3: API error
```javascript
📚 Loading resources from API...
❌ Resource load error: Error: Failed to fetch
```
**Action:** Check backend deployment and network

---

## Quick Win Test

**Goal:** Verify the fix works in <2 minutes

1. Create ONE test resource:
   - Title: "Quick Test"
   - Published: ✅ Yes
   - Category: "Test"
   - Content Type: "Article"
   
2. Open /library

3. Open console (F12)

4. **✅ SUCCESS if you see:**
   - Resource card appears in grid
   - Console shows `✅ Resources loaded and mapped: {total: 1, published: 1, ...}`
   
5. **❌ FAILURE if you see:**
   - Empty library
   - Console error
   - No console logs

---

## Report Results

### ✅ If all tests pass:
Resources are now displaying correctly! 🎉

### ❌ If tests fail:
1. Copy full console output
2. Note which test failed
3. Check backend deployment status
4. Share findings for further debugging

---

**Testing Time:** 5 minutes  
**Difficulty:** Easy  
**Required:** Admin access, Browser DevTools
