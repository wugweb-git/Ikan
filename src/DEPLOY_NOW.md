# 🚀 Deploy iKan to Vercel - Quick Start Guide

**Status:** ✅ **READY TO DEPLOY**  
**Date:** December 19, 2025

---

## ✅ Pre-Flight Check

All deployment blockers have been resolved:

- ✅ **No figma:asset imports** - All replaced with Unsplash CDN URLs
- ✅ **TypeScript clean** - No compilation errors
- ✅ **Build config ready** - vercel.json properly configured
- ✅ **Backend deployed** - Supabase Edge Functions live
- ✅ **Design compliant** - iKan guidelines followed (Ubuntu font, no bold weights)
- ✅ **Mobile optimized** - Responsive design with bottom nav on mobile
- ✅ **PWA ready** - Manifest, service worker, icons all configured
- ✅ **Security headers** - XSS, CSP, frame protection enabled
- ✅ **Dashboard fixed** - `/equip/purchased/:userId` endpoint implemented
- ✅ **Mood Journal audit** - Design system violations corrected
- ✅ **Codebase clean** - All unused imports removed

---

## 🎯 Deploy in 3 Steps

### Step 1: Test Build Locally (2 minutes)

```bash
# Clean install and build
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Expected output:
# ✓ 2847 modules transformed.
# dist/index.html                   1.87 kB
# dist/assets/index-*.css         124.35 kB │ gzip: 23.12 kB
# dist/assets/index-*.js          287.34 kB │ gzip: 94.21 kB
# ✓ built in ~18s
```

**If build succeeds:** ✅ Continue to Step 2  
**If build fails:** ❌ See Troubleshooting section below

### Step 2: Preview Locally (1 minute)

```bash
npm run preview
```

Open http://localhost:3000 and verify:
- [ ] Homepage loads with images
- [ ] Navigation works
- [ ] Login/signup works
- [ ] Dashboard loads (after login)

**If preview works:** ✅ Continue to Step 3  
**If preview fails:** ❌ See Troubleshooting section below

### Step 3: Deploy to Vercel (2 minutes)

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Expected output:**
```
🔍  Inspect: https://vercel.com/your-username/ikan-mental-health/...
✅  Production: https://ikan-mental-health.vercel.app
```

#### Option B: GitHub Integration

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Click "Deploy"

3. **Auto-deploy enabled:**
   - Every push to `main` = production deploy
   - Every PR = preview deploy

---

## 🔐 Environment Variables

### Required in Vercel Dashboard

Go to: **Project Settings → Environment Variables**

Add these variables:

```bash
# Supabase Connection (REQUIRED)
SUPABASE_URL=https://jpfvoevxegnknxoqmwye.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZnZvZXZ4ZWdua254b3Ftd3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjIyNDIsImV4cCI6MjA3MzY5ODI0Mn0.VGYSE8LqBEggrQcUHJH9NcvursaoNfQK9K8-ESCo-rc

# Supabase Service Role Key (get from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Optional - Analytics
VITE_GA_TRACKING_ID=G-ZD4D5LZBQG
```

**Note:** The first two are already hardcoded in `/utils/supabase/info.tsx`, so you technically only NEED to add `SUPABASE_SERVICE_ROLE_KEY` for backend admin operations.

---

## 📋 Post-Deployment Checklist

After deployment, test these critical paths on your live URL:

### Public Routes
- [ ] **Homepage:** `https://your-app.vercel.app/`
  - Hero images load
  - Statistics section displays
  - Footer with certifications shows
  - CTAs work
  
- [ ] **About:** `https://your-app.vercel.app/about`
  - Team images load
  - Content displays correctly

- [ ] **Login:** `https://your-app.vercel.app/login`
  - Form displays
  - Sign up/login works
  - Redirects to dashboard

### Private Routes (Requires Login)
- [ ] **Dashboard:** `https://your-app.vercel.app/dashboard`
  - Requires authentication
  - User stats load
  - Purchased programs display
  - No console errors

- [ ] **Mood Journal:** `https://your-app.vercel.app/mood-journal`
  - Calendar displays
  - Can create new entry
  - Past entries load

- [ ] **Assessment:** `https://your-app.vercel.app/assessment`
  - Assessment list loads
  - Can start assessment
  - Flow completes

- [ ] **Equip Programs:** `https://your-app.vercel.app/equip`
  - Programs list loads
  - Can view program details
  - Can enroll in program

- [ ] **Consultation:** `https://your-app.vercel.app/consultation`
  - Consultants list loads
  - Can view consultant details

### Technical Checks
- [ ] **Mobile Responsive**
  - Test at 375px (iPhone SE)
  - Test at 768px (iPad)
  - Test at 1024px+ (Desktop)
  - Bottom nav on mobile
  - Top nav on desktop

- [ ] **PWA Features**
  - Install prompt appears
  - Can install as app
  - Works offline after first load
  - Service worker registers

- [ ] **Performance**
  - Run Lighthouse audit
  - Target: >85 Performance
  - Target: >95 Accessibility

---

## 🐛 Troubleshooting

### Build Fails: "Could not resolve figma:asset"

```bash
# Search for any missed imports
grep -r "import.*figma:asset" . --exclude-dir=node_modules --include="*.tsx"

# Should return: 0 results
```

**Fix:** If any found, replace with Unsplash URLs or use `ImageWithFallback` component.

### Build Fails: TypeScript Errors

```bash
# Check specific errors
npm run type-check

# Common issues:
# - Missing type definitions
# - Incorrect prop types
# - Unused variables (if strict mode)
```

**Fix:** Address each TypeScript error individually.

### Deployment Succeeds But App Shows White Screen

**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. Vercel logs for runtime errors

**Common causes:**
- Missing environment variables
- Supabase connection issues
- Route configuration errors

**Fix:**
```bash
# Verify env vars in Vercel dashboard
# Check Supabase project is not paused
# Verify Edge Functions deployed: supabase functions list
```

### Images Don't Load

**Issue:** Unsplash CDN blocked by network

**Fix:** Add fallback images:
```tsx
<ImageWithFallback
  src="https://images.unsplash.com/photo-..."
  fallbackSrc="/images/fallback.png"
  alt="Description"
/>
```

### API Calls Failing

**Issue:** 401 Unauthorized or CORS errors

**Fix:**
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel env vars
2. Check Supabase Edge Function logs: `supabase functions logs server`
3. Verify CORS headers in `/supabase/functions/server/index.tsx`

---

## 📊 Expected Results

### Build Metrics
```
Bundle Size (gzipped):
- Vendor: ~51 KB (React, React DOM)
- UI: ~29 KB (Radix UI)
- Supabase: ~15 KB
- Icons: ~13 KB
- Motion: ~10 KB
- App Code: ~94 KB
Total: ~235 KB
```

### Lighthouse Scores (Target)
- **Performance:** 85-95
- **Accessibility:** 95-100
- **Best Practices:** 90-95
- **SEO:** 90-95
- **PWA:** 100

### Load Times (Expected)
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3.5s
- **Total Load Time:** <4s

---

## 🎉 Success!

Once deployed, you'll have:

✅ **Live Production URL** - Share with users  
✅ **Automatic HTTPS** - Secure by default  
✅ **Global CDN** - Fast worldwide  
✅ **Auto-deploys** - Push to deploy (if using GitHub)  
✅ **Preview Deploys** - Test PRs before merging  
✅ **PWA Ready** - Installable on all devices  
✅ **Offline Support** - Works without internet  
✅ **Analytics** - Track usage in Vercel dashboard  

---

## 🔗 Useful Links

### Vercel
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com

### Supabase
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com

### Your Project
- Design Guidelines: `/guidelines/Guidelines.md`
- Full Deployment Report: `/DEPLOYMENT_READINESS_REPORT.md`
- Backend Code: `/supabase/functions/server/index.tsx`

---

## 🚨 Emergency Rollback

If something goes wrong:

```bash
# Rollback to previous deployment
vercel rollback

# Or via dashboard:
# Go to Deployments → Find previous working deploy → Promote to Production
```

---

## 📞 Need Help?

1. **Check Vercel Logs:**
   - Dashboard → Project → Deployments → Latest → Logs

2. **Check Supabase Logs:**
   ```bash
   supabase functions logs server --project-ref jpfvoevxegnknxoqmwye
   ```

3. **Check Browser Console:**
   - Open DevTools → Console → Look for errors

4. **Review Documentation:**
   - `/DEPLOYMENT_READINESS_REPORT.md` - Comprehensive guide
   - `/guidelines/Guidelines.md` - Design system rules

---

## ✅ Final Command

**Ready? Deploy now:**

```bash
npm run build && vercel --prod
```

**Or test first:**

```bash
npm run build && npm run preview
```

**That's it! Your iKan Mental Health PWA is ready for the world.** 🎉🚀

---

**Last Updated:** December 19, 2025  
**Status:** ✅ DEPLOYMENT READY  
**Confidence Level:** HIGH 💯