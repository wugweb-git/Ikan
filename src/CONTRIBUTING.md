# Contributing to iKan Mental Health PWA

Thank you for your interest in contributing to the iKan Mental Health PWA! This document provides guidelines and information for contributors.

## 🌟 Code of Conduct

This project is dedicated to providing a safe, welcoming environment for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Focus on what is best for the community
- Show empathy towards other community members
- Be mindful that this is a mental health application affecting real users

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and mental health best practices

### Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/ikan-mental-health-pwa.git
cd ikan-mental-health-pwa
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your development credentials
```

4. **Start development server**
```bash
npm run dev
```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: All new code must be written in TypeScript with proper type definitions
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code is automatically formatted
- **Design System**: Use iKan design tokens and follow the guidelines in `/guidelines/Guidelines.md`

### Component Guidelines

```tsx
// ✅ Good: Proper TypeScript interface and iKan patterns
interface ComponentProps {
  title: string;
  onAction: () => void;
  variant?: 'primary' | 'secondary';
}

export function Component({ title, onAction, variant = 'primary' }: ComponentProps) {
  return (
    <button 
      className="ikan-button"
      onClick={onAction}
      style={{
        backgroundColor: 'var(--semantic-button-primary-bg)',
        height: 'var(--ikan-component-button-height)',
        borderRadius: 'var(--ikan-component-border-radius)'
      }}
    >
      {title}
    </button>
  );
}
```

### Mental Health Considerations

When contributing to this mental health application:

- **Sensitive Language**: Use supportive, non-judgmental language
- **Crisis Safety**: Never remove or disable crisis support features
- **Privacy**: Ensure all user data remains private and secure
- **Accessibility**: Follow WCAG 2.1 AA guidelines
- **Evidence-Based**: Use clinically validated approaches when possible

### Mobile-First Development

- **Touch Targets**: Minimum 44px for interactive elements
- **Performance**: Optimize for mobile networks and devices
- **Gestures**: Support common mobile gestures (swipe, pinch, etc.)
- **Keyboard**: Handle mobile keyboards and screen resizing
- **Offline**: Ensure graceful degradation when offline

## 🎨 Design System

### iKan Design Tokens

Always use the predefined design tokens:

```css
/* ✅ Use design tokens */
color: var(--color-text-primary);
font-size: var(--text-base);
padding: var(--ikan-component-spacing-default);
height: var(--ikan-component-button-height);

/* ❌ Don't use hardcoded values */
color: #151515;
font-size: 16px;
padding: 16px;
height: 48px;
```

### Typography Rules

- **Font Family**: Ubuntu only (defined in design tokens)
- **Body Text**: Font weight 400 only
- **Titles**: Font weight 500 only
- **No Tailwind Typography**: Don't use Tailwind font classes unless explicitly requested

### Component Consistency

- **Button Height**: 48px (`--ikan-component-button-height`)
- **Input Height**: 48px (`--ikan-component-input-height`) 
- **Border Radius**: 6px (`--ikan-component-border-radius`)
- **Spacing**: Use `--ikan-component-spacing-*` tokens

## 🔄 Pull Request Process

### Before Submitting

1. **Test thoroughly** on mobile devices
2. **Check accessibility** with screen readers
3. **Verify offline functionality** still works
4. **Follow code style** and design system
5. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Design system update

## Mental Health Impact
- [ ] No impact on user safety
- [ ] Improves user experience
- [ ] Enhances crisis support
- [ ] Requires clinical review

## Testing
- [ ] Tested on mobile devices
- [ ] Verified offline functionality
- [ ] Checked accessibility
- [ ] Validated with sample users (if applicable)

## Screenshots
(Include before/after screenshots for UI changes)
```

### Review Process

1. **Automatic Checks**: CI/CD pipeline runs tests and builds
2. **Code Review**: Maintainers review for code quality and mental health safety
3. **Clinical Review**: Mental health features may require additional review
4. **Accessibility Check**: Ensure WCAG compliance
5. **Mobile Testing**: Verify mobile functionality

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what's happening

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Device Information:**
- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.1, Android 12]
- Browser: [e.g. Safari, Chrome]
- App Version: [e.g. 1.2.3]

**Mental Health Impact**
- [ ] Affects crisis support features
- [ ] Impacts user safety
- [ ] Blocks core functionality
- [ ] Minor UI issue
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Mental Health Rationale**
How this feature supports mental wellness

**User Story**
As a [user type], I want [feature] so that [benefit]

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Design Considerations**
- Mobile-first approach
- Accessibility requirements
- Crisis safety implications
- Privacy considerations

**Clinical Evidence**
Link to research or clinical guidelines supporting this feature (if applicable)
```

## 🔒 Security Guidelines

### Data Privacy

- **Never log** sensitive user data
- **Encrypt** all data in transit and at rest
- **Minimize data collection** to what's necessary
- **Follow GDPR** and other privacy regulations

### Crisis Safety

- **Never disable** crisis support features
- **Test crisis flows** thoroughly
- **Maintain emergency contacts** accuracy
- **Ensure offline access** to crisis resources

## 📚 Resources

### Documentation

- [iKan Design Guidelines](./guidelines/Guidelines.md)
- [Mental Health Best Practices](https://www.who.int/teams/mental-health-and-substance-use/mental-health-at-work)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [React Accessibility](https://react.dev/learn/accessibility)

### Tools

- [WAVE Web Accessibility Checker](https://wave.webaim.org/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🙏 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Special recognition for mental health safety improvements

## 📞 Getting Help

- **Technical Questions**: Open a GitHub Discussion
- **Design Questions**: Reference the design guidelines
- **Mental Health Questions**: Consult with mental health professionals
- **Security Concerns**: Email security@ikan-app.com (if applicable)

---

Thank you for contributing to mental health technology that makes a positive impact! 🌟