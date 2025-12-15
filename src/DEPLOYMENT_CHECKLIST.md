# Vercel Deployment Checklist

**Target:** Deploy iKan Mental Health PWA to Vercel  
**Status:** 🚨 **BLOCKED** - Figma asset dependencies

---

## Critical Blocker: Figma Assets

### ❌ Problem
- **50+ `figma:asset` imports** will fail on Vercel
- These are Figma Make-specific virtual imports
- No physical image files in repository

### ✅ Solutions (Choose One)

#### Option A: Quick Deploy with Placeholders (30 mins)

**Use this to deploy NOW with temporary images:**

```bash
# 1. Analyze current assets
npx tsx scripts/analyze-figma-assets.ts

# 2. Review the report
cat FIGMA_ASSET_REPORT.json

# 3. Replace with placeholders (dry-run first)
npx tsx scripts/replace-with-placeholders.ts --dry-run

# 4. Apply changes
npx tsx scripts/replace-with-placeholders.ts

# 5. Manually update component code to use placeholders
# (Follow instructions from script output)

# 6. Test build
npm run build

# 7. Deploy to Vercel
vercel --prod
```

**Result:** ✅ Deployed, but with placeholder images

---

#### Option B: Full Asset Migration (2-3 hours)

**Use this for production-quality deployment:**

1. **Export assets from Figma Make**
   - Check for build output directory
   - Look for `/assets/` or similar folder
   - Download all PNG files

2. **Organize assets**
   ```bash
   mkdir -p public/images
   # Move all exported PNGs to public/images/
   ```

3. **Create asset mapping**
   ```bash
   npx tsx scripts/analyze-figma-assets.ts
   # Use the generated ASSET_MAP
   ```

4. **Replace imports**
   - Update each file manually OR
   - Create a script using the generated mapping

5. **Test build**
   ```bash
   npm run build
   ```

6. **Deploy**
   ```bash
   vercel --prod
   ```

**Result:** ✅ Deployed with original design assets

---

## Pre-Deployment Checklist

### 1. Frontend Build ✅

- [x] TypeScript compilation clean
- [x] Accessibility compliant
- [x] Newsletter integrated
- [ ] **Figma assets resolved** ❌ BLOCKER
- [x] Vite config ready
- [x] PWA manifest configured

### 2. Backend (Supabase) ✅

- [x] Edge function deployed
- [x] KV store initialized
- [x] Newsletter endpoint working
- [x] Auth configured
- [x] CORS enabled
- [x] Environment variables set

### 3. Environment Variables

**Already configured in Supabase:**
- [x] `SUPABASE_URL`
- [x] `SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `SUPABASE_DB_URL`

**Need to set in Vercel:**
```bash
# These are for frontend access
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Vercel Configuration

**Create `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 5. Build Test

**Before deploying, test locally:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Build
npm run build

# Preview production build
npm run preview

# Open http://localhost:3000
# Test all critical flows
```

### 6. Deployment Commands

**Initial Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Environment Variables:**

```bash
# Set in Vercel dashboard OR via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

---

## Post-Deployment Verification

### 1. Critical Paths to Test

- [ ] Homepage loads
- [ ] User signup/login
- [ ] Dashboard renders
- [ ] Mood tracking works
- [ ] Newsletter signup works
- [ ] Assessment flow
- [ ] Equip programs display
- [ ] Footer/navigation work
- [ ] PWA install prompt
- [ ] Offline mode

### 2. Performance Checks

```bash
# Lighthouse audit
npx lighthouse https://your-app.vercel.app --view

# Check bundle size
npm run build
# Review dist/ folder sizes
```

**Targets:**
- [ ] Performance: >90
- [ ] Accessibility: 100 ✅
- [ ] Best Practices: >90
- [ ] SEO: >90
- [ ] PWA: 100

### 3. Browser Testing

- [ ] Chrome (Desktop & Mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge

### 4. PWA Installation

**iOS:**
- [ ] Safari > Share > Add to Home Screen
- [ ] App icon displays
- [ ] Launches in standalone mode
- [ ] Splash screen shows

**Android:**
- [ ] Chrome > Install app prompt
- [ ] App icon on home screen
- [ ] Standalone mode works
- [ ] Offline functionality

---

## Rollback Plan

If deployment fails:

1. **Vercel Dashboard:**
   - Go to Deployments
   - Find last working deployment
   - Click "Promote to Production"

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

3. **Emergency:**
   - Delete project from Vercel
   - Redeploy from scratch

---

## Known Limitations

### Current Deployment Blockers:

1. ❌ **Figma Assets** - 50+ imports need fixing
   - Priority: CRITICAL
   - Time: 30 mins (placeholders) or 2-3 hours (real assets)

### Non-Blocking (Can Deploy With):

2. ⚠️ **Unused Imports** - Bundle optimization pending
   - Priority: LOW
   - Impact: ~200KB bundle size increase
   - Action: Run `npm run audit:imports` post-deploy

3. ⚠️ **Manual E2E Testing** - Not automated
   - Priority: MEDIUM
   - Action: Test manually after deploy

---

## Deployment Timeline

### Option A: Quick Deploy (Placeholders)

```
┌─────────────────────────┬──────────┐
│ Task                    │ Duration │
├─────────────────────────┼──────────┤
│ Run asset analyzer      │ 5 mins   │
│ Replace with placeholders│ 10 mins  │
│ Update component code   │ 15 mins  │
│ Test build locally      │ 5 mins   │
│ Deploy to Vercel        │ 5 mins   │
│ Post-deploy testing     │ 15 mins  │
├─────────────────────────┼──────────┤
│ TOTAL                   │ 55 mins  │
└─────────────────────────┴──────────┘
```

### Option B: Full Migration (Real Assets)

```
┌─────────────────────────┬──────────┐
│ Task                    │ Duration │
├─────────────────────────┼──────────┤
│ Export assets from Figma│ 30 mins  │
│ Organize & rename files │ 30 mins  │
│ Update all imports      │ 60 mins  │
│ Test build locally      │ 10 mins  │
│ Deploy to Vercel        │ 5 mins   │
│ Post-deploy testing     │ 15 mins  │
├─────────────────────────┼──────────┤
│ TOTAL                   │ 2.5 hrs  │
└─────────────────────────┴──────────┘
```

---

## Support Resources

### Vercel Documentation
- [Deploying Vite](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

### Supabase Integration
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/platform/vercel)
- [Edge Functions](https://supabase.com/docs/guides/functions)

### PWA
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Best Practices](https://web.dev/service-worker-lifecycle/)

---

## Decision Required

**What do you want to do?**

### Choice 1: Quick Deploy (Recommended for testing)
```bash
npx tsx scripts/analyze-figma-assets.ts
# Follow Option A steps above
```
- ✅ Deploy in 1 hour
- ⚠️ Placeholder images
- ✅ Test backend/features
- 🔄 Replace images later

### Choice 2: Full Migration (Recommended for production)
```bash
# First, check if assets exist
find . -name "*.png" -size +10k | grep -v node_modules
# Then follow Option B steps above
```
- ⏰ Takes 2-3 hours
- ✅ Production-ready
- ✅ Original design fidelity
- ✅ One-time setup

### Choice 3: Help Me Decide
**Answer these questions:**
1. Do you have access to export assets from Figma Make?
2. Is this a production launch or staging/testing?
3. How critical is exact visual fidelity?
4. What's your deployment deadline?

---

**Last Updated:** December 12, 2025  
**Status:** Awaiting decision on Figma asset resolution
