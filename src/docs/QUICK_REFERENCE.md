# iKan PWA - Quick Reference Card

**Last Updated:** October 16, 2025

---

## 🚨 MUST RUN BEFORE PRODUCTION

```bash
# 1. Accessibility Audit (CRITICAL)
npm run audit:accessibility

# 2. TypeScript Check (HIGH)
npx tsc --noEmit

# 3. Import Cleanup (HIGH)
npm run audit:imports
```

---

## 📁 Key Documentation

| File | Purpose |
|------|---------|
| `/docs/CRITICAL_NEXT_ACTIONS.md` | Detailed action plan |
| `/docs/CONTINUATION_COMPLETE_SUMMARY.md` | What was completed |
| `/docs/PHASE_1_2_3_4_COMPLETION_REPORT.md` | Previous fixes |
| `/guidelines/Guidelines.md` | Design system rules |
| `/.env.example` | Environment template |

---

## 🎨 Design System Rules

### Typography
```typescript
// Body copy
fontWeight: 'var(--font-weight-regular)' // 400

// Titles/Headings
fontWeight: 'var(--font-weight-medium)' // 500

// NEVER use 600 or 700
```

### Components
```typescript
// All buttons
height: 'var(--ikan-component-button-height)' // 48px

// All inputs
height: 'var(--ikan-component-input-height)' // 48px

// Border radius
borderRadius: 'var(--ikan-component-border-radius)' // 6px
```

### Import Paths
```typescript
// ✅ Use aliases
import { Component } from '@components/Component';
import { useHook } from '@hooks/useHook';
import { util } from '@lib/util';

// ❌ Avoid relative paths
import { Component } from '../../components/Component';
```

---

## 🐛 Common Issues & Fixes

### Memory Leaks (setTimeout/setInterval)
```typescript
// ❌ Memory leak risk
useEffect(() => {
  setTimeout(() => setState(value), 1000);
}, [value]);

// ✅ Safe with cleanup
import { useCleanupEffect } from '@hooks/useCleanupEffect';

useCleanupEffect((cleanup) => {
  cleanup.addTimeout(setTimeout(() => {
    if (cleanup.isMounted()) {
      setState(value);
    }
  }, 1000));
}, [value]);
```

### TypeScript `any` Types
```typescript
// ❌ Avoid
session: any;

// ✅ Use proper types
import { Session } from '@supabase/supabase-js';
session: Session | null;
```

### Console Statements
```typescript
// ❌ Don't use
console.log('message');

// ✅ Use logger
import { logger } from '@lib/logger';
logger.log('message'); // Dev only
logger.warn('warning'); // Always
logger.error('error');  // Always
```

---

## 🔧 Development Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Run audits
npm run audit:accessibility
npm run audit:imports
```

---

## 🎯 File Structure

```
/
├── App.tsx                    # Main app component
├── components/
│   ├── buttons/              # Button components
│   ├── inputs/               # Input components
│   ├── navigation/           # Nav components
│   ├── screens/              # Page screens
│   └── ui/                   # Shadcn components
├── contexts/                 # React contexts
├── hooks/                    # Custom hooks
├── lib/                      # Utilities
├── styles/                   # Global CSS
├── docs/                     # Documentation
└── guidelines/               # Design guidelines
```

---

## 📦 Environment Setup

1. Copy template:
```bash
cp .env.example .env
```

2. Add your values:
```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Restart dev server:
```bash
npm run dev
```

---

## 🚀 Deployment Checklist

### Before Deploy:
- [ ] Run accessibility audit
- [ ] Fix TypeScript errors
- [ ] Clean up unused imports
- [ ] Test all user journeys
- [ ] Verify PWA installation
- [ ] Test offline mode
- [ ] Check crisis support button

### Build:
```bash
npm run build
ls -lh dist/assets/  # Check size
npm run preview      # Test build
```

---

## 🔍 Quick Searches

```bash
# Find relative imports
grep -r "from '\.\." --include="*.tsx" components/

# Find console statements
grep -r "console\." --include="*.tsx" .

# Find hardcoded heights
grep -r "height: '48px'" --include="*.tsx" components/

# Find any types
grep -r ": any" --include="*.tsx" --include="*.ts" .
```

---

## 📞 Get Help

**Documentation:**
- `/docs/CRITICAL_NEXT_ACTIONS.md` - What to do next
- `/guidelines/Guidelines.md` - Design rules

**Scripts:**
- `/scripts/accessibility-audit.ts` - A11y checks
- `/scripts/cleanup-unused-imports.ts` - Import cleanup

**Hooks:**
- `/hooks/useCleanupEffect.ts` - Memory-safe effects
- `/hooks/useIsMobile.ts` - Mobile detection

---

## ⚡ Quick Tips

1. **Always** use design tokens (CSS variables)
2. **Never** use font weights 600 or 700
3. **Always** clean up useEffect timers
4. **Prefer** @aliases over relative imports
5. **Use** logger instead of console
6. **Run** accessibility audit before production
7. **Test** PWA installation on real devices
8. **Verify** offline mode works

---

## 🎨 Code Style

```typescript
// Component structure
import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@components/Icon';
import { logger } from '@lib/logger';

interface ComponentProps {
  // Props here
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  
  return (
    <div
      style={{
        height: 'var(--ikan-component-button-height)',
        borderRadius: 'var(--ikan-component-border-radius)',
        fontWeight: 'var(--font-weight-medium)'
      }}
    >
      {/* Component JSX */}
    </div>
  );
}
```

---

## 📊 Status at a Glance

| Area | Status | Action |
|------|--------|--------|
| Font weights | ✅ Resolved | Follow Guidelines.md |
| GitHub config | ✅ Fixed | No action needed |
| Documentation | ✅ Organized | Use /docs/ |
| Accessibility | ❌ Not audited | **RUN AUDIT** |
| TypeScript | ⚠️ Unknown | **RUN CHECK** |
| Imports | ⚠️ Bloated | **RUN CLEANUP** |
| Design tokens | ✅ Verified | All good |
| Logger | ✅ Migrated | All good |

---

**Print this card and keep it handy!** 📋

---

*Generated: October 16, 2025*
