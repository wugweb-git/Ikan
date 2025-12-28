# PWA Screenshots Guide

## Overview
This guide explains how to generate and configure PWA screenshots for app store submissions and enhanced install prompts.

## Required Screenshots

### 1. Mobile Screenshots (Required for Google Play)
**Size**: 540x960px (9:16 aspect ratio)  
**Format**: PNG or WebP  
**Count**: Minimum 4, recommended 8  

**Recommended Screens**:
1. **Homepage Hero** (`/`)
   - Shows the iKan logo and "Your partner in mental wellness" tagline
   - Call-to-action buttons visible
   - File: `screenshot-mobile-1-home.png`

2. **Dashboard** (`/dashboard`)
   - Shows mood tracking, assessments, and Equip programs
   - Demonstrates the main user interface
   - File: `screenshot-mobile-2-dashboard.png`

3. **Mood Journal** (`/mood-journal`)
   - Shows mood tracking interface
   - Demonstrates core functionality
   - File: `screenshot-mobile-3-mood-journal.png`

4. **Assessments** (`/assessment`)
   - Shows assessment cards (Anxiety, Depression, Stress, etc.)
   - Demonstrates mental health tools
   - File: `screenshot-mobile-4-assessments.png`

5. **Equip Programs** (`/equip`)
   - Shows program cards with progress
   - Demonstrates structured programs
   - File: `screenshot-mobile-5-equip-programs.png`

6. **Consultation** (`/consultation`)
   - Shows consultant profiles
   - Demonstrates professional support
   - File: `screenshot-mobile-6-consultation.png`

7. **Resources** (`/resource`)
   - Shows library of articles and videos
   - Demonstrates educational content
   - File: `screenshot-mobile-7-resources.png`

8. **Account Settings** (`/account`)
   - Shows user profile and settings
   - Demonstrates personalization
   - File: `screenshot-mobile-8-account.png`

---

### 2. Desktop Screenshots (Recommended for Microsoft Store)
**Size**: 1280x800px (16:10 aspect ratio)  
**Format**: PNG or WebP  
**Count**: Minimum 4, recommended 6  

**Recommended Screens**:
1. **Homepage** - Desktop hero with navigation
2. **Dashboard** - Full desktop layout
3. **Assessments** - Desktop assessment flow
4. **Equip Programs** - Desktop program interface
5. **Resources** - Desktop library view
6. **Consultation** - Desktop consultant profiles

---

## How to Generate Screenshots

### Option 1: Manual Screenshots (Recommended)

1. **Open the app** in your browser
2. **Set device dimensions** using Chrome DevTools:
   - Press `F12` to open DevTools
   - Click "Toggle device toolbar" (Ctrl+Shift+M)
   - Select "Responsive" mode
   - Set dimensions: 540x960 for mobile, 1280x800 for desktop

3. **Navigate to each screen** and take screenshots:
   - Use browser's built-in screenshot tool
   - Or use Snipping Tool / Screenshot app

4. **Save files** to `/public/screenshots/` directory

---

### Option 2: Automated Screenshots (Advanced)

Use Playwright or Puppeteer to automate:

```javascript
// screenshot-generator.js
const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 540, height: 960 }
  });
  const page = await context.newPage();

  const screens = [
    { url: 'http://localhost:5173/', name: 'home' },
    { url: 'http://localhost:5173/dashboard', name: 'dashboard' },
    { url: 'http://localhost:5173/mood-journal', name: 'mood-journal' },
    { url: 'http://localhost:5173/assessment', name: 'assessments' },
    { url: 'http://localhost:5173/equip', name: 'equip-programs' },
    { url: 'http://localhost:5173/consultation', name: 'consultation' },
    { url: 'http://localhost:5173/resource', name: 'resources' },
    { url: 'http://localhost:5173/account', name: 'account' }
  ];

  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    await page.goto(screen.url);
    await page.waitForTimeout(2000); // Wait for content to load
    await page.screenshot({ 
      path: `public/screenshots/screenshot-mobile-${i+1}-${screen.name}.png`,
      fullPage: false 
    });
  }

  await browser.close();
})();
```

**Run**:
```bash
npm install playwright
node screenshot-generator.js
```

---

## Manifest Configuration

Update `/public/manifest.json` to include screenshots:

```json
{
  "name": "iKan Mental Health",
  "short_name": "iKan",
  "screenshots": [
    {
      "src": "/screenshots/screenshot-mobile-1-home.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "iKan Homepage - Your partner in mental wellness"
    },
    {
      "src": "/screenshots/screenshot-mobile-2-dashboard.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Dashboard - Track your mental health journey"
    },
    {
      "src": "/screenshots/screenshot-mobile-3-mood-journal.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mood Journal - Log your daily emotions"
    },
    {
      "src": "/screenshots/screenshot-mobile-4-assessments.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mental Health Assessments - Anxiety, Depression, Stress"
    },
    {
      "src": "/screenshots/screenshot-mobile-5-equip-programs.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Equip Programs - Structured mental health programs"
    },
    {
      "src": "/screenshots/screenshot-mobile-6-consultation.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Professional Consultation - Connect with experts"
    },
    {
      "src": "/screenshots/screenshot-mobile-7-resources.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Resource Library - Articles, videos, and tools"
    },
    {
      "src": "/screenshots/screenshot-mobile-8-account.png",
      "sizes": "540x960",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Account Settings - Manage your profile and preferences"
    },
    {
      "src": "/screenshots/screenshot-desktop-1-home.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "iKan Desktop - Homepage"
    },
    {
      "src": "/screenshots/screenshot-desktop-2-dashboard.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop Dashboard"
    },
    {
      "src": "/screenshots/screenshot-desktop-3-assessments.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop Assessments"
    },
    {
      "src": "/screenshots/screenshot-desktop-4-equip.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop Equip Programs"
    }
  ]
}
```

---

## Screenshot Best Practices

### Content Guidelines
- ✅ **Show real functionality** - Use actual app features, not mockups
- ✅ **Highlight key features** - Focus on unique selling points
- ✅ **Use realistic data** - Show realistic mood entries, assessments, etc.
- ✅ **Clean interface** - Remove any development artifacts
- ❌ **No sensitive data** - Don't show real user information
- ❌ **No error states** - Screenshots should show the app working perfectly

### Visual Guidelines
- ✅ **Good lighting** - Ensure good contrast and readability
- ✅ **Proper spacing** - Show the full interface without cropping
- ✅ **Design system** - Ensure Ubuntu font and iKan colors are visible
- ✅ **Professional** - High-quality, crisp images

### Accessibility
- ✅ **Descriptive labels** - Each screenshot should have a clear label
- ✅ **High contrast** - Ensure text is readable
- ✅ **Proper alt text** - Provide meaningful descriptions

---

## Testing Screenshots

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Select "Manifest" in the sidebar
4. Check that screenshots are loaded correctly
5. Verify dimensions and labels

### Lighthouse PWA Audit
```bash
npm run build
npx lighthouse http://localhost:4173 --view
```

Check the PWA section for screenshot validation.

---

## App Store Requirements

### Google Play Store
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Size**: 540x960px (9:16) or 1080x1920px (9:16)
- **Format**: PNG or JPEG
- **File size**: Max 1MB each

### Apple App Store (if publishing PWA as iOS app)
- **Minimum**: 3 screenshots
- **Size**: Device-specific (e.g., 1242x2688px for iPhone 12 Pro Max)
- **Format**: PNG or JPEG

### Microsoft Store
- **Minimum**: 1 screenshot
- **Recommended**: 4-10 screenshots
- **Size**: 1280x800px (16:10) or similar desktop ratios
- **Format**: PNG

---

## Deployment Checklist

- [ ] Generate 8 mobile screenshots (540x960px)
- [ ] Generate 4-6 desktop screenshots (1280x800px)
- [ ] Save to `/public/screenshots/` directory
- [ ] Update `/public/manifest.json` with screenshot paths
- [ ] Test manifest in Chrome DevTools
- [ ] Run Lighthouse PWA audit
- [ ] Verify screenshots appear in install prompt
- [ ] Check file sizes (< 1MB each)
- [ ] Commit and deploy to production

---

## Quick Start Checklist

**Today (30 minutes)**:
1. ✅ Create `/public/screenshots/` directory
2. ✅ Read this guide
3. ⏳ Set up browser for 540x960 screenshots
4. ⏳ Take 8 mobile screenshots
5. ⏳ Update manifest.json
6. ⏳ Test in DevTools

**This Week**:
1. ⏳ Generate desktop screenshots
2. ⏳ Optimize image sizes
3. ⏳ Deploy to production
4. ⏳ Submit to app stores

---

## Resources

- [PWA Screenshots Spec](https://www.w3.org/TR/appmanifest/#screenshots-member)
- [Google Play Store Assets](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Apple App Store Screenshots](https://developer.apple.com/app-store/product-page/)
- [Playwright Documentation](https://playwright.dev/)

---

**Generated**: December 27, 2025  
**Version**: 1.0  
**Status**: Ready for implementation
