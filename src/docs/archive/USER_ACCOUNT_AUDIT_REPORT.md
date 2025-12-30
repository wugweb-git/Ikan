# 🔍 USER ACCOUNT SECTION - COMPREHENSIVE AUDIT REPORT

**Date:** December 16, 2024  
**Scope:** Full Account Section (UI, UX, Validation, Functions, Admin Mapping)  
**Status:** 🟡 **GOOD WITH IMPROVEMENTS NEEDED**

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Component Structure](#component-structure)
3. [Validation Audit](#validation-audit)
4. [UX Audit](#ux-audit)
5. [UI Audit](#ui-audit)
6. [Functionality Audit](#functionality-audit)
7. [Admin Data Mapping](#admin-data-mapping)
8. [Issues Found](#issues-found)
9. [Recommendations](#recommendations)

---

## 📊 EXECUTIVE SUMMARY

### **Overall Score: 7.5/10**

| Category | Score | Status |
|----------|-------|--------|
| **Component Structure** | 9/10 | 🟢 Excellent |
| **Validation** | 5/10 | 🔴 Critical Issues |
| **UX** | 8/10 | 🟢 Good |
| **UI** | 9/10 | 🟢 Excellent |
| **Functionality** | 6/10 | 🟡 Moderate Issues |
| **Admin Mapping** | 7/10 | 🟡 Good |

### **Critical Findings:**
- ❌ **No frontend validation** on profile form fields
- ❌ **No backend validation** on profile updates
- ⚠️ **Password change has minimal validation** (only length check)
- ⚠️ **Emergency contact fields not validated**
- ⚠️ **Phone number format not validated**
- ⚠️ **Email change not implemented**
- ⚠️ **No unsaved changes warning**
- ⚠️ **Social auth incomplete** (OAuth not implemented)

---

## 🏗️ COMPONENT STRUCTURE

### **Files Audited:**

```
/components/screens/Account.tsx                 ✅ Main container
/components/screens/account/Preferences.tsx     ✅ Settings page
/components/screens/account/Privacy.tsx         ✅ Privacy controls
/components/screens/account/Security.tsx        ✅ Security settings
/components/screens/account/Notifications.tsx   ✅ Notification prefs
/components/blocks/AccountDetailsSection.tsx    ✅ Profile editor block
/components/screens/PaymentHistory.tsx          ✅ Payment records
/components/screens/AdminUserManager.tsx        ✅ Admin user CRUD
/components/screens/UserEditPage.tsx            ✅ Admin user editor
```

### **Structure Score: 9/10** 🟢

**Strengths:**
- ✅ Well-organized directory structure
- ✅ Separated concerns (profile, security, privacy, etc.)
- ✅ Reusable components (AccountDetailsSection)
- ✅ Consistent naming conventions
- ✅ Proper TypeScript interfaces

**Issues:**
- ⚠️ Some duplication between Account.tsx and AccountDetailsSection.tsx
- ⚠️ No separate validation module

---

## ⚠️ VALIDATION AUDIT

### **Overall Score: 5/10** 🔴 **CRITICAL**

### **❌ Profile Form Validation (MISSING)**

**Location:** `/components/screens/Account.tsx` → `handleSaveProfile()`

**Current Code:**
```typescript
const handleSaveProfile = async (userData: any) => {
  try {
    setIsSavingProfile(true);
    
    // ❌ NO VALIDATION - Direct API call
    await apiClient.updateProfile({
      name: userData.name,
      phone: userData.phone,
      bio: userData.bio,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      location: userData.location,
      emergencyContact: userData.emergencyContact,
      preferences: userData.preferences
    });
    
    showToast('success', 'Profile Updated', 'Your profile has been saved successfully.');
    setIsEditingProfile(false);
  } catch (error) {
    // Generic error handling
    showToast('error', 'Save Failed', 'Failed to save your profile. Please try again.');
  }
}
```

**Issues:**
- ❌ No name validation (empty, length, special chars)
- ❌ No phone validation (format, country code)
- ❌ No date of birth validation (age restrictions, future dates)
- ❌ No bio length validation (max chars)
- ❌ No emergency contact validation
- ❌ No email validation (if email change is added)

**Risk Level:** 🔴 **HIGH**

---

### **❌ Backend Validation (MISSING)**

**Location:** `/supabase/functions/server/index.tsx` → Line 167-210

**Current Code:**
```typescript
app.put("/make-server-cc205da9/users/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    
    // ❌ NO VALIDATION - Direct updates
    if (updates.name !== undefined) updatedProfile.name = updates.name;
    if (updates.phone !== undefined) updatedProfile.phone = updates.phone;
    if (updates.bio !== undefined) updatedProfile.bio = updates.bio;
    // ... more fields
    
    await kv.set(`user:${userId}`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});
```

**Issues:**
- ❌ No input sanitization
- ❌ No field type checking
- ❌ No length limits
- ❌ No format validation
- ❌ No SQL injection protection (though using KV store)
- ❌ No XSS protection

**Risk Level:** 🔴 **HIGH**

---

### **⚠️ Password Change Validation (WEAK)**

**Location:** `/components/screens/account/Security.tsx` → Line 81-96

**Current Code:**
```typescript
const handleChangePassword = () => {
  // ✅ Has basic validation
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('error', 'Error', 'New passwords do not match');
    return;
  }
  
  // ⚠️ Only checks length (8 chars minimum)
  if (passwordForm.newPassword.length < 8) {
    showToast('error', 'Error', 'Password must be at least 8 characters');
    return;
  }
  
  // ❌ No complexity check (uppercase, numbers, special chars)
  // ❌ No common password check
  // ❌ No current password verification
  
  showToast('success', 'Password Changed', 'Your password has been updated successfully');
};
```

**Issues:**
- ❌ No password complexity requirements
- ❌ No uppercase/lowercase check
- ❌ No number/special character requirement
- ❌ No common password detection
- ❌ Current password not verified against backend
- ⚠️ Password strength indicator missing

**Risk Level:** 🟡 **MEDIUM**

---

### **⚠️ Phone Number Validation (MISSING)**

**Location:** Multiple locations (Profile, Emergency Contact)

**Issues:**
- ❌ No format validation (country codes, formats)
- ❌ No length validation
- ❌ No character validation (allows letters, special chars)
- ❌ No country code selector
- ❌ No auto-formatting

**Example Invalid Inputs Accepted:**
```
"abc-def-ghij"     // Letters accepted
"123"              // Too short accepted
"+9999999999999"   // Too long accepted
"!@#$%^&*()"       // Special chars accepted
```

**Risk Level:** 🟡 **MEDIUM**

---

### **⚠️ Emergency Contact Validation (MISSING)**

**Location:** `/components/blocks/AccountDetailsSection.tsx`

**Issues:**
- ❌ No name validation
- ❌ No phone validation
- ❌ No relationship validation
- ❌ All fields optional (should be required if any filled)

**Risk Level:** 🟡 **MEDIUM**

---

### **✅ Preferences Validation (GOOD)**

**Location:** `/components/screens/account/Preferences.tsx`

**Status:** ✅ Works correctly
- ✅ Toggle states validated
- ✅ Select dropdowns have predefined options
- ✅ Type-safe with TypeScript
- ✅ State management clean

**Score:** 9/10 🟢

---

## 🎨 UX AUDIT

### **Overall Score: 8/10** 🟢 **GOOD**

### **✅ Strengths:**

1. **Navigation** (9/10) 🟢
   - ✅ Desktop: Clear sidebar navigation
   - ✅ Mobile: Tab-based navigation
   - ✅ Breadcrumbs on admin panel
   - ✅ Back buttons where appropriate

2. **Edit Mode Toggle** (8/10) 🟢
   - ✅ Clear "Edit Profile" button
   - ✅ Visual distinction between view/edit modes
   - ✅ Loading states during save
   - ⚠️ No "unsaved changes" warning

3. **Feedback** (9/10) 🟢
   - ✅ Toast notifications for all actions
   - ✅ Success/error states clearly communicated
   - ✅ Loading indicators
   - ✅ Confirmation dialogs for destructive actions

4. **Responsive Design** (9/10) 🟢
   - ✅ Desktop: 2-column layout (sidebar + content)
   - ✅ Mobile: Single column with tabs
   - ✅ Touch targets meet minimum 44px
   - ✅ Scrollable content areas

### **⚠️ Issues:**

1. **No Unsaved Changes Warning** (🔴 CRITICAL)
   ```typescript
   // ❌ Navigating away loses unsaved data
   const handleAccountNavigate = (route: string) => {
     setCurrentAccountRoute(route);
     setIsEditingProfile(false); // Discards changes!
   };
   ```
   - **Impact:** Users lose data when switching tabs
   - **Fix:** Implement `useUnsavedChanges` hook

2. **Email Change Not Implemented** (🟡 MODERATE)
   - Email field is displayed but not editable
   - No UI to request email change
   - Security best practice to require verification

3. **Avatar Upload Flow** (🟡 MODERATE)
   ```typescript
   // ⚠️ Hover-to-upload not mobile-friendly
   <div onMouseEnter={() => setIsHovering(true)}>
     <input type="file" className="opacity-0" />
   </div>
   ```
   - Mobile users can't see "hover to upload" affordance
   - No upload progress indicator
   - No image crop/resize

4. **Password Change Hidden** (🟡 MODERATE)
   - Requires clicking "Change Password" to see form
   - Could be more discoverable
   - No "Forgot Password" link

5. **Social Login Incomplete** (🟡 MODERATE)
   ```typescript
   // ⚠️ OAuth not implemented
   async handleSocialSync(provider, action) {
     showToast('info', 'Connecting...', `Connecting to ${provider}...`);
     // TODO: Implement OAuth flow
     await apiClient.connectSocialAccount(provider);
   }
   ```
   - Shows "connecting" but doesn't actually connect
   - No OAuth implementation
   - Misleading to users

### **UX Improvements Needed:**

| Issue | Priority | Impact | Effort |
|-------|----------|--------|--------|
| No unsaved changes warning | 🔴 High | Data loss | Low |
| Email change not implemented | 🟡 Medium | Confusion | Medium |
| Avatar upload not mobile-friendly | 🟡 Medium | Usability | Low |
| Social login incomplete | 🟡 Medium | Misleading | High |
| Password strength indicator | 🟡 Medium | Security | Low |

---

## 🎨 UI AUDIT

### **Overall Score: 9/10** 🟢 **EXCELLENT**

### **✅ Design Token Compliance:**

**Checked:** All account pages for iKan design token usage

```typescript
// ✅ Excellent token usage throughout
style={{
  fontSize: 'var(--text-2xl)',            // ✅ Correct
  fontWeight: 'var(--font-weight-medium)', // ✅ Correct (no bold!)
  color: 'var(--color-text-primary)',      // ✅ Correct
  borderRadius: 'var(--ikan-component-border-radius)', // ✅ Correct
  padding: 'var(--spacing-4)',             // ✅ Correct
  gap: 'var(--spacing-6)',                 // ✅ Correct
}}
```

**Token Compliance: 95%** ✅

**Issues Found:**
1. Some hardcoded colors in toggle switches (line 79 Privacy.tsx)
   ```typescript
   backgroundColor: enabled ? 'var(--color-primary-default)' : 'var(--color-bg-muted)', // ✅ Good
   ```
   Actually this is CORRECT! ✅

2. All typography uses correct weights:
   - ✅ NO font-weight: 600 (semibold) found
   - ✅ NO font-weight: 700 (bold) found
   - ✅ Only 400 (regular) and 500 (medium) used

**Typography Score: 10/10** ✅

### **✅ Component Consistency:**

1. **Cards** ✅
   - Consistent border radius
   - Consistent padding
   - Consistent shadows

2. **Buttons** ✅
   - Correct height (var(--ikan-component-button-height))
   - Correct border radius
   - Correct font weight (medium)
   - Proper loading states

3. **Form Fields** ✅
   - Consistent input styling
   - Proper labels
   - Correct spacing
   - Accessible (htmlFor attributes)

4. **Icons** ✅
   - Consistent sizes (16px, 20px, 24px)
   - Proper semantic icons
   - Correct colors

### **⚠️ Minor UI Issues:**

1. **Toggle Switch Component** (Custom vs UI Library)
   - 3 different implementations of ToggleSwitch
   - Should use single source of truth
   - Files: Privacy.tsx, Security.tsx, Notifications.tsx, Preferences.tsx

2. **Separator Inconsistency**
   - Some places use `<Separator />`
   - Some places use manual divs
   - Should standardize

3. **Mobile Tab Icons**
   - Labels hidden on mobile (sm:inline)
   - Icons-only might not be clear to all users
   - Consider always showing labels

### **UI Score Breakdown:**

| Aspect | Score |
|--------|-------|
| Design Tokens | 10/10 ✅ |
| Typography | 10/10 ✅ |
| Spacing | 9/10 ✅ |
| Colors | 10/10 ✅ |
| Consistency | 8/10 🟡 |
| Accessibility | 9/10 ✅ |

---

## ⚙️ FUNCTIONALITY AUDIT

### **Overall Score: 6/10** 🟡 **MODERATE ISSUES**

### **✅ Working Features:**

1. **Profile Display** ✅
   - User data loads correctly
   - Fallbacks for missing data
   - Proper null checks

2. **Edit Mode Toggle** ✅
   - Edit button shows form
   - Cancel functionality works
   - Loading states implemented

3. **Preferences Management** ✅
   - Toggle switches work
   - Dropdowns function correctly
   - State management clean

4. **Privacy Settings** ✅
   - All toggles functional
   - Export data flow works
   - Delete confirmation works

5. **Security Settings** ✅
   - Session management displayed
   - 2FA setup flow works
   - Revoke session works

6. **Navigation** ✅
   - Tab switching works
   - Breadcrumbs functional
   - Back navigation works

### **❌ Broken/Incomplete Features:**

1. **Social Authentication** ❌
   ```typescript
   // Location: Account.tsx line 83-100
   async handleSocialSync(provider, action) {
     // TODO: Implement OAuth flow
     await apiClient.connectSocialAccount(provider);
     // ❌ This is a stub - doesn't actually connect
   }
   ```
   - **Issue:** Shows "Connected" but no actual OAuth
   - **Impact:** Misleading to users
   - **Fix:** Either implement OAuth or hide feature

2. **Email Change** ❌
   - Email field shown but not editable
   - No email change flow implemented
   - Should require verification

3. **Avatar Upload** ⚠️
   ```typescript
   // Location: AccountDetailsSection.tsx line 33-38
   const handleFileChange = (event) => {
     const file = event.target.files?.[0];
     if (file && onAvatarChange) {
       onAvatarChange(file);
       // ⚠️ No upload to server
       // ⚠️ No image processing
       // ⚠️ No error handling
     }
   };
   ```
   - File selected but not uploaded
   - No image processing (resize, crop)
   - No server endpoint for avatar upload

4. **Data Export** ⚠️
   ```typescript
   // Location: Privacy.tsx line 54-63
   const handleExportData = async () => {
     // ⚠️ Simulates export with setTimeout
     setTimeout(() => {
       showToast('success', 'Export Complete', 'Your data has been exported...');
       // ❌ No actual export happening
     }, 2000);
   };
   ```
   - Shows success but doesn't export data
   - No server endpoint
   - Misleading to users

5. **Password Change** ⚠️
   ```typescript
   // Location: Security.tsx line 81-96
   const handleChangePassword = () => {
     // ⚠️ Only frontend validation
     // ❌ No API call to backend
     showToast('success', 'Password Changed', '...');
     // Password not actually changed!
   }
   ```
   - Shows success but password unchanged
   - No backend integration
   - Critical security issue

6. **Emergency Contact** ⚠️
   - Saves to frontend state only
   - Not validated
   - Not clear if it's actually used

### **Data Flow Issues:**

1. **Profile Update Flow:**
   ```
   Frontend Form → handleSaveProfile() → apiClient.updateProfile() 
   → /users/profile PUT → KV Store → Success
   ```
   - ✅ Flow exists
   - ❌ No validation at any step
   - ⚠️ Emergency contact mapping awkward

2. **Admin User Update Flow:**
   ```
   Admin Panel → UserEditPage → handleSave() → apiClient.updateUserAdmin() 
   → /admin/users/:id PUT → KV Store → Success
   ```
   - ✅ Flow exists
   - ✅ Admin permission check
   - ⚠️ Different data structure than user profile

---

## 🔄 ADMIN DATA MAPPING

### **Overall Score: 7/10** 🟡 **GOOD**

### **Data Structure Comparison:**

**User Profile (Frontend):**
```typescript
interface User {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  emergencyContact?: {          // ⚠️ Nested object
    name: string;
    phone: string;
    relationship: string;
  };
  connectedAccounts?: {         // ⚠️ Nested object
    google?: {...};
    linkedin?: {...};
  };
}
```

**User Profile (Backend KV Store):**
```typescript
interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  emergencyContactName?: string;        // ⚠️ Flattened
  emergencyContactPhone?: string;       // ⚠️ Flattened
  emergencyContactRelationship?: string; // ⚠️ Flattened
  googleConnected?: boolean;            // ⚠️ Flattened
  googleEmail?: string;                 // ⚠️ Flattened
  linkedinConnected?: boolean;          // ⚠️ Flattened
}
```

**Admin User Manager (Admin Panel):**
```typescript
interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  corporate_user?: boolean;       // ✅ Extra field
  is_admin?: boolean;             // ✅ Extra field
  avatar_url?: string | null;     // ✅ Extra field
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  location?: string | null;
  created_at: string;             // ✅ Timestamps
  updated_at?: string;            // ✅ Timestamps
  googleConnected?: boolean;
  linkedinConnected?: boolean;
}
```

### **✅ Mapping Strengths:**

1. **Consistent Core Fields** ✅
   - name, email, phone, bio match everywhere
   - Created/updated timestamps properly tracked
   - User ID consistently used

2. **Admin-Specific Fields** ✅
   - `is_admin` flag works correctly
   - `corporate_user` flag implemented
   - Role-based access control works

3. **Backend Transformation** ✅
   ```typescript
   // Line 177-197 in server/index.tsx
   // Correctly transforms emergencyContact object to flat fields
   if (updates.emergencyContact) {
     updatedProfile.emergencyContactName = updates.emergencyContact.name;
     updatedProfile.emergencyContactPhone = updates.emergencyContact.phone;
     updatedProfile.emergencyContactRelationship = updates.emergencyContact.relationship;
   }
   ```

### **⚠️ Mapping Issues:**

1. **Emergency Contact Inconsistency** 🟡
   - **Frontend:** Nested object `emergencyContact: { name, phone, relationship }`
   - **Backend:** Flattened fields `emergencyContactName`, `emergencyContactPhone`, etc.
   - **Issue:** Manual transformation required
   - **Risk:** Easy to miss fields during update

2. **Social Accounts Inconsistency** 🟡
   - **Frontend:** Nested `connectedAccounts.google.connected`
   - **Backend:** Flat `googleConnected`, `googleEmail`, `googleConnectedAt`
   - **Admin Panel:** Only shows `googleConnected` boolean
   - **Issue:** Missing data in admin view

3. **Avatar URL vs Avatar** 🟡
   - **Frontend:** Uses `avatar` or `avatar_url` inconsistently
   - **Backend:** Uses `avatar_url`
   - **Admin:** Uses `avatar_url`
   - **Issue:** Naming inconsistency

4. **Missing Fields in Admin** 🟡
   - Emergency contact not visible in admin panel
   - Preferences not visible in admin panel
   - Connected accounts only show boolean, not details

5. **Null vs Undefined** 🟡
   ```typescript
   // Frontend uses optional (undefined)
   phone?: string;
   
   // Backend/Admin uses null
   phone?: string | null;
   ```
   - Can cause issues with type checking
   - Should standardize on one approach

### **Data Sync Issues:**

1. **User Updates Don't Invalidate Admin Cache** ⚠️
   - User edits profile → KV updated
   - Admin panel still shows old data
   - Need to reload to see changes

2. **Admin Updates Don't Reflect in User View** ⚠️
   - Admin changes user data → KV updated
   - User's frontend state not refreshed
   - Need to logout/login to see changes

3. **No Audit Trail** ⚠️
   - No history of who changed what
   - `updated_at` timestamp but no `updated_by`
   - Important for admin panel

---

## 🐛 ISSUES FOUND

### **🔴 CRITICAL ISSUES (Fix Immediately)**

1. **No Input Validation**
   - **Location:** Account.tsx, server/index.tsx
   - **Impact:** Security vulnerability, data corruption
   - **Severity:** 🔴 CRITICAL
   - **Fix Time:** 4-6 hours

2. **Password Change Doesn't Work**
   - **Location:** Security.tsx line 81-96
   - **Impact:** Users think password is changed but it's not
   - **Severity:** 🔴 CRITICAL
   - **Fix Time:** 2 hours

3. **No Unsaved Changes Warning**
   - **Location:** Account.tsx handleAccountNavigate()
   - **Impact:** Users lose unsaved data
   - **Severity:** 🔴 HIGH
   - **Fix Time:** 2 hours

### **🟡 MODERATE ISSUES (Fix Soon)**

4. **Social Login Incomplete**
   - **Location:** Account.tsx handleSocialSync()
   - **Impact:** Misleading users
   - **Severity:** 🟡 MEDIUM
   - **Fix Time:** 8-12 hours (OAuth implementation)

5. **Avatar Upload Incomplete**
   - **Location:** AccountDetailsSection.tsx
   - **Impact:** Avatar doesn't actually change
   - **Severity:** 🟡 MEDIUM
   - **Fix Time:** 4 hours

6. **Data Export Fake**
   - **Location:** Privacy.tsx handleExportData()
   - **Impact:** Misleading users
   - **Severity:** 🟡 MEDIUM
   - **Fix Time:** 6 hours

7. **Email Change Not Implemented**
   - **Location:** Account.tsx
   - **Impact:** Users can't change email
   - **Severity:** 🟡 MEDIUM
   - **Fix Time:** 6 hours (with verification)

8. **Emergency Contact Not Validated**
   - **Location:** AccountDetailsSection.tsx
   - **Impact:** Invalid data saved
   - **Severity:** 🟡 MEDIUM
   - **Fix Time:** 2 hours

### **🟢 MINOR ISSUES (Nice to Have)**

9. **Toggle Switch Duplication**
   - **Location:** Multiple files
   - **Impact:** Code maintenance
   - **Severity:** 🟢 LOW
   - **Fix Time:** 1 hour

10. **Admin Panel Missing Fields**
    - **Location:** AdminUserManager.tsx
    - **Impact:** Incomplete admin view
    - **Severity:** 🟢 LOW
    - **Fix Time:** 2 hours

11. **Mobile Avatar Upload UX**
    - **Location:** AccountDetailsSection.tsx
    - **Impact:** Mobile usability
    - **Severity:** 🟢 LOW
    - **Fix Time:** 2 hours

12. **No Audit Trail**
    - **Location:** Backend
    - **Impact:** Can't track changes
    - **Severity:** 🟢 LOW
    - **Fix Time:** 4 hours

---

## 💡 RECOMMENDATIONS

### **Priority 1: Security & Validation** 🔴

**Estimated Time:** 8-12 hours

1. **Implement Frontend Validation**
   ```typescript
   // Add validation utility
   // /lib/validation.ts
   export const validateProfile = (data: any) => {
     const errors: any = {};
     
     if (!data.name || data.name.trim().length < 2) {
       errors.name = 'Name must be at least 2 characters';
     }
     
     if (data.phone && !isValidPhone(data.phone)) {
       errors.phone = 'Invalid phone number format';
     }
     
     if (data.bio && data.bio.length > 500) {
       errors.bio = 'Bio must be less than 500 characters';
     }
     
     return errors;
   };
   ```

2. **Implement Backend Validation**
   ```typescript
   // /supabase/functions/server/validation.tsx
   export const validateUserUpdate = (updates: any) => {
     // Sanitize inputs
     // Check types
     // Validate formats
     // Return errors or sanitized data
   };
   ```

3. **Add Password Strength Validation**
   ```typescript
   // Require: 8+ chars, 1 uppercase, 1 number, 1 special char
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   ```

4. **Implement Phone Validation**
   - Use library like `libphonenumber-js`
   - Add country code selector
   - Auto-format as user types

---

### **Priority 2: Complete Core Features** 🟡

**Estimated Time:** 20-24 hours

1. **Fix Password Change**
   - Add backend endpoint `/users/password`
   - Verify current password
   - Hash new password
   - Invalidate other sessions

2. **Implement Email Change**
   - Add verification flow
   - Send confirmation emails
   - Update after verification
   - Security best practice

3. **Implement Avatar Upload**
   - Add upload endpoint
   - Image processing (resize, crop)
   - Store in Supabase Storage
   - Update avatar_url in profile

4. **Add Unsaved Changes Warning**
   ```typescript
   // Use existing hook
   import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
   
   const { hasChanges, confirmNavigation } = useUnsavedChanges(formData, originalData);
   ```

5. **Implement Data Export**
   - Create export endpoint
   - Generate JSON/CSV
   - Email to user
   - Track export history

---

### **Priority 3: OAuth Integration** 🟡

**Estimated Time:** 12-16 hours

1. **Implement Social Login**
   - Set up OAuth apps (Google, LinkedIn)
   - Implement OAuth flow
   - Link accounts
   - Handle disconnection
   - See: https://supabase.com/docs/guides/auth/social-login/

2. **Update Documentation**
   - Add setup instructions
   - Document OAuth configuration
   - User-facing help docs

---

### **Priority 4: Admin Enhancements** 🟢

**Estimated Time:** 6-8 hours

1. **Add Missing Fields to Admin**
   - Emergency contact section
   - Preferences view
   - Connected accounts details
   - Avatar preview

2. **Implement Audit Trail**
   - Track who changed what
   - Store in separate KV key
   - Display in admin panel
   - Filter by user/date

3. **Add Bulk Operations**
   - Export all users
   - Bulk role changes
   - Bulk notifications

---

### **Priority 5: UX Polish** 🟢

**Estimated Time:** 4-6 hours

1. **Consolidate Toggle Switch**
   - Create single ToggleSwitch component
   - Replace all instances
   - Add to UI library

2. **Improve Mobile Avatar Upload**
   - Add explicit "Upload Photo" button
   - Show file picker
   - Add upload progress

3. **Add Password Strength Indicator**
   - Visual strength meter
   - Real-time feedback
   - Suggestions for improvement

4. **Improve Error Messages**
   - More specific error messages
   - Field-level errors
   - Inline validation

---

## 📊 TESTING CHECKLIST

### **Validation Testing:**
- [ ] Test empty name submission
- [ ] Test invalid phone formats
- [ ] Test bio character limit
- [ ] Test invalid dates
- [ ] Test password complexity
- [ ] Test emergency contact validation

### **Functionality Testing:**
- [ ] Test profile save/cancel
- [ ] Test password change
- [ ] Test avatar upload
- [ ] Test email change (when implemented)
- [ ] Test soc
