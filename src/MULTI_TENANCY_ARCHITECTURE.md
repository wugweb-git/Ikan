# Multi-Tenancy Architecture for iKan Mental Health PWA

## 🎯 Critical Issue Identified

**Concern:** Multiple users logging in to enroll for assessments, equip programs, and mood journal need proper data isolation.

**Current Risk:** Without proper multi-tenancy, user data could leak across accounts.

---

## 📊 Data Classification

### Global Resources (Shared across all users)
These are **templates/definitions** that all users can access:

```
✅ professional:*        - Mental health professionals (public directory)
✅ resource:*           - Educational articles (public library)
✅ assessment:*         - Assessment templates (what questions to ask)
✅ equip:*             - Program templates (what content to deliver)
✅ cms:*               - Public pages (FAQ, Privacy, etc.)
```

### User-Specific Data (MUST be isolated per user)
These contain **private user data** that MUST be scoped to userId:

```
⚠️ CRITICAL - Needs User Scoping:
- Journal entries (mood tracking, thoughts)
- Assessment results (mental health scores)
- Program enrollments (which programs user joined)
- Consultation bookings (appointments)
- User preferences
- Notification settings
```

---

## 🔐 Proposed Multi-Tenant KV Schema

### Current Schema (PROBLEMATIC)
```
user:${userId}                    ✅ Already scoped
journal:${entryId}                ❌ NOT scoped - SECURITY RISK!
assessment:${assessmentId}        ✅ Global template (OK)
equip:${programId}                ✅ Global template (OK)
```

### New Multi-Tenant Schema (SECURE)

```typescript
// ============================================
// GLOBAL RESOURCES (Templates/Directories)
// ============================================
professional:${professionalId}         // Shared directory
resource:${resourceId}                 // Shared library
assessment:${assessmentId}             // Assessment template
equip:${programId}                     // Program template
cms:${pageId}                          // Public pages

// ============================================
// USER-SPECIFIC DATA (Per-User Isolation)
// ============================================
user:${userId}                         // User profile

// Journal Entries (MOST SENSITIVE)
journal:${userId}:${entryId}           // ✅ User-scoped journal
journal:${userId}:latest               // Latest entry quick access

// Assessment Results
assessment-result:${userId}:${assessmentId}:${timestamp}
assessment-result:${userId}:latest     // Latest results

// Program Enrollments
enrollment:${userId}:${programId}      // Enrollment record
enrollment:${userId}:${programId}:progress  // Progress tracking
enrollment:${userId}:${programId}:day:${dayNum}  // Day completion

// Consultation Bookings
booking:${userId}:${bookingId}         // User's bookings
booking:${professionalId}:${bookingId} // Professional's bookings

// User Preferences
preference:${userId}:notifications     // Notification settings
preference:${userId}:privacy          // Privacy settings
preference:${userId}:theme            // UI preferences

// Activity Tracking
activity:${userId}:${timestamp}       // User activity log
```

---

## 🛠️ Implementation Changes Required

### 1. Update Journal Entry Schema

**Current (INSECURE):**
```typescript
// ❌ Anyone can access any journal entry!
await kv.set(`journal:${entryId}`, journalData);
await kv.get(`journal:${entryId}`);
```

**New (SECURE):**
```typescript
// ✅ Only user can access their own journals
await kv.set(`journal:${userId}:${entryId}`, journalData);
await kv.getByPrefix(`journal:${userId}:`);  // Get all user's entries
```

### 2. Update Assessment Results

**New Structure:**
```typescript
interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  answers: Record<string, any>;
  score: number;
  interpretation: string;
  completed_at: string;
}

// Store user's assessment result
await kv.set(
  `assessment-result:${userId}:${assessmentId}:${timestamp}`,
  result
);

// Get user's assessment history
const results = await kv.getByPrefix(`assessment-result:${userId}:`);
```

### 3. Update Program Enrollments

**New Structure:**
```typescript
interface ProgramEnrollment {
  userId: string;
  programId: string;
  enrolled_at: string;
  current_day: number;
  completed_days: number[];
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100%
}

// Enroll user in program
await kv.set(`enrollment:${userId}:${programId}`, enrollment);

// Update day progress
await kv.set(
  `enrollment:${userId}:${programId}:day:${dayNum}`,
  { completed: true, completed_at: new Date().toISOString() }
);

// Get user's enrollments
const enrollments = await kv.getByPrefix(`enrollment:${userId}:`);
```

### 4. Update Consultation Bookings

**New Structure:**
```typescript
interface Booking {
  id: string;
  userId: string;
  professionalId: string;
  session_type: 'video' | 'call' | 'chat';
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
}

// Create booking
await kv.set(`booking:${userId}:${bookingId}`, booking);
await kv.set(`booking:${professionalId}:${bookingId}`, booking);

// Get user's bookings
const userBookings = await kv.getByPrefix(`booking:${userId}:`);

// Get professional's bookings
const professionalBookings = await kv.getByPrefix(`booking:${professionalId}:`);
```

---

## 🔒 Server-Side Authorization

### Middleware for User-Scoped Data

```typescript
// /supabase/functions/server/middleware/auth.ts

export async function requireAuth(c: Context) {
  const token = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (!user || error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('userId', user.id);
  c.set('user', user);
  return null;
}

export async function requireOwnership(c: Context, resourceUserId: string) {
  const currentUserId = c.get('userId');
  
  if (currentUserId !== resourceUserId && !isAdmin(currentUserId)) {
    return c.json({ error: 'Forbidden: You can only access your own data' }, 403);
  }
  
  return null;
}
```

### Protected Routes Example

```typescript
// Journal Entries - MUST be user-scoped
app.post('/journal', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  const userId = c.get('userId');
  const { content, mood, tags } = await c.req.json();
  
  const entryId = crypto.randomUUID();
  const entry = {
    id: entryId,
    userId,  // ✅ Always set from authenticated user
    content,
    mood,
    tags,
    created_at: new Date().toISOString()
  };
  
  // ✅ Store with user-scoped key
  await kv.set(`journal:${userId}:${entryId}`, entry);
  
  return c.json(entry, 201);
});

app.get('/journal', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  const userId = c.get('userId');
  
  // ✅ Only get current user's journals
  const entries = await kv.getByPrefix(`journal:${userId}:`);
  
  return c.json({ entries });
});

// Assessment Results
app.post('/assessments/:assessmentId/submit', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  const userId = c.get('userId');
  const assessmentId = c.req.param('assessmentId');
  const { answers } = await c.req.json();
  
  // Calculate score
  const assessment = await kv.get(`assessment:${assessmentId}`);
  const score = calculateScore(assessment, answers);
  
  const result = {
    id: crypto.randomUUID(),
    userId,
    assessmentId,
    answers,
    score,
    interpretation: getInterpretation(assessment, score),
    completed_at: new Date().toISOString()
  };
  
  // ✅ Store with user-scoped key
  await kv.set(
    `assessment-result:${userId}:${assessmentId}:${Date.now()}`,
    result
  );
  
  return c.json(result, 201);
});

// Program Enrollment
app.post('/equip/:programId/enroll', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  const userId = c.get('userId');
  const programId = c.req.param('programId');
  
  const enrollment = {
    userId,
    programId,
    enrolled_at: new Date().toISOString(),
    current_day: 1,
    completed_days: [],
    status: 'active',
    progress: 0
  };
  
  // ✅ Store with user-scoped key
  await kv.set(`enrollment:${userId}:${programId}`, enrollment);
  
  return c.json(enrollment, 201);
});
```

---

## 🎯 Admin Panel Changes

### Admin Can View All Users' Data

Admins need special permissions to view/manage user data:

```typescript
// Admin endpoint to view user's journal (for support)
app.get('/admin/users/:userId/journal', async (c) => {
  const authError = await requireAuth(c);
  if (authError) return authError;
  
  const adminUserId = c.get('userId');
  const targetUserId = c.req.param('userId');
  
  // ✅ Check if current user is admin
  const admin = await kv.get(`user:${adminUserId}`);
  if (admin.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  
  // ✅ Admin can access any user's data
  const entries = await kv.getByPrefix(`journal:${targetUserId}:`);
  
  return c.json({ 
    userId: targetUserId,
    entries,
    _note: 'Admin access logged for audit'
  });
});
```

---

## 📋 Migration Checklist

### Phase 1: Update Backend (HIGH PRIORITY)

- [ ] Update journal endpoints to use `journal:${userId}:${entryId}`
- [ ] Create assessment result endpoints with user scoping
- [ ] Create enrollment endpoints with user scoping
- [ ] Add authentication middleware to all user data endpoints
- [ ] Add ownership verification middleware
- [ ] Update kv_store queries to use new prefixes

### Phase 2: Update Frontend

- [ ] Update JournalScreen to use new endpoints
- [ ] Update AssessmentScreen to submit results
- [ ] Update EquipScreen to track enrollments
- [ ] Update ConsultationScreen to create bookings
- [ ] Add proper error handling for 401/403 responses

### Phase 3: Data Migration

- [ ] Create migration script for existing journal entries
- [ ] Backup all existing data
- [ ] Run migration to new schema
- [ ] Verify data integrity
- [ ] Update admin panel to query new schema

### Phase 4: Testing

- [ ] Test multi-user isolation (User A cannot see User B's data)
- [ ] Test admin access (Admin can see all users' data)
- [ ] Test authentication (Unauthorized users blocked)
- [ ] Test authorization (Users can only access their own data)
- [ ] Load testing with multiple concurrent users

---

## 🔍 Security Audit Points

### Critical Checks

1. **Authentication**: Every user data endpoint requires valid session token
2. **Authorization**: Users can only access their own data (except admins)
3. **Data Scoping**: All user data uses `${userId}` in key prefix
4. **SQL Injection**: Not applicable (using KV store)
5. **XSS Prevention**: Sanitize user input before storing
6. **CSRF Protection**: Use proper CORS and tokens
7. **Rate Limiting**: Prevent abuse of endpoints
8. **Audit Logging**: Log all admin access to user data

### Privacy Compliance (GDPR/HIPAA-like)

- [ ] User can export their data
- [ ] User can delete their data
- [ ] Data is encrypted at rest (Supabase handles this)
- [ ] Data is encrypted in transit (HTTPS)
- [ ] Audit trail for data access
- [ ] Consent tracking for data usage
- [ ] Data retention policies

---

## 🚨 Current Vulnerabilities

### HIGH RISK (Fix Immediately)

1. **Journal Entries**: ❌ Not user-scoped
   - **Impact**: User A can access User B's journal
   - **Fix**: Use `journal:${userId}:${entryId}` pattern

2. **Assessment Results**: ❌ Not stored per user
   - **Impact**: No way to track user's mental health progress
   - **Fix**: Store results with `assessment-result:${userId}:*`

3. **Program Enrollments**: ❌ Not tracked
   - **Impact**: Users can't resume programs, no progress tracking
   - **Fix**: Create enrollment records with `enrollment:${userId}:*`

### MEDIUM RISK (Fix Soon)

4. **No Authorization Checks**: ⚠️ Endpoints don't verify user ownership
   - **Impact**: Potential data leakage if IDs are guessed
   - **Fix**: Add middleware to check userId matches session

5. **No Audit Logging**: ⚠️ Admin access not logged
   - **Impact**: No accountability for admin actions
   - **Fix**: Log all admin data access

---

## ✅ Recommended Implementation Order

### Week 1: Critical Security Fixes

1. **Day 1-2**: Update journal endpoints with user scoping
2. **Day 3**: Add authentication middleware
3. **Day 4**: Add authorization checks
4. **Day 5**: Test multi-user isolation

### Week 2: Feature Completion

5. **Day 1-2**: Implement assessment result storage
6. **Day 3**: Implement program enrollment tracking
7. **Day 4**: Implement consultation bookings
8. **Day 5**: Test all user flows

### Week 3: Admin & Monitoring

9. **Day 1-2**: Update admin panel for new schema
10. **Day 3**: Implement audit logging
11. **Day 4**: Implement data export (GDPR)
12. **Day 5**: Security audit & penetration testing

---

## 📊 Example User Flow

### User Journey: Taking an Assessment

```
1. User logs in → Gets JWT token
2. User navigates to Assess screen
3. User selects "PHQ-9 Depression Screening"
4. Frontend fetches: GET /assessments/phq9
   - Returns: Assessment template (questions, scoring)
   
5. User answers questions
6. User submits: POST /assessments/phq9/submit
   - Headers: Authorization: Bearer {token}
   - Body: { answers: {...} }
   - Server verifies token → extracts userId
   - Server calculates score
   - Server stores: assessment-result:{userId}:phq9:{timestamp}
   - Returns: { score, interpretation, recommendations }
   
7. User views results immediately
8. User can later view history: GET /my-assessment-results
   - Returns all results for current user only
```

### User Journey: Enrolling in Equip Program

```
1. User browses programs: GET /equip
   - Returns: All program templates
   
2. User clicks "Enroll" on "7-Day Stress Relief"
3. Frontend calls: POST /equip/stress-relief-7d/enroll
   - Headers: Authorization: Bearer {token}
   - Server creates: enrollment:{userId}:stress-relief-7d
   - Returns: { enrollment, current_day: 1 }
   
4. User completes Day 1 content
5. Frontend calls: POST /equip/stress-relief-7d/complete-day/1
   - Server updates: enrollment:{userId}:stress-relief-7d
   - Server marks: enrollment:{userId}:stress-relief-7d:day:1 = completed
   
6. User views "My Programs": GET /my-enrollments
   - Returns: All programs user is enrolled in
   - Shows progress for each
```

---

## 🎯 Summary

**Critical Action Required:**

1. ✅ **Acknowledge** that multi-tenancy is essential
2. 🔧 **Implement** user-scoped keys for all sensitive data
3. 🔒 **Add** authentication and authorization middleware
4. 🧪 **Test** that users cannot access each other's data
5. 📝 **Document** new API endpoints with security considerations

**This is not optional - it's a security requirement for a mental health app handling sensitive personal data.**

---

*Last Updated: December 2024*
*Priority: 🔴 CRITICAL - Security & Privacy*
