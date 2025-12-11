# Pull Request

## 📝 Description
Brief description of the changes and why they were made.

Fixes #(issue_number)

## 🔄 Type of Change
Please check the relevant option:

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Design system update
- [ ] 🔧 Refactoring (code changes that neither fix a bug nor add a feature)
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security improvement

## 🧠 Mental Health Impact Assessment
Please check all that apply:

- [ ] No impact on user safety or mental health features
- [ ] Improves user mental health experience
- [ ] Enhances crisis support functionality
- [ ] Improves accessibility for mental health users
- [ ] Requires clinical review before release
- [ ] Affects data privacy or security

**Priority Level:**
- [ ] Critical (Crisis support or user safety)
- [ ] High (Core mental health functionality)
- [ ] Medium (General user experience)
- [ ] Low (Minor improvements or fixes)

## ✅ Testing Checklist

### Functionality Testing
- [ ] Tested on mobile devices (iOS/Android)
- [ ] Tested on desktop browsers
- [ ] Verified offline functionality still works
- [ ] Tested with slow network connections
- [ ] All new features work as expected
- [ ] No regression in existing features

### Accessibility Testing
- [ ] Tested with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Keyboard navigation works properly
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Focus indicators are visible and clear
- [ ] Touch targets are at least 44px

### Mental Health Safety
- [ ] Crisis support features remain functional
- [ ] No interference with emergency resources
- [ ] Sensitive language reviewed for appropriateness
- [ ] Data privacy maintained
- [ ] User safety considerations addressed

### Code Quality
- [ ] Code follows TypeScript best practices
- [ ] iKan design system guidelines followed
- [ ] Component heights standardized (48px for buttons/inputs)
- [ ] Uses design tokens instead of hardcoded values
- [ ] ESLint passes without errors
- [ ] Build completes successfully

## 📱 Mobile Optimization
- [ ] Touch-friendly interactions (44px minimum targets)
- [ ] Responsive design works on small screens
- [ ] Handles mobile keyboard properly
- [ ] Pull-to-refresh works (if applicable)
- [ ] Haptic feedback implemented (if applicable)
- [ ] Safe area handling for notched devices

## 🎨 Design System Compliance
- [ ] Uses iKan design tokens (`var(--token-name)`)
- [ ] Follows Ubuntu typography guidelines
- [ ] Font weights: 400 for body, 500 for titles
- [ ] Button height: 48px (`--ikan-component-button-height`)
- [ ] Input height: 48px (`--ikan-component-input-height`)
- [ ] Border radius: 6px (`--ikan-component-border-radius`)
- [ ] No Tailwind font classes unless explicitly required

## 📸 Screenshots
**Before:**
<!-- Add screenshots of the current state -->

**After:**
<!-- Add screenshots of your changes -->

**Mobile:**
<!-- Add mobile screenshots if applicable -->

## 📋 Additional Notes
### Breaking Changes
If this is a breaking change, describe what changes users need to make:

### Migration Steps
If database or configuration changes are required:

### Dependencies
New dependencies added (explain why they're needed):

### Performance Impact
Any performance implications:

### Security Considerations
Security implications or improvements:

## 🔗 Related Issues/PRs
- Closes #(issue_number)
- Related to #(issue_number)
- Depends on #(pr_number)

## 📚 Documentation
- [ ] Updated relevant documentation
- [ ] Added inline code comments where necessary
- [ ] Updated TypeScript interfaces
- [ ] Added or updated component JSDoc

## 🚀 Deployment Notes
Any special deployment considerations:

---

## 📝 Reviewer Checklist (for maintainers)

### Code Review
- [ ] Code quality and TypeScript usage
- [ ] Design system compliance
- [ ] Mental health safety considerations
- [ ] Performance implications
- [ ] Security review completed

### Testing Review
- [ ] Adequate test coverage
- [ ] Mobile functionality verified
- [ ] Accessibility compliance confirmed
- [ ] Offline functionality maintained

### Documentation Review
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)

---

**For Reviewers:** Please pay special attention to mental health safety, accessibility, and mobile user experience when reviewing this PR.