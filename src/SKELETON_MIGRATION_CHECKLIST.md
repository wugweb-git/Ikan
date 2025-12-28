# ✅ Skeleton Loader Migration Checklist

## Step-by-Step Guide for Adding Skeletons to Any Screen

---

## 📋 **Pre-Migration Checklist**

- [ ] Identify the screen to enhance
- [ ] Determine the loading data source (API, database, etc.)
- [ ] Identify all loading states in the component
- [ ] Take screenshots of the actual loaded content
- [ ] Measure actual content dimensions (heights, widths)
- [ ] Note responsive breakpoints used
- [ ] Check if mobile/desktop layouts differ

---

## 🚀 **Step 1: Add Imports**

Add these imports to the top of your screen file:

```tsx
import { Skeleton } from '../ui/skeleton-loader';
import { EmptyState } from '../ui/empty-state';
import { TouchFeedback } from '../ui/touch-feedback';
```

**Location:** After existing UI component imports

**Example:**
```tsx
// Existing imports
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

// Add these
import { Skeleton } from '../ui/skeleton-loader';
import { EmptyState } from '../ui/empty-state';
import { TouchFeedback } from '../ui/touch-feedback';
```

---

## 🔍 **Step 2: Identify Loading State**

Find the loading state variable in your component:

```tsx
const [loading, setLoading] = useState(true);
// or
const [isLoading, setIsLoading] = useState(true);
```

**Common patterns:**
- `loading`
- `isLoading`
- `isFetching`
- `pending`

---

## 📝 **Step 3: Create Skeleton Structure**

### **Option A: Replace Existing Loading UI**

**Before:**
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin ...">Loading...</div>
    </div>
  );
}
```

**After:**
```tsx
if (loading) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Add skeleton structure here */}
    </div>
  );
}
```

### **Option B: Add Loading Check (if none exists)**

Add before the main return statement:

```tsx
if (loading) {
  return (
    // Skeleton structure
  );
}

return (
  // Actual content
);
```

---

## 🎨 **Step 4: Match Layout Structure**

### **Identify Content Sections:**

1. **Hero/Header Section**
   ```tsx
   <div className="space-y-4">
     <Skeleton height="32px" width="300px" />
     <Skeleton height="20px" width="500px" />
   </div>
   ```

2. **Stats/KPI Grid**
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
     {[1, 2, 3, 4].map(i => (
       <div key={i} className="p-4 rounded-lg bg-card">
         <Skeleton height="16px" width="100px" className="mb-2" />
         <Skeleton height="24px" width="60px" />
       </div>
     ))}
   </div>
   ```

3. **Content Cards**
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {[1, 2, 3, 4, 5, 6].map(i => (
       <CardSkeleton key={i} />
     ))}
   </div>
   ```

4. **List Items**
   ```tsx
   <div className="space-y-3">
     {[1, 2, 3, 4, 5].map(i => (
       <ListItemSkeleton key={i} />
     ))}
   </div>
   ```

---

## 📏 **Step 5: Measure & Match Dimensions**

### **Use Browser DevTools:**

1. Inspect actual content element
2. Note computed height and width
3. Use those exact values in skeleton

**Example:**

Real element:
```
height: 64px
width: 280px
```

Skeleton:
```tsx
<Skeleton height="64px" width="280px" />
```

### **Common Dimensions Reference:**

| Element Type | Height | Width |
|--------------|--------|-------|
| Small text | 16px | varies |
| Body text | 20px | varies |
| Heading | 28-32px | varies |
| Button | 40-44px | 100-150px |
| Avatar | 48-80px | 48-80px |
| Card image | 200px | 100% |
| Table row | 60px | 100% |

---

## 🎯 **Step 6: Add Skeleton Variants**

Use the appropriate variant for each element:

```tsx
// Text placeholders
<Skeleton variant="text" height="20px" width="200px" />

// Circular (avatars, icons)
<Skeleton variant="circular" width="48px" height="48px" />

// Rectangular (images, cards)
<Skeleton variant="rectangular" height="200px" width="100%" />

// Buttons
<Skeleton variant="button" height="40px" width="100%" />

// Full cards
<Skeleton variant="card" />
```

---

## 📱 **Step 7: Make It Responsive**

### **Use Responsive Grid Classes:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Mobile: 1 column */}
  {/* Tablet: 2 columns */}
  {/* Desktop: 3 columns */}
</div>
```

### **Conditional Skeleton Count:**

```tsx
{isMobile ? (
  [1, 2, 3].map(i => <Skeleton key={i} />)
) : (
  [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)
)}
```

---

## 🎨 **Step 8: Apply Design System Styles**

### **Always use CSS variables:**

```tsx
<div 
  className="p-6 rounded-lg" 
  style={{ 
    backgroundColor: 'var(--color-bg-card)',
    padding: 'var(--spacing-6)'
  }}
>
  <Skeleton ... />
</div>
```

### **Standard values:**
- Background: `var(--color-bg-card)`
- Page: `var(--color-bg-page)`
- Border: `var(--color-border-default)`
- Spacing: `var(--spacing-4)`, `var(--spacing-6)`, etc.
- Radius: `var(--radius-lg)` (16px), `var(--radius-md)` (12px)

---

## ♿ **Step 9: Add Accessibility**

### **Wrap skeleton in accessible container:**

```tsx
<div 
  role="status" 
  aria-busy="true" 
  aria-live="polite"
  aria-label="Loading content"
>
  {/* Skeletons */}
</div>
```

### **Screen reader announcement:**

```tsx
<span className="sr-only">Loading {contentType}...</span>
```

---

## 🧪 **Step 10: Test**

### **Visual Testing:**
- [ ] Skeleton appears immediately (< 100ms)
- [ ] Skeleton layout matches actual content
- [ ] No layout shift when content loads (CLS = 0)
- [ ] Animations are smooth (60fps)
- [ ] Responsive layouts work (mobile/tablet/desktop)

### **Functional Testing:**
- [ ] Data loads correctly after skeleton
- [ ] Skeleton disappears when data loaded
- [ ] Error states work
- [ ] Empty states work
- [ ] Re-fetching shows skeleton again

### **Performance Testing:**
- [ ] No memory leaks
- [ ] No frame drops during animation
- [ ] Fast render time (< 100ms)

### **Accessibility Testing:**
- [ ] Screen reader announces loading
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] ARIA attributes present

---

## 🔧 **Common Patterns**

### **Pattern 1: Admin Screen**

```tsx
if (loading) {
  return (
    <div className="max-w-7xl mx-auto space-y-6" style={{ padding: 'var(--spacing-8)' }}>
      {/* Header */}
      <div className="space-y-4">
        <Skeleton height="32px" width="300px" />
        <Skeleton height="20px" width="500px" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-4 rounded-lg bg-card">
            <Skeleton height="16px" width="100px" className="mb-2" />
            <Skeleton height="24px" width="60px" />
          </div>
        ))}
      </div>
      
      {/* Table */}
      <div className="rounded-lg p-4 bg-card">
        <Skeleton height="40px" width="100%" className="mb-4" />
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} height="60px" width="100%" className="mb-3" />
        ))}
      </div>
    </div>
  );
}
```

### **Pattern 2: Card Grid Page**

```tsx
if (loading) {
  return (
    <div className="w-full" style={{ padding: 'var(--spacing-6)' }}>
      {/* Hero */}
      <div className="space-y-4 mb-8">
        <Skeleton height="48px" width="400px" />
        <Skeleton height="24px" width="600px" />
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl overflow-hidden bg-card border">
            <Skeleton variant="rectangular" height="200px" width="100%" />
            <div className="p-6 space-y-4">
              <Skeleton height="28px" width="80%" />
              <Skeleton height="16px" width="100%" />
              <Skeleton height="16px" width="90%" />
              <Skeleton variant="button" height="40px" width="100%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### **Pattern 3: List View**

```tsx
if (loading) {
  return (
    <div className="space-y-6">
      <Skeleton height="32px" width="250px" />
      
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted">
            <Skeleton variant="circular" width="48px" height="48px" />
            <div className="flex-1 space-y-2">
              <Skeleton height="20px" width="60%" />
              <Skeleton height="16px" width="100%" />
              <div className="flex gap-2 pt-2">
                <Skeleton variant="rectangular" width="60px" height="20px" className="rounded-full" />
                <Skeleton variant="rectangular" width="60px" height="20px" className="rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ⚠️ **Common Mistakes to Avoid**

### **❌ Don't:**

1. **Use generic spinners for content-heavy screens**
   ```tsx
   // Bad
   {loading && <Spinner />}
   ```

2. **Guess dimensions**
   ```tsx
   // Bad - random sizes
   <Skeleton height="50px" width="350px" />
   ```

3. **Forget responsive design**
   ```tsx
   // Bad - fixed for desktop only
   <div className="grid-cols-4">
   ```

4. **Overanimate**
   ```tsx
   // Bad - too many animations
   <motion.div animate={{ ... }} whileHover={{ ... }}>
   ```

5. **Skip accessibility**
   ```tsx
   // Bad - no ARIA
   <div>{skeletons}</div>
   ```

### **✅ Do:**

1. **Match actual content**
   ```tsx
   // Good - exact match
   <Skeleton height="64px" width="280px" />
   ```

2. **Use responsive grids**
   ```tsx
   // Good
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

3. **Add accessibility**
   ```tsx
   // Good
   <div role="status" aria-busy="true" aria-live="polite">
   ```

4. **Keep animations subtle**
   ```tsx
   // Good - built-in animation
   <Skeleton /> {/* Uses default shimmer */}
   ```

5. **Test on real devices**

---

## 📊 **Quality Checklist**

Before marking as complete, verify:

- [ ] **Visual Accuracy**
  - [ ] Skeleton matches actual content layout
  - [ ] Dimensions are accurate (±5px)
  - [ ] Spacing matches design system
  - [ ] Colors use CSS variables

- [ ] **Responsive Design**
  - [ ] Works on mobile (360px+)
  - [ ] Works on tablet (768px+)
  - [ ] Works on desktop (1024px+)
  - [ ] Proper grid breakpoints

- [ ] **Performance**
  - [ ] Renders in < 100ms
  - [ ] Smooth animation (60fps)
  - [ ] No memory leaks
  - [ ] Small bundle size impact

- [ ] **Accessibility**
  - [ ] ARIA attributes present
  - [ ] Screen reader compatible
  - [ ] Keyboard navigation works
  - [ ] Focus management correct

- [ ] **Functionality**
  - [ ] Shows immediately on load
  - [ ] Disappears when data loaded
  - [ ] No layout shift
  - [ ] Works with error states

---

## 🎯 **Success Criteria**

Your skeleton implementation is successful when:

1. ✅ **Users see content preview immediately** (< 100ms)
2. ✅ **Layout matches actual content** (zero layout shift)
3. ✅ **Perceived load time reduced** (by 50%+)
4. ✅ **Professional appearance** (polished, not janky)
5. ✅ **Fully accessible** (WCAG 2.1 AA compliant)
6. ✅ **Works on all devices** (mobile, tablet, desktop)
7. ✅ **Maintains performance** (no fps drops)

---

## 📚 **Examples from Project**

### **Reference Implementations:**

1. **AdminAssessmentManager.tsx** - Admin screen pattern
2. **EquipPrograms.tsx** - Card grid pattern
3. **Dashboard.tsx** - KPI dashboard pattern
4. **MoodJournal.tsx** - List view pattern
5. **Consultation.tsx** - Profile card pattern

### **Pattern Library:**
See `/SKELETON_PATTERNS_GUIDE.md` for complete pattern library.

---

## 🆘 **Troubleshooting**

### **Issue: Layout shift when content loads**

**Solution:**
```tsx
// Ensure skeleton has exact same height as content
<Skeleton height="200px" /> // Match content height exactly
```

### **Issue: Skeleton doesn't match layout**

**Solution:**
- Use browser DevTools to measure actual content
- Copy exact structure from actual content JSX
- Match all padding, margins, gaps

### **Issue: Animation is janky**

**Solution:**
```tsx
// Reduce animation complexity
// Let Skeleton component handle animation (built-in)
<Skeleton /> // Uses optimized CSS animation
```

### **Issue: Skeleton shows for too long**

**Solution:**
```tsx
// Check loading state management
useEffect(() => {
  loadData().then(() => {
    setLoading(false); // Ensure this is called
  });
}, []);
```

### **Issue: Accessibility issues**

**Solution:**
```tsx
// Add proper ARIA attributes
<div 
  role="status" 
  aria-busy="true" 
  aria-live="polite"
  aria-label="Loading content"
>
  <Skeleton />
</div>
```

---

## 🎓 **Learning Path**

### **Beginner:**
1. Start with simple text skeletons
2. Add circular avatars
3. Try rectangular images
4. Build simple card skeletons

### **Intermediate:**
5. Create complex card layouts
6. Add responsive grids
7. Implement list patterns
8. Handle multiple loading states

### **Advanced:**
9. Optimize performance
10. Add custom animations
11. Create reusable skeleton components
12. Implement progressive loading

---

## ✅ **Final Checklist**

Before committing your changes:

- [ ] Added imports
- [ ] Identified loading state
- [ ] Created skeleton structure
- [ ] Matched layout exactly
- [ ] Used correct dimensions
- [ ] Added skeleton variants
- [ ] Made it responsive
- [ ] Applied design system styles
- [ ] Added accessibility features
- [ ] Tested visually
- [ ] Tested functionally
- [ ] Tested performance
- [ ] Tested accessibility
- [ ] Documented any special cases
- [ ] Reviewed with team (if applicable)

---

**Last Updated:** December 27, 2025  
**Version:** 1.0  
**Project:** iKan Mental Health PWA  
**Author:** Development Team

---

## 📞 **Need Help?**

- Review existing implementations in the project
- Check `/SKELETON_PATTERNS_GUIDE.md` for patterns
- See `/PHASE3_COMPLETE_SUMMARY.md` for overview
- Ask team members for code review
