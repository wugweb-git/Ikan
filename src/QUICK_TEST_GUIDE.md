# 🚀 Quick Test Guide - Admin Panel Fixes

## ⚡ 5-Minute Test Protocol

### 1️⃣ Open Console (IMPORTANT!)
```
Press F12 → Go to Console tab → Keep it open
```

### 2️⃣ Test Equip Program Save (Your Reported Issue)
1. Navigate: **Admin → Equip Programs → Select any program**
2. Change: **Program name** (e.g., "Updated Test Program")
3. Change: **Thumbnail image** (upload or change URL)
4. Click: **"Save Draft"** button (3rd button from left)
5. **Look at console** - you should see:
   ```
   📤 [EQUIP SAVE] Title: Updated Test Program
   📤 [EQUIP SAVE] Thumbnail: {new_image_url}
   ✅ [EQUIP SAVE] Update successful!
   ```
6. **Refresh page** - verify name and image are still updated

### 3️⃣ Test All 4 Action Buttons
Quick test each button:

| Button | Icon | Expected Behavior |
|--------|------|-------------------|
| **1. Cancel** | ❌ | Shows "unsaved changes" warning |
| **2. Delete** | 🗑️ | Opens delete confirmation (red button) |
| **3. Save Draft** | 📄 | Saves without publishing |
| **4. Publish** | 💾 | Publishes + shows "Published" badge |

### 4️⃣ What To Look For

✅ **GOOD SIGNS:**
- All 4 buttons visible and clickable
- Debug logs appear in console
- Toast notifications show up
- Changes persist after page refresh

❌ **BAD SIGNS:**
- Console shows errors
- Buttons don't respond
- Old values still showing after save
- No debug logs appearing

---

## 🐛 If Something's Not Working

### Debug Checklist:
1. **Check console logs** - Look for `📤` emoji messages
2. **Check Network tab** - Look for failed API requests (red entries)
3. **Check data in logs** - Is the new title/image in the logs?
4. **Try another content type** - Test Resources or Assessments

### Report Back With:
- [ ] Screenshot of console logs
- [ ] Which content type (Equip/Resource/Assessment)
- [ ] What exactly didn't work
- [ ] Whether you see the debug emoji logs (📤, ✅, ❌)

---

## 📋 Full Test (Optional - 15 minutes)

Test all 4 content types:

### Equip Programs
- [ ] Create new program
- [ ] Edit program name
- [ ] Upload thumbnail
- [ ] Save as draft
- [ ] Publish program
- [ ] Delete program

### Resources
- [ ] Create new resource
- [ ] Edit resource title
- [ ] Change thumbnail
- [ ] Save as draft
- [ ] Publish resource

### Assessments
- [ ] Create new assessment
- [ ] Edit assessment name
- [ ] Add questions
- [ ] Save as draft
- [ ] Publish assessment

### Pages
- [ ] Create new page
- [ ] Edit page name
- [ ] Change content
- [ ] Save as draft
- [ ] Publish page

---

## 🎯 Expected Results

**After the fixes:**
- ✅ All 4 buttons work on ALL admin edit pages
- ✅ Equip Program name changes SAVE correctly
- ✅ Equip Program image changes SAVE correctly
- ✅ Debug logs help identify any remaining issues
- ✅ Everything is consistent across all content types

---

**Ready to test!** 🚀  
Start with the 5-minute test, then report back if you find any issues.
