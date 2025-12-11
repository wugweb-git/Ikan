# Code Quality Migration Summary

**Date:** October 16, 2025  
**Status:** IN PROGRESS

## Console.* to Logger.* Migration

### Migration Strategy

Due to the large number of console statements (200+ across the codebase), we're using a tiered migration approach:

### Tier 1: Critical Files (MANUAL MIGRATION RECOMMENDED)
These files have complex console override patterns and need careful manual review:

1. **App.tsx** (48+ statements)
   - Has console.error/warn override patterns
   - Needs special handling for originalConsoleError/Warn
   - Status: Logger imported, needs systematic replacement

2. **contexts/AuthContext.tsx**
   - Authentication logging
   - Security-sensitive logs
   - Status: NOT STARTED

3. **lib/api-client.ts** (40+ statements)
   - API request/response logging
   - Error handling logs
   - Status: NOT STARTED

### Tier 2: Backend/Utility Files (BATCH MIGRATION)
Can use automated script:

4. **lib/assessment-seeder.ts** (17 statements)
5. **lib/database-sync.ts** (15 statements)
6. **lib/offline-fallbacks.ts** (2 statements)
7. **lib/utils.ts** (10 statements)

### Tier 3: Import Files (LOW PRIORITY)
These are Figma imports and rarely changed:

- `/imports/Footer-*.tsx` (2 statements total)

---

## Migration Pattern

### Standard Replacement
```typescript
// Before:
console.log('Message');
console.warn('Warning');
console.error('Error');

// After:
import { logger } from '@lib/logger';
logger.log('Message');
logger.warn('Warning');
logger.error('Error');
```

### Special Case: Console Overrides (App.tsx lines 492-524)
```typescript
// KEEP THESE AS console.*
const originalConsoleError = console.error;  // NOT logger.error
const originalConsoleWarn = console.warn;    // NOT logger.warn

console.error = (...args) => {  // NOT logger.error =
  // ... suppression logic ...
};

console.warn = (...args) => {   // NOT logger.warn =
  // ... suppression logic ...
};
```

---

## Progress Tracker

### Files Migrated: 0/7
- [ ] App.tsx (0/48 statements)
- [ ] contexts/AuthContext.tsx
- [ ] lib/api-client.ts
- [ ] lib/assessment-seeder.ts
- [ ] lib/database-sync.ts
- [ ] lib/offline-fallbacks.ts
- [ ] lib/utils.ts

### Total Statements Migrated: 1/200+
- ✅ App.tsx line 115 (initial test)
- ⏳ Remaining: 199+

---

## Recommended Approach

### Option A: Manual Migration (SAFER)
1. Open each file in Tier 1
2. Add `import { logger } from '@lib/logger';`
3. Find/Replace: `console.log(` → `logger.log(`
4. Find/Replace: `console.warn(` → `logger.warn(`
5. Find/Replace: `console.error(` → `logger.error(`
6. Review special cases (console overrides)
7. Test functionality

### Option B: Script Migration (FASTER but needs review)
1. Run `/scripts/migrate-console-to-logger.ts`
2. Review all changes
3. Fix special cases manually
4. Test functionality

---

## Testing Checklist

After migration, verify:
- [ ] No console.* calls in production build (except overrides)
- [ ] Logs appear in browser console during development
- [ ] Logs are suppressed in production (unless errors)
- [ ] No runtime errors from logger usage
- [ ] Auth flows still work
- [ ] API calls still work
- [ ] Error handling still works

---

## Blocked Issues

**Issue:** Large number of replacements needed  
**Solution:** Use batch script + manual review for critical files

**Issue:** Console override patterns in App.tsx  
**Solution:** Keep override patterns as `console.*`, only migrate regular logging

---

## Next Steps

1. Complete App.tsx migration manually (highest priority)
2. Run script for Tier 2 files
3. Test all major user flows
4. Commit with descriptive message
5. Update this document with final counts

