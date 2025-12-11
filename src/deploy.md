# 🚀 iKan Mental Health PWA - Supabase Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ Node.js 18+ installed
- ✅ Git repository set up
- ✅ Supabase project created (Project ID: `jpfvoevxegnknxoqmwye`)

## 🔧 Step 1: Install Dependencies

```bash
npm install
```

## 🏗️ Step 2: Deploy Edge Functions

Deploy the backend server function to Supabase:

```bash
# Deploy the server function
supabase functions deploy server --no-verify-jwt

# Verify deployment
supabase functions logs server
```

## 🗄️ Step 3: Initialize Database & Sample Data

Initialize the database schema and populate with sample data:

```bash
# Health check
npm run health:check

# Initialize sample data
npm run init:data
```

## 🌐 Step 4: Build & Deploy Frontend

### Option A: Supabase Hosting (Recommended)

```bash
# Build the app
npm run build

# Deploy to Supabase hosting
npx supabase domains create --project-ref jpfvoevxegnknxoqmwye

# Upload built files
npx supabase storage upload-folder dist public --project-ref jpfvoevxegnknxoqmwye
```

### Option B: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### Option C: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## 🔐 Step 5: Environment Configuration

Ensure these environment variables are set in your hosting platform:

```env
VITE_SUPABASE_URL=https://jpfvoevxegnknxoqmwye.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For Supabase Functions
SUPABASE_URL=https://jpfvoevxegnknxoqmwye.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

## 🧪 Step 6: Test Deployment

### Test the API endpoints:

```bash
# Health check
curl -X GET https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/health

# Test user signup
curl -X POST https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

### Test the PWA:

1. ✅ **Offline functionality** - Disconnect internet and verify app still loads
2. ✅ **Push notifications** - Test notification prompts
3. ✅ **Installation** - Verify "Add to Home Screen" works
4. ✅ **Performance** - Run Lighthouse audit (should score 90+)
5. ✅ **Responsiveness** - Test on mobile and desktop

## 🔄 Step 7: Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy iKan PWA

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Supabase
        run: |
          npm install -g supabase
          supabase functions deploy server --no-verify-jwt
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 📱 Step 8: PWA Configuration

### Enable HTTPS
- ✅ Ensure your domain uses HTTPS (required for PWA features)
- ✅ Configure SSL certificates

### Add to App Stores (Optional)
- **Google Play Store**: Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
- **Apple App Store**: Use [PWABuilder](https://www.pwabuilder.com/)

## 🔍 Step 9: Monitoring & Analytics

### Set up monitoring:

1. **Supabase Dashboard** - Monitor API usage and errors
2. **Sentry** - Error tracking and performance monitoring
3. **Google Analytics** - User behavior and engagement
4. **Web Vitals** - Core web vitals monitoring

## 🚨 Step 10: Crisis Resource Compliance

Ensure crisis resources are always available:

```bash
# Test offline crisis resources
curl -X GET https://your-domain.com/crisis-resources.json
```

## 📋 Deployment Checklist

- [ ] Edge functions deployed and working
- [ ] Database schema initialized
- [ ] Sample data populated
- [ ] Frontend built and deployed
- [ ] HTTPS enabled
- [ ] PWA manifest valid
- [ ] Service worker registered
- [ ] Offline functionality tested
- [ ] Push notifications configured
- [ ] Crisis resources accessible offline
- [ ] Performance optimized (Lighthouse score 90+)
- [ ] Cross-browser compatibility tested
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags configured
- [ ] Analytics tracking enabled

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: Check that the edge function has proper CORS headers
2. **Auth Issues**: Verify JWT tokens and service role key
3. **PWA Not Installing**: Check manifest.json and HTTPS
4. **Offline Issues**: Verify service worker registration
5. **Performance Issues**: Check bundle size and lazy loading

### Support Commands:

```bash
# Check function logs
supabase functions logs server

# Check function status
supabase functions list

# Reset database (DEV ONLY)
supabase db reset

# Check build size
npm run build && du -sh dist/
```

## 🎉 Success!

Your iKan Mental Health PWA is now deployed and ready to help users on their mental wellness journey!

**Live URLs:**
- 🌐 **Frontend**: https://your-domain.com
- 🔧 **API**: https://jpfvoevxegnknxoqmwye.supabase.co/functions/v1/make-server-cc205da9
- 📊 **Dashboard**: https://supabase.com/dashboard/project/jpfvoevxegnknxoqmwye

## 🔄 Next Steps

1. **Monitor Usage** - Track user engagement and app performance
2. **Gather Feedback** - Collect user feedback for improvements  
3. **Iterate Features** - Add new mental health tools and resources
4. **Scale Infrastructure** - Optimize for increased user load
5. **Marketing** - Promote the PWA to your target audience

---

💡 **Need help?** Check the Supabase documentation or create an issue in the repository.