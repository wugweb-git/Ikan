# Deployment Guide

This guide covers deploying the iKan Mental Health PWA to production environments.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ikan-mental-health-pwa)

### Option 2: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/ikan-mental-health-pwa)

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Supabase project created and configured
- [ ] Environment variables defined
- [ ] Supabase Edge Functions deployed
- [ ] Database initialized with sample data
- [ ] Push notification certificates configured (optional)

### Security Review
- [ ] All sensitive data properly encrypted
- [ ] Environment variables secured
- [ ] HTTPS enabled on all endpoints
- [ ] CORS policies configured correctly
- [ ] Crisis support features tested

### Performance Validation
- [ ] PWA audit score >90 on Lighthouse
- [ ] Bundle size optimized (<500KB initial)
- [ ] Images optimized and served via CDN
- [ ] Service worker caching configured
- [ ] Offline functionality verified

## 🔧 Environment Variables

### Required Variables

Create these environment variables in your hosting platform:

```bash
# Supabase (Client-side - safe to expose)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key

# API Configuration
VITE_API_BASE_URL=https://your_project_id.supabase.co/functions/v1/make-server-cc205da9

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Payment (Razorpay)
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Server-Side Variables (Supabase)

Configure these in your Supabase project:

```bash
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_database_url

# Optional: External APIs
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🏗️ Deployment Steps

### 1. Supabase Backend Setup

#### Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_id

# Deploy functions
supabase functions deploy server --no-verify-jwt

# Verify deployment
curl -X GET https://your_project_id.supabase.co/functions/v1/make-server-cc205da9/health \
  -H "Authorization: Bearer your_anon_key"
```

#### Initialize Database
```bash
# Initialize with sample data
curl -X POST https://your_project_id.supabase.co/functions/v1/make-server-cc205da9/init/sample-data \
  -H "Authorization: Bearer your_anon_key"
```

### 2. Frontend Deployment

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
# Site Settings > Environment Variables
```

#### Manual Build
```bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
```

## 🔧 Platform-Specific Configuration

### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
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
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Netlify Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

## 🔒 Security Configuration

### HTTPS Setup
- All deployments must use HTTPS
- Configure SSL certificates (usually automatic on Vercel/Netlify)
- Update all API endpoints to use HTTPS URLs

### Content Security Policy
Add CSP headers to prevent XSS attacks:

```javascript
// In your hosting platform's header configuration
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://js.stripe.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' https://*.supabase.co;
```

### Crisis Support Verification
Test that crisis support features work:
```bash
# Verify crisis endpoints
curl -X GET https://your-domain.com/crisis-support
curl -X GET https://your-domain.com/emergency-contacts
```

## 📊 Monitoring & Analytics

### Performance Monitoring
Set up monitoring for:
- **Core Web Vitals**: LCP, FID, CLS
- **PWA Performance**: Service worker errors, cache hits
- **API Response Times**: Backend function performance
- **Error Rates**: JavaScript errors, network failures

### Health Checks
Implement health check endpoints:
```bash
# Frontend health
curl https://your-domain.com/health

# Backend health  
curl https://your_project_id.supabase.co/functions/v1/make-server-cc205da9/health
```

### User Analytics (Optional)
If implementing analytics:
- Ensure GDPR compliance
- Use privacy-focused analytics
- Don't track sensitive mental health data
- Provide opt-out mechanisms

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
See `.github/workflows/ci.yml` for the complete CI/CD setup.

Key stages:
1. **Test**: Linting, type checking, build verification
2. **Security**: Vulnerability scanning
3. **Build**: Production build with environment variables
4. **Deploy**: Automatic deployment on main branch
5. **Verify**: Post-deployment health checks

### Automated Tests
```bash
# Run full test suite
npm run test

# PWA audit
npx lighthouse-ci autorun

# Accessibility testing
npm run test:a11y
```

## 🚨 Crisis Support Deployment

### Critical Requirements
- Crisis support features must work offline
- Emergency contact information must be accurate
- Backup crisis resources configured
- Test crisis flows in production

### Emergency Contacts Verification
```javascript
// Verify emergency contacts are accessible
const emergencyContacts = [
  { country: 'US', number: '988', name: 'Suicide & Crisis Lifeline' },
  { country: 'UK', number: '116 123', name: 'Samaritans' },
  // Add more as needed
];

// Test each contact is reachable and current
```

## 📱 PWA Deployment Considerations

### Service Worker
- Ensure service worker registers correctly
- Test caching strategies
- Verify offline functionality
- Check for service worker update mechanisms

### App Icons & Manifest
- All PWA icons generated and optimized
- Web app manifest configured correctly
- Splash screens for iOS and Android
- App store metadata prepared

### Push Notifications (Optional)
If enabling push notifications:
1. Configure Firebase Cloud Messaging or similar
2. Set up VAPID keys
3. Test notification delivery
4. Ensure user consent mechanisms

## 🔍 Post-Deployment Verification

### Functional Testing
- [ ] All routes load correctly
- [ ] Authentication works properly
- [ ] Database operations function
- [ ] Offline mode works
- [ ] PWA install prompt appears
- [ ] Crisis support accessible

### Performance Testing
- [ ] Lighthouse PWA audit score >90
- [ ] Initial load <3 seconds on 3G
- [ ] Time to Interactive <5 seconds
- [ ] Bundle size <500KB initial
- [ ] Service worker caches properly

### Security Testing
- [ ] HTTPS enforced everywhere
- [ ] Security headers present
- [ ] No sensitive data in client code
- [ ] Authentication required for protected routes
- [ ] Data encryption verified

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text for images

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit

# Verify environment variables
echo $VITE_SUPABASE_PROJECT_ID
```

#### Service Worker Issues
```bash
# Check service worker registration
console.log(navigator.serviceWorker.controller);

# Clear service worker cache
// In browser DevTools > Application > Service Workers > Unregister
```

#### Database Connection Issues
```bash
# Test backend connectivity
curl -X GET https://your_project_id.supabase.co/functions/v1/make-server-cc205da9/health

# Check Supabase dashboard for errors
# Project > Settings > API > Logs
```

### Rollback Procedure
1. Revert to previous deployment
2. Check database integrity
3. Verify crisis support functionality
4. Notify users if necessary
5. Investigate and fix issues
6. Re-deploy with fixes

## 📞 Support

### Deployment Support
- GitHub Issues for technical problems
- Supabase documentation for backend issues
- Hosting provider support for platform issues

### Mental Health Considerations
- Ensure crisis support remains functional during deployments
- Have backup crisis resources ready
- Test mental health features thoroughly
- Consider user safety in all deployment decisions

---

**Remember**: Mental health applications require extra care during deployment. Always verify that crisis support features work correctly in production before considering the deployment complete.