# iKan PWA - Contributing Guide

> **Last updated**: March 17, 2026
> **Audience**: All contributors

---

## Branch Strategy

```
main              # Production-ready code (auto-deploys to staging + prod)
develop           # Integration branch for feature work
feature/<name>    # Feature branches (branch from develop)
fix/<name>        # Bug fix branches
hotfix/<name>     # Urgent production fixes (branch from main)
```

### Workflow

1. Branch from `develop` for features, `main` for hotfixes
2. Make changes following the conventions below
3. Run `npm run type-check` and `npm run lint` locally
4. Open a PR to `develop` (or `main` for hotfixes)
5. CI pipeline runs: lint, type-check, build, security scan
6. Get code review from at least one team member
7. Merge via squash merge

---

## Code Conventions

### TypeScript

- **Strict mode** is enabled with `noUnusedLocals: true` and `noUnusedParameters: true`
- Every unused import, variable, or parameter will fail the build
- Use proper TypeScript interfaces for all props and data shapes
- Prefix unused but required parameters with `_` (e.g., `_event`)

### React Components

- **File naming**: PascalCase for components (`MyComponent.tsx`)
- **Export pattern**: Named exports preferred (not default exports, except `App.tsx`)
- **Props**: Define a `Props` or `ComponentNameProps` interface above the component
- **Directory**: Place new screen-level components in `/components/screens/`
- **Reusable UI**: Place shared components in `/components/blocks/` or `/components/ui/`

```tsx
// Example component structure
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### Styling

- Use Tailwind CSS classes (v4 syntax)
- Follow the design system in `/guidelines/Guidelines.md`
- **Font weights**: Only 400 (regular) and 500 (medium). NEVER use 600 or 700
- **Colors**: Use CSS variables from `/styles/globals.css`, not raw hex values
- **Spacing**: Use the 4px grid system (`p-4` = 16px, `gap-2` = 8px)
- **Responsive**: Mobile-first. Start with mobile layout, add `md:` and `lg:` breakpoints

### Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase | `AssessmentCard` |
| Files (components) | PascalCase | `AssessmentCard.tsx` |
| Files (utilities) | kebab-case | `date-utils.ts` |
| Props/variables | camelCase | `isLoading`, `handleClick` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_PUBLIC_ROUTE` |
| KV keys | snake_case with colon separator | `assessment_def:phq9` |
| CSS variables | kebab-case with `--` prefix | `--color-primary-default` |

---

## Auth Header Pattern

### Admin Components

All admin components that make API calls MUST use the user's actual JWT:

```tsx
import { supabase } from '../../lib/supabase-client';

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Usage:
const headers = await getAuthHeaders();
const response = await fetch(`${API_BASE}/admin/endpoint`, { headers });
```

### Non-Admin Components Using ApiClient

The `ApiClient` (`/lib/api-client.ts`) handles auth headers automatically. Prefer using it:

```tsx
import { apiClient } from '../lib/api-client';

const data = await apiClient.get('/some-endpoint');
const result = await apiClient.post('/some-endpoint', { key: 'value' });
```

### Common Mistake to Avoid

**DO NOT** use `publicAnonKey` as the Bearer token for routes that require `requireAdmin` middleware. This will result in a 401 error because the anon key is not a valid user JWT.

```tsx
// BAD - will fail on requireAdmin routes
headers['Authorization'] = `Bearer ${publicAnonKey}`;

// GOOD - uses the actual user session token
const { data } = await supabase.auth.getSession();
headers['Authorization'] = `Bearer ${data.session?.access_token}`;
```

---

## Mobile Responsiveness

Every admin table MUST have a **card-view alternative** for mobile screens. Use the pattern:

```tsx
const isMobile = useIsMobile();

return isMobile ? (
  <div className="space-y-3">
    {items.map(item => (
      <Card key={item.id}>
        {/* Mobile card layout */}
      </Card>
    ))}
  </div>
) : (
  <Table>
    {/* Desktop table layout */}
  </Table>
);
```

---

## Animation

- Import Motion from `motion/react` (NOT `framer-motion`)
- Use `AnimatePresence` for enter/exit animations
- Always respect `prefers-reduced-motion` via `useReducedMotion()`
- Keep animations purposeful (feedback, not decoration)

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Duration guidelines:
// Fast: 150ms (micro-interactions)
// Normal: 300ms (transitions)
// Slow: 500ms (complex animations)
```

---

## Toast Notifications

Use sonner v2.0.3:

```tsx
import { toast } from 'sonner';

toast.success('Saved successfully');
toast.error('Something went wrong');
```

Or use the notification context for more control:

```tsx
const { showToast } = useNotifications();
showToast('success', 'Title', 'Description');
```

---

## Adding a New Screen

1. Create the component in `/components/screens/MyScreen.tsx`
2. Add the route to the `validRoutes` array in `App.tsx` (`handleNavigate`)
3. Add a `RouteConfig` entry in `/lib/route-config.ts`
4. Add the lazy import in `App.tsx`
5. Add the route case in the screen rendering logic in `App.tsx`
6. If it needs navigation visibility, update `/lib/navigation.ts`

---

## Adding a New API Endpoint

1. Create or update a route module in `/supabase/functions/server/`
2. Use appropriate middleware (`requireAuth` or `requireAdmin`)
3. Follow RESTful naming conventions
4. Include detailed error messages in responses
5. Log errors with contextual information
6. Deploy with `npm run supabase:deploy`

---

## Common Gotchas

| Issue | Solution |
|-------|---------|
| Build fails with "unused import" | Remove the unused import or prefix with `_` |
| CORS error on PATCH requests | `PATCH` is included in `allowMethods` - check the method name is exact |
| Admin API returns 401 | Ensure you're using the user JWT, not `publicAnonKey` |
| Assessment data missing | Check both `assessment_def:` and `assessment:` KV prefixes |
| Motion import error | Use `motion/react`, not `framer-motion` |
| Toast import error | Use `sonner@2.0.3` (exact version) |
| Supabase client issues | Always use the singleton from `/lib/supabase-client.ts` |
| Form not working | Use `react-hook-form@7.55.0` (exact version) |
| `filterFigmaProps` errors | Applied on 10 UI primitives - check if your component needs it |

---

## Pre-Push Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] No unused imports or variables
- [ ] No `console.log` in production code (use `logger` from `/lib/logger.ts`)
- [ ] Mobile responsiveness tested
- [ ] Design system guidelines followed (font weights, colors, spacing)
- [ ] Auth headers use actual JWT for admin routes
- [ ] Error handling includes detailed context in messages
- [ ] New screens registered in route config and `App.tsx`
