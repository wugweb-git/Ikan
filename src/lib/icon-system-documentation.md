# iKan Icon System Documentation

## Overview

The iKan design system includes a comprehensive icon system with three levels of integration:

1. **Figma Component Mapping** - Maps to Figma design components
2. **Iconify Integration** - Uses Material Symbols for production
3. **Lucide React Fallbacks** - Provides reliable fallbacks

## Icon Configuration

### Available Icons

#### Navigation Icons
- `home` - Home/Dashboard navigation
- `library` - Resource library navigation  
- `tools` - Tools/Programs navigation
- `account` - User account/profile navigation

#### Action Icons
- `arrowRight` - Forward navigation, progression
- `more` - Additional options, overflow menus
- `delete` - Remove/delete actions
- `search` - Search functionality
- `settings` - Configuration, preferences

#### Content Icons
- `dashboard` - Overview, analytics
- `assignment` - Assessments, tasks, forms
- `article` - Articles, blog posts, text content

#### Status Icons
- `info` - Information messages
- `checkCircle` - Success, completion
- `error` - Errors, problems
- `warning` - Warnings, cautions

#### General Icons
- `calendar` - Dates, scheduling
- `chat` - Communication, messaging
- `widget` - Components, tools
- `bookmark` - Saved items, favorites
- `star` - Ratings, favorites, featured items

### Icon Variants

Each icon supports multiple visual variants:

- **`roundedOutline`** - Rounded corners with outline stroke (navigation)
- **`roundedFilled`** - Rounded corners with solid fill (active navigation)
- **`outline`** - Standard outline style (most common)
- **`filled`** - Solid fill style (active states)
- **`default`** - Simple default style (basic icons)

## Usage Examples

### Basic Icon Usage

```tsx
import { Icon } from './components/Icon';

// Basic icon with default variant
<Icon name="home" />

// Icon with specific variant
<Icon name="home" variant="roundedFilled" />

// Icon with custom size and color
<Icon 
  name="checkCircle" 
  variant="filled" 
  size={24} 
  style={{ color: 'var(--color-status-success)' }}
/>
```

### Convenience Components

```tsx
import { 
  HomeIcon, 
  AssignmentIcon, 
  LibraryIcon, 
  ErrorIcon 
} from './components/Icon';

// Using convenience components
<HomeIcon variant="roundedFilled" size={20} />
<AssignmentIcon variant="outline" />
<LibraryIcon variant="roundedOutline" />
<ErrorIcon variant="filled" />
```

### Navigation Usage

```tsx
// Navigation items with proper icon mapping
const navItems = [
  { 
    label: 'Home', 
    route: '/dashboard', 
    icon: { default: 'home', active: 'home' },
    variant: { default: 'roundedOutline', active: 'roundedFilled' }
  },
  { 
    label: 'Assessments', 
    route: '/assessments', 
    icon: { default: 'assignment', active: 'assignment' },
    variant: { default: 'outline', active: 'filled' }
  }
];

// Render navigation with state-aware icons
<Icon 
  name={isActive ? item.icon.active : item.icon.default}
  variant={isActive ? item.variant.active : item.variant.default}
  size={20}
/>
```

## Icon System Architecture

### 1. Figma Integration (`/lib/icon-config.ts`)

Maps icon names and variants to Figma component paths:

```typescript
"home": {
  "roundedOutline": "Icon/Home/RoundedOutline",
  "roundedFilled": "Icon/Home/RoundedFilled"
}
```

### 2. Iconify Mapping (`/lib/icon-mapping.ts`)

Maps to Material Symbols from Iconify:

```typescript
"home.roundedOutline": "material-symbols:home-outline-rounded",
"home.roundedFilled": "material-symbols:home-rounded"
```

### 3. Lucide Fallbacks

Provides reliable fallbacks using Lucide React:

```typescript
"home-roundedOutline": "Home",
"home-roundedFilled": "Home"
```

## Best Practices

### Navigation Icons
- Use `roundedOutline` for default navigation states
- Use `roundedFilled` for active navigation states
- Size: 16-20px for navigation

### Action Icons
- Use `outline` for default action buttons
- Use `filled` for primary or active actions
- Size: 16px for buttons, 14px for inline actions

### Status Icons
- Use `outline` for informational status
- Use `filled` for critical status (errors, warnings)
- Size: 16-20px for status indicators

### Content Icons
- Use `outline` for default content representation
- Use `filled` when content is selected or featured
- Size: 16-24px depending on context

## Color Guidelines

### Semantic Colors
```css
--color-primary-default: #2A2A2A     /* Primary actions, active states */
--color-text-muted: #717182          /* Secondary, inactive states */
--color-status-success: #22C55E      /* Success states */
--color-status-danger: #D4183D       /* Error states */
--color-status-warning: #EAB308      /* Warning states */
--color-status-info: #8B5CF6         /* Information states */
```

### Usage Examples
```tsx
// Primary action
<Icon name="checkCircle" variant="filled" 
      style={{ color: 'var(--color-status-success)' }} />

// Secondary action
<Icon name="more" variant="outline" 
      style={{ color: 'var(--color-text-muted)' }} />

// Error state
<Icon name="error" variant="filled" 
      style={{ color: 'var(--color-status-danger)' }} />
```

## Accessibility

### Touch Targets
- Minimum 44px touch target for mobile
- Use appropriate sizes for different contexts

### ARIA Labels
```tsx
<Icon name="delete" variant="outline" aria-label="Delete item" />
```

### Screen Reader Support
- Use semantic HTML alongside icons
- Provide text labels for important actions
- Use `aria-hidden="true"` for decorative icons

## File Structure

```
/lib/
  ├── icon-config.ts          # Figma component mapping
  ├── icon-mapping.ts         # Iconify and Lucide mappings
  ├── icons.ts               # Complete icon system export
  └── icon-utils.ts          # Utility functions

/components/
  └── Icon.tsx               # Main icon component with convenience exports
```

## Migration Guide

### From Lucide Direct Usage

**Before:**
```tsx
import { Home, FileText } from 'lucide-react';
<Home size={20} />
<FileText size={16} />
```

**After:**
```tsx
import { Icon } from './components/Icon';
<Icon name="home" variant="roundedOutline" size={20} />
<Icon name="assignment" variant="outline" size={16} />
```

### Benefits of Migration
- Consistent icon system across design and development
- Better semantic naming aligned with app functionality  
- Support for multiple visual variants
- Fallback system for reliability
- Type safety with TypeScript

## Development Workflow

1. **Design Phase**: Use Figma components with proper naming structure
2. **Development**: Use Icon component with semantic names
3. **Production**: Automatic fallback to Iconify or Lucide icons
4. **Testing**: Verify icons render correctly across all states

This comprehensive icon system ensures consistency between design and development while providing flexibility and reliability for the iKan mental health PWA.