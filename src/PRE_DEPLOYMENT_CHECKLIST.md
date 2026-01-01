# 🚀 PRE-DEPLOYMENT TEST CHECKLIST

**Run this checklist before pushing to Git/Netlify**

---

## ✅ CRITICAL PATH TESTING

### **1. Homepage Test**
- [ ] Open app, homepage loads
- [ ] All sections visible (Hero, Assessments, Equip, Resources, Newsletter)
- [ ] Assessment block shows programs from backend
- [ ] Equip block shows programs from backend
- [ ] Resource block shows resources
- [ ] Newsletter block displays
- [ ] All CTA buttons work
- [ ] Navigation to /about, /faq, /contact works

**Expected:** Homepage loads in < 3 seconds, all content visible

---

### **2. Assessment Journey Test**
- [ ] Click "Assessments" in nav
- [ ] Assessment listing page loads with bento grid
- [ ] Click on any assessment card
- [ ] Assessment landing page loads
- [ ] Click "Start Assessment" button
- [ ] TypeformWizard appears (full-screen, one question at a time)
- [ ] Answer all questions (scale, single-choice, multiple-choice, text)
- [ ] Progress indicator updates
- [ ] Submit assessment
- [ ] Results page appears with:
  - [ ] Score display
  - [ ] Interpretation
  - [ ] Recommendations
  - [ ] Suggested program (if configured)
  - [ ] Consultant block
  - [ ] Resource recommendations

**Expected:** Smooth flow, no errors, all data displays correctly

---

### **3. Equip Programs Journey Test**
- [ ] Click "Equip" in nav
- [ ] Programs listing page loads
- [ ] Click on any program card
- [ ] Program detail page loads with:
  - [ ] Hero image
  - [ ] Description
  - [ ] What you'll learn
  - [ ] Daily schedule
- [ ] Click "Enroll Now" or "Start Program"
- [ ] TypeformWizard onboarding appears
- [ ] Answer onboarding questions
- [ ] Complete onboarding
- [ ] Enrollment successful message
- [ ] Navigate to dashboard
- [ ] Active program shows on dashboard
- [ ] Click "Continue Program"
- [ ] Daily content displays correctly

**Expected:** Enrollment works, program appears on dashboard

---

### **4. Dashboard Test (Authenticated)**
- [ ] Login if needed
- [ ] Dashboard loads
- [ ] User name displays correctly
- [ ] Active programs shown (if any)
- [ ] Recommendations section displays
- [ ] Progress indicators work
- [ ] Quick actions functional
- [ ] Navigate to account settings
- [ ] Profile loads

**Expected:** Dashboard personalizes to user, all widgets work

---

### **5. Consultation Test**
- [ ] Click "Consultation" in nav
- [ ] Consultant listing loads
- [ ] Filters work (category, availability, etc.)
- [ ] Click on consultant card
- [ ] Consultant detail page loads with:
  - [ ] Profile photo
  - [ ] Bio
  - [ ] Specialties
  - [ ] Pricing
  - [ ] Availability
- [ ] "Book Session" button visible

**Expected:** All consultants load, filtering works, detail view correct

---

### **6. Library/Resources Test**
- [ ] Click "Library" or "Resources" in nav
- [ ] Resource listing loads
- [ ] Categories filter works
- [ ] Search works (if implemented)
- [ ] Click on resource card
- [ ] Resource detail page loads
- [ ] Content displays (text, images, videos)
- [ ] Related resources show
- [ ] Back button works

**Expected:** Resources load, navigation works, content readable

---

### **7. Mood Journal Test**
- [ ] Navigate to Mood Journal
- [ ] Calendar displays
- [ ] Can select date
- [ ] Can add mood entry
- [ ] Mood saves
- [ ] Mood displays on calendar
- [ ] Can view past entries

**Expected:** Mood tracking works, data persists

---

### **8. Mobile Navigation Test (on mobile device or resize browser)**
- [ ] Bottom navigation appears
- [ ] All nav items functional
- [ ] Active state highlights
- [ ] Icons display correctly
- [ ] Tap targets are 44px minimum
- [ ] No horizontal scroll
- [ ] Content stacks properly

**Expected:** Mobile nav fully functional, no layout issues

---

## 🔧 TECHNICAL CHECKS

### **9. Console Errors**
- [ ] Open browser DevTools Console
- [ ] Navigate through all critical paths
- [ ] Check for errors (red text)
- [ ] Verify no "Cannot find module" errors
- [ ] Verify no "Failed to fetch" errors (unless offline)
- [ ] Check Network tab for failed requests

**Expected:** No critical errors, warnings acceptable

---

### **10. API Connectivity**
- [ ] Check Network tab in DevTools
- [ ] Verify API calls to `/make-server-cc205da9/*` succeed
- [ ] Verify 200 status codes on:
  - [ ] `/assessments`
  - [ ] `/equip/programs`
  - [ ] `/professionals`
  - [ ] `/resources`
- [ ] Check for 401 errors (should only occur when not logged in on protected routes)

**Expected:** All API calls succeed with proper status codes

---

### **11. Loading States**
- [ ] Navigate to assessments (check loading skeleton)
- [ ] Navigate to equip programs (check loading skeleton)
- [ ] Navigate to consultants (check loading skeleton)
- [ ] Verify no "blank screen" moments
- [ ] Progress indicators show during data fetch

**Expected:** Always shows loading state, never blank screen

---

### **12. Error Handling**
- [ ] Turn off internet connection
- [ ] Navigate through app
- [ ] Verify cached data shows
- [ ] Verify offline mode message appears
- [ ] Turn internet back on
- [ ] Verify app recovers gracefully

**Expected:** App works offline with cached data, recovers when online

---

## 📱 MOBILE SPECIFIC TESTS

### **13. Touch Interactions**
- [ ] Tap buttons - feedback visible
- [ ] Swipe gestures work (if implemented)
- [ ] Pull to refresh works (if implemented)
- [ ] Haptic feedback on tap (if implemented)
- [ ] Scroll smooth
- [ ] No accidental taps on small targets

**Expected:** Touch interactions feel native and responsive

---

### **14. Keyboard Behavior**
- [ ] Open keyboard on input field
- [ ] Content adjusts, not hidden behind keyboard
- [ ] Submit button accessible
- [ ] Keyboard closes on submit
- [ ] Focus management works

**Expected:** Keyboard doesn't obscure content

---

## 🔐 AUTHENTICATION TESTS

### **15. Login/Logout**
- [ ] Logout if logged in
- [ ] Navigate to protected route (should redirect to login)
- [ ] Login with valid credentials
- [ ] Redirects to intended route
- [ ] User data loads
- [ ] Logout
- [ ] Redirects to homepage

**Expected:** Auth flow works, route guards functional

---

### **16. Session Persistence**
- [ ] Login
- [ ] Refresh page
- [ ] Still logged in
- [ ] User data persists
- [ ] Dashboard loads correctly

**Expected:** Session persists across refreshes

---

## 🎨 VISUAL TESTS

### **17. Design Consistency**
- [ ] Typography consistent (Ubuntu font)
- [ ] Colors match design system
- [ ] Spacing consistent (4px grid)
- [ ] Border radius consistent
- [ ] Shadows subtle and consistent
- [ ] Icons consistent style

**Expected:** Visual consistency across all screens

---

### **18. Responsive Breakpoints**
- [ ] Test at 360px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] Test at 1920px (large desktop)
- [ ] All layouts adapt properly
- [ ] No broken layouts

**Expected:** Responsive at all breakpoints

---

## ⚠️ EDGE CASES

### **19. Empty States**
- [ ] Dashboard with no enrollments
- [ ] Library with no saved resources
- [ ] Mood journal with no entries
- [ ] Verify empty state messages show
- [ ] CTAs to add content present

**Expected:** Helpful empty states, not just blank

---

### **20. Long Content**
- [ ] Assessment with many questions
- [ ] Resource with long text
- [ ] Consultant with long bio
- [ ] Verify scroll works
- [ ] Verify "read more" works
- [ ] No layout breaks

**Expected:** Long content displays properly

---

## 🚀 FINAL CHECKS BEFORE PUSH

### **21. Environment Variables**
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (backend only)
- [ ] `RAZORPAY_KEY_SECRET` set (if using payments)

**Expected:** All required env vars present

---

### **22. Build Test**
```bash
# Run local build
npm run build

# Check for build errors
# Verify build succeeds
# Check bundle size
```
- [ ] Build succeeds without errors
- [ ] Bundle size reasonable (< 5MB recommended)
- [ ] No unused dependencies warnings

**Expected:** Clean build, no errors

---

### **23. Git Status**
```bash
# Check git status
git status

# Verify no uncommitted changes that should be tracked
# Verify .gitignore working (.env files not tracked)
```
- [ ] All changes committed
- [ ] No sensitive files in git
- [ ] Commit messages clear

**Expected:** Clean git status, ready to push

---

## ✅ ALL TESTS PASSED?

### **If YES:**
```bash
# Push to repository
git push origin main

# Monitor Netlify deployment
# https://app.netlify.com

# Verify production deployment
# Test live site at your-site.netlify.app
```

### **If NO:**
- Review failed test
- Fix issue
- Re-run checklist
- Do not push until all tests pass

---

## 📊 POST-DEPLOYMENT VERIFICATION

After Netlify deploys:

1. **Smoke Test Production:**
   - [ ] Homepage loads
   - [ ] Can navigate to all main pages
   - [ ] Assessment flow works
   - [ ] Equip enrollment works
   - [ ] No console errors

2. **Monitor:**
   - [ ] Check Netlify build logs
   - [ ] Monitor for errors (if error tracking enabled)
   - [ ] Check analytics (if enabled)

3. **Celebrate:** 🎉
   - You've successfully deployed!

---

**Checklist Version:** 1.0  
**Last Updated:** January 1, 2026  
**Status:** Ready for use
