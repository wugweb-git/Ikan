# 🚨 CRITICAL: Vercel Deployment Blocker

**Status:** ❌ **CANNOT DEPLOY TO VERCEL** - Build will fail

---

## Problem: Figma Asset Import Dependency

Your app has **50+ `figma:asset` imports** that will **fail on Vercel**.

### What is `figma:asset`?

`figma:asset` is a **virtual import scheme** provided by **Figma Make's development environment**. It's NOT a standard Vite feature.

```tsx
// ❌ This will FAIL on Vercel
import imgHero from "figma:asset/48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png";
```

---

## Affected Files (8 files)

| File | Imports |
|------|---------|
| `/components/screens/homepage/HeroSection.tsx` | 12 images |
| `/components/screens/AboutUs.tsx` | 15 images |
| `/components/Footer.tsx` | 6 images |
| `/components/navigation/TopNavBar.tsx` | 1 image |
| `/components/screens/homepage/MissionSection.tsx` | 1 image |
| `/components/screens/homepage/TestimonialSection.tsx` | 1 image |
| `/imports/02Dashboard.tsx` | 1 image |
| `/imports/05EquipsLp-204-5204.tsx` | 13 images |

**Total:** ~50 `figma:asset` imports

---

## Why It Will Fail on Vercel

1. **No Vite Plugin:** Your `vite.config.ts` has NO plugin to resolve `figma:asset`
2. **No Physical Files:** The images are not committed to your repo
3. **Virtual Scheme:** `figma:asset` is Figma Make-specific, not a web standard
4. **Build Error:** Vite will throw: `Failed to resolve import "figma:asset/..."`

---

## Solution Options

### Option 1: ✅ **Extract Assets from Figma Make** (Recommended)

1. **Export the images:**
   - Check if Figma Make provides a way to export all assets
   - Look for a `/public/assets/` or `/src/assets/` directory
   - Download images from Figma Make's build artifacts

2. **Store in `/public/images/`:**
   ```
   /public/images/
     ├── hero-bg.png
     ├── mission-video-thumb.png
     ├── testimonial-avatar.png
     └── ...
   ```

3. **Update imports:**
   ```tsx
   // ❌ Before
   import imgHero from "figma:asset/48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png";
   
   // ✅ After
   const imgHero = "/images/hero-bg.png";
   // OR
   import imgHero from "/images/hero-bg.png?url";
   ```

4. **Time:** 2-3 hours (semi-automated)

---

### Option 2: ⚠️ **Replace with Unsplash/Placeholder Images**

If you can't extract the Figma assets:

1. **Identify image purpose** from component context
2. **Use Unsplash API** to find similar images
3. **Replace all 50 imports**

**Pros:**
- No dependency on Figma Make
- Fresh, high-quality images

**Cons:**
- Loses original design fidelity
- Time-consuming (4-6 hours)
- May not match original design

---

### Option 3: 🔧 **Create Vite Plugin** (Advanced)

Create a custom Vite plugin to handle `figma:asset`:

```typescript
// vite-plugin-figma-assets.ts
import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function figmaAssetsPlugin(): Plugin {
  return {
    name: 'vite-plugin-figma-assets',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        // Map to actual file in /public/images/
        const hash = id.replace('figma:asset/', '');
        return path.resolve(__dirname, `public/images/${hash}`);
      }
    }
  };
}
```

**Still requires:** Exporting images from Figma Make first.

---

## Recommended Workflow

### Step 1: Check Figma Make Export

**Look for:**
- Build output directory with actual `.png` files
- Asset export feature in Figma Make
- Hidden `/assets/` or `/figma-assets/` directory

**Where to check:**
```bash
# Check if assets exist anywhere
find . -name "48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png"
find . -name "*.png" | grep -v node_modules
```

### Step 2: If Assets Found

1. Move all to `/public/images/`
2. Create a script to update imports:

```typescript
// scripts/fix-figma-imports.ts
import fs from 'fs';
import path from 'path';

const ASSET_MAP = {
  '48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png': 'hero-bg.png',
  '3772e90563daca3ef206a824f43457199d087a9c.png': 'hero-bg-2.png',
  // ... map all 50 hashes to readable names
};

// Scan all .tsx files and replace imports
```

### Step 3: If Assets NOT Found

You'll need to:
1. Take screenshots of each component in Figma Make
2. Use image placeholders
3. Manually replace each import

---

## Files That Need Fixing

### High Priority (User-Facing)

| File | Images | Impact |
|------|--------|--------|
| `HeroSection.tsx` | 12 | **CRITICAL** - Homepage hero |
| `AboutUs.tsx` | 15 | **HIGH** - About page |
| `Footer.tsx` | 6 | **HIGH** - Every page |
| `TopNavBar.tsx` | 1 | **HIGH** - Avatar image |
| `MissionSection.tsx` | 1 | **MEDIUM** - Video thumbnail |
| `TestimonialSection.tsx` | 1 | **MEDIUM** - Testimonial avatar |

### Low Priority (Unused Imports)

| File | Status |
|------|--------|
| `/imports/02Dashboard.tsx` | Unused component |
| `/imports/05EquipsLp-204-5204.tsx` | Unused import file |

---

## Alternative: Deploy Current Version

If you want to deploy **without images** temporarily:

### Quick Fix (30 mins)

Replace all `figma:asset` with `ImageWithFallback`:

```tsx
// Before
import imgHero from "figma:asset/48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png";
<img src={imgHero} alt="Hero" />

// After
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
<ImageWithFallback 
  src="https://placehold.co/1200x600/2A2A2A/FFFFFF?text=Hero+Image" 
  alt="Hero" 
  className="w-full h-auto"
/>
```

**Result:**
- ✅ App will build successfully
- ⚠️ Shows placeholder images
- 🚀 Can deploy to Vercel immediately

---

## What About SVG Imports?

**Good news:** SVG imports are FINE! ✅

```tsx
// ✅ This works on Vercel
import svgPaths from "./imports/svg-ul0k820b9n";
```

These are actual `.ts` files in `/imports/` that export SVG path data.

**No action needed for SVGs.**

---

## Vercel Build Command

Your current build command:

```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

**This WILL fail** with current `figma:asset` imports.

---

## Next Steps

### Immediate Action Required:

1. **Check for exported assets:**
   ```bash
   # In your project root
   find . -type f -name "*.png" -size +10k | grep -v node_modules
   ```

2. **If found:** Move to `/public/images/` and update imports

3. **If NOT found:** Choose Option 1, 2, or Quick Fix above

4. **Test build locally:**
   ```bash
   npm run build
   ```
   
   **Expected error:**
   ```
   ✘ [ERROR] Could not resolve "figma:asset/48e11de40959fcd87b5cb4a36ae60fedcaf97caf.png"
   ```

5. **Don't deploy to Vercel** until build succeeds locally

---

## Summary

| Issue | Status | Action |
|-------|--------|--------|
| `figma:asset` imports | ❌ Blocker | Replace with real files |
| SVG imports | ✅ OK | No action needed |
| Vite config | ✅ OK | No changes required |
| Dependencies | ✅ OK | All standard packages |
| Backend (Supabase) | ✅ OK | Already configured |

**Bottom Line:** You MUST fix the `figma:asset` imports before Vercel deployment.

---

## Questions to Answer

Before proceeding, determine:

1. ✅ Can you export assets from Figma Make?
2. ✅ Do you have access to the original Figma design files?
3. ✅ Is maintaining exact visual fidelity critical?
4. ✅ Can you deploy with placeholder images initially?

**Let me know which option you prefer, and I can help implement it.**

---

**Created:** December 12, 2025  
**Priority:** 🚨 **CRITICAL - DEPLOYMENT BLOCKER**
