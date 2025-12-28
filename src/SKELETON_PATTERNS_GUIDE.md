# 🎨 Skeleton Loader Patterns Guide

## Quick Reference for Future Development

---

## 📦 **Pattern Library**

### **Pattern 1: Admin Stats Grid**
**Use Case:** Admin dashboards with KPI metrics  
**Screens:** AdminAssessmentManager, AdminEquipProgramManager, AdminConsultationManager

```tsx
{/* 4-Column Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {[1, 2, 3, 4].map((i) => (
    <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <Skeleton height="16px" width="100px" className="mb-2" />
      <Skeleton height="24px" width="60px" />
    </div>
  ))}
</div>
```

---

### **Pattern 2: Content Card Grid**
**Use Case:** Program cards, assessment cards, resource cards  
**Screens:** EquipPrograms, Assessments, Library

```tsx
{/* 3-Column Card Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {[1, 2, 3, 4, 5, 6].map((i) => (
    <div key={i} className="rounded-xl overflow-hidden bg-card border">
      {/* Image */}
      <Skeleton variant="rectangular" height="200px" width="100%" />
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <Skeleton height="28px" width="80%" />
        
        {/* Description */}
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="90%" />
        
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width="60px" height="24px" className="rounded-full" />
          <Skeleton variant="rectangular" width="80px" height="24px" className="rounded-full" />
        </div>
        
        {/* CTA Button */}
        <Skeleton variant="button" height="40px" width="100%" />
      </div>
    </div>
  ))}
</div>
```

---

### **Pattern 3: Profile Card**
**Use Case:** Consultant profiles, user profiles  
**Screens:** Consultation, AdminUserManager

```tsx
{/* Profile Card with Avatar */}
<div className="rounded-xl p-6 bg-card border">
  <div className="flex items-start gap-4">
    {/* Avatar */}
    <Skeleton variant="circular" width="80px" height="80px" />
    
    {/* Profile Info */}
    <div className="flex-1 space-y-2">
      <Skeleton height="24px" width="70%" />
      <Skeleton height="16px" width="50%" />
      
      {/* Rating Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Skeleton key={star} variant="circular" width="16px" height="16px" />
        ))}
      </div>
    </div>
  </div>
  
  {/* Bio */}
  <div className="mt-4 space-y-2">
    <Skeleton height="16px" width="100%" />
    <Skeleton height="16px" width="90%" />
  </div>
  
  {/* Badges */}
  <div className="flex flex-wrap gap-2 mt-4">
    <Skeleton variant="rectangular" width="80px" height="24px" className="rounded-full" />
    <Skeleton variant="rectangular" width="100px" height="24px" className="rounded-full" />
    <Skeleton variant="rectangular" width="70px" height="24px" className="rounded-full" />
  </div>
  
  {/* Actions */}
  <div className="mt-6 space-y-2">
    <Skeleton height="20px" width="150px" />
    <Skeleton variant="button" height="40px" width="100%" />
  </div>
</div>
```

---

### **Pattern 4: Data Table**
**Use Case:** Admin tables with rows  
**Screens:** All Admin*Manager screens

```tsx
{/* Table Skeleton */}
<div className="rounded-lg p-4 bg-card">
  {/* Search/Filter Bar */}
  <Skeleton height="40px" width="100%" className="mb-4" />
  
  {/* Table Rows */}
  {[1, 2, 3, 4, 5].map((i) => (
    <div key={i} className="mb-3">
      <Skeleton height="60px" width="100%" />
    </div>
  ))}
</div>
```

---

### **Pattern 5: List Items with Avatar**
**Use Case:** Activity feeds, journal entries, notifications  
**Screens:** Dashboard, MoodJournal

```tsx
{/* List Items */}
<div className="space-y-3">
  {[1, 2, 3, 4, 5].map((i) => (
    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted">
      {/* Avatar/Icon */}
      <Skeleton variant="circular" width="48px" height="48px" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton height="20px" width="150px" />
        <Skeleton height="16px" width="100%" />
        
        {/* Tags/Badges */}
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rectangular" width="60px" height="20px" className="rounded-full" />
          <Skeleton variant="rectangular" width="60px" height="20px" className="rounded-full" />
        </div>
      </div>
    </div>
  ))}
</div>
```

---

### **Pattern 6: KPI Dashboard**
**Use Case:** Dashboard widgets with metrics  
**Screens:** Dashboard, Analytics

```tsx
{/* KPI Card */}
<div className="p-6 rounded-lg bg-card">
  <div className="flex justify-between items-start mb-4">
    {/* Icon */}
    <Skeleton variant="circular" width="48px" height="48px" />
    
    {/* Trend Indicator */}
    <Skeleton width="60px" height="20px" />
  </div>
  
  {/* Value */}
  <Skeleton height="32px" width="80px" className="mb-2" />
  
  {/* Label */}
  <Skeleton height="16px" width="120px" />
</div>
```

---

### **Pattern 7: Chart Placeholder**
**Use Case:** Analytics charts, graphs  
**Screens:** Dashboard, AdminDashboardAnalytics

```tsx
{/* Chart Card */}
<div className="p-6 rounded-lg bg-card">
  {/* Chart Title */}
  <Skeleton height="24px" width="200px" className="mb-4" />
  
  {/* Chart Area */}
  <Skeleton variant="rectangular" height="300px" width="100%" />
  
  {/* Legend (optional) */}
  <div className="flex gap-4 mt-4 justify-center">
    <Skeleton width="80px" height="20px" />
    <Skeleton width="80px" height="20px" />
    <Skeleton width="80px" height="20px" />
  </div>
</div>
```

---

### **Pattern 8: Form Input**
**Use Case:** Forms during loading/submission  
**Screens:** Login, Registration, Edit Pages

```tsx
{/* Form Skeleton */}
<div className="space-y-4">
  {/* Input Field */}
  <div>
    <Skeleton height="16px" width="100px" className="mb-2" />
    <Skeleton variant="rectangular" height="40px" width="100%" />
  </div>
  
  {/* Textarea */}
  <div>
    <Skeleton height="16px" width="100px" className="mb-2" />
    <Skeleton variant="rectangular" height="120px" width="100%" />
  </div>
  
  {/* Select */}
  <div>
    <Skeleton height="16px" width="100px" className="mb-2" />
    <Skeleton variant="rectangular" height="40px" width="100%" />
  </div>
  
  {/* Submit Button */}
  <Skeleton variant="button" height="44px" width="100%" />
</div>
```

---

### **Pattern 9: Hero Section**
**Use Case:** Landing pages, main sections  
**Screens:** Homepage, Assessments, EquipPrograms

```tsx
{/* Hero Skeleton */}
<div className="space-y-4">
  {/* Main Title */}
  <Skeleton height="48px" width="400px" />
  
  {/* Subtitle */}
  <Skeleton height="24px" width="600px" />
  
  {/* Description */}
  <div className="space-y-2 mt-4">
    <Skeleton height="16px" width="100%" />
    <Skeleton height="16px" width="90%" />
    <Skeleton height="16px" width="85%" />
  </div>
  
  {/* CTA Buttons */}
  <div className="flex gap-4 mt-6">
    <Skeleton variant="button" height="44px" width="150px" />
    <Skeleton variant="button" height="44px" width="150px" />
  </div>
</div>
```

---

### **Pattern 10: Modal/Dialog**
**Use Case:** Popups, confirmation dialogs  
**Screens:** Any screen with dialogs

```tsx
{/* Dialog Skeleton */}
<div className="p-6 space-y-6">
  {/* Header */}
  <div>
    <Skeleton height="28px" width="250px" />
    <Skeleton height="16px" width="350px" className="mt-2" />
  </div>
  
  {/* Content */}
  <div className="space-y-3">
    <Skeleton height="16px" width="100%" />
    <Skeleton height="16px" width="100%" />
    <Skeleton height="16px" width="90%" />
  </div>
  
  {/* Actions */}
  <div className="flex gap-4 justify-end">
    <Skeleton variant="button" height="40px" width="100px" />
    <Skeleton variant="button" height="40px" width="100px" />
  </div>
</div>
```

---

## 🎯 **Usage Guidelines**

### **When to Use Each Pattern:**

| Pattern | Use Case | Example Screens |
|---------|----------|-----------------|
| Admin Stats Grid | Numeric KPIs, metrics dashboard | AdminAssessmentManager |
| Content Card Grid | Browse content (programs, assessments) | EquipPrograms, Assessments |
| Profile Card | User/consultant profiles | Consultation |
| Data Table | Tabular data in admin | All Admin screens |
| List Items | Activity feeds, history | Dashboard, MoodJournal |
| KPI Dashboard | Dashboard widgets | Dashboard |
| Chart Placeholder | Analytics, graphs | Dashboard Analytics |
| Form Input | During form submission | Edit pages |
| Hero Section | Page intros | Landing pages |
| Modal/Dialog | Popup loading | Confirmation dialogs |

---

## ⚡ **Performance Tips**

### **Do's:**
✅ Use exact dimensions from actual content  
✅ Match skeleton layout to real layout  
✅ Limit animation complexity  
✅ Use CSS transforms for animation  
✅ Keep skeleton count reasonable (< 20 elements)  
✅ Add realistic spacing  

### **Don'ts:**
❌ Don't overanimate (causes jank)  
❌ Don't use too many skeletons  
❌ Don't guess dimensions  
❌ Don't forget mobile responsiveness  
❌ Don't animate too many properties  
❌ Don't use JavaScript animations  

---

## 🎨 **Design System Values**

### **Consistent Dimensions:**
```tsx
// Heights
height="16px"  // Small text
height="20px"  // Medium text
height="24px"  // Large text
height="28px"  // Title
height="32px"  // Large title
height="40px"  // Button
height="44px"  // Large button
height="48px"  // Icon
height="60px"  // Table row
height="80px"  // Profile avatar

// Circular Sizes
width="16px" height="16px"  // Small icon
width="24px" height="24px"  // Medium icon
width="48px" height="48px"  // Large icon / Avatar
width="64px" height="64px"  // Mood emoji
width="80px" height="80px"  // Profile photo
```

### **Common Widths:**
```tsx
width="100%"   // Full width
width="90%"    // Near full
width="80%"    // Most of width
width="70%"    // Majority
width="60%"    // Over half
width="50%"    // Half
width="40%"    // Less than half
width="100px"  // Fixed small
width="150px"  // Fixed medium
width="200px"  // Fixed large
```

---

## 📱 **Responsive Patterns**

### **Mobile-First Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 
    Mobile: 1 column
    Tablet: 2 columns
    Desktop: 3 columns
  */}
</div>
```

### **Adaptive Skeletons:**
```tsx
// Show fewer skeletons on mobile
{isMobile ? (
  // 3 skeletons
  [1, 2, 3].map(...)
) : (
  // 6 skeletons
  [1, 2, 3, 4, 5, 6].map(...)
)}
```

---

## 🔧 **Copy-Paste Templates**

### **Template 1: Basic Admin Screen**
```tsx
if (loading) {
  return (
    <div className="max-w-7xl mx-auto space-y-6" style={{ padding: 'var(--spacing-8)' }}>
      <div className="space-y-4">
        <Skeleton height="32px" width="300px" />
        <Skeleton height="20px" width="500px" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-4 rounded-lg bg-card">
            <Skeleton height="16px" width="100px" className="mb-2" />
            <Skeleton height="24px" width="60px" />
          </div>
        ))}
      </div>
      
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

### **Template 2: Card Grid Page**
```tsx
if (loading) {
  return (
    <div className="w-full" style={{ padding: 'var(--spacing-6)' }}>
      <div className="space-y-4 mb-8">
        <Skeleton height="48px" width="400px" />
        <Skeleton height="24px" width="600px" />
      </div>
      
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

---

## 🎓 **Learning Resources**

### **Related Patterns:**
- Facebook Content Placeholders
- LinkedIn Skeleton Screens
- YouTube Loading Skeletons
- Twitter Timeline Skeletons

### **Best Practices:**
1. Show skeletons instantly (< 100ms)
2. Match actual content layout exactly
3. Use subtle animation (avoid distraction)
4. Ensure accessibility (aria-busy, aria-live)
5. Test on real devices (mobile/tablet/desktop)
6. Measure perceived performance
7. A/B test with users

---

**Last Updated:** December 27, 2025  
**Version:** 1.0  
**Project:** iKan Mental Health PWA
