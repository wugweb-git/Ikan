# iKan Admin Setup Guide

## Quick Start: Setting Up Your First Admin User

### Method 1: Bootstrap First Admin (Recommended)

When NO admins exist in the system, any authenticated user can set themselves as admin:

```bash
# 1. Sign up as a new user
POST /auth/signup
{
  "email": "admin@ikan.health",
  "password": "secure_password",
  "name": "Admin User"
}

# 2. Sign in to get access token
POST /auth/signin
{
  "email": "admin@ikan.health",
  "password": "secure_password"
}
# Save the access_token from response

# 3. Set yourself as admin (works only if NO admins exist)
POST /admin/set-admin/:userId
Authorization: Bearer <your_access_token>

Response:
{
  "profile": {
    "user_id": "...",
    "email": "admin@ikan.health",
    "name": "Admin User",
    "is_admin": true,
    "admin_since": "2024-12-15T..."
  }
}
```

### Method 2: Existing Admin Assigns New Admin

Once you have at least one admin, only admins can create new admins:

```bash
# Admin must be authenticated
POST /admin/set-admin/:targetUserId
Authorization: Bearer <admin_access_token>

# If requester is not admin: 403 Forbidden
# If requester is admin: New user granted admin access
```

---

## Testing Admin Access

### Test if User is Admin:

```bash
# Try accessing any admin endpoint
GET /admin/users
Authorization: Bearer <access_token>

# Response if admin: 200 OK with data
# Response if not admin: 403 Forbidden
{
  "error": "Admin access required"
}
```

### Check User Profile for Admin Status:

```bash
GET /users/profile
Authorization: Bearer <access_token>

Response:
{
  "user_id": "...",
  "email": "...",
  "name": "...",
  "is_admin": true,  ← Check this field
  "admin_since": "2024-12-15T..."
}
```

---

## Admin Permissions Overview

### What Admins Can Do:

✅ **User Management**
- View all users
- Update user profiles
- Delete users
- Grant/revoke admin access

✅ **Content Management**
- Create/Edit/Delete Assessments
- Create/Edit/Delete Equip Programs
- Create/Edit/Delete Resources
- Create/Edit/Delete Professionals

✅ **System Monitoring**
- View API logs
- View system logs
- Monitor performance metrics
- Review security alerts
- Access audit logs
- Manage active sessions

✅ **Configuration**
- Configure communication APIs (Email/SMS/WhatsApp)
- Configure payment gateways (Razorpay/Stripe/PayPal)
- Test API integrations

✅ **Testing & Debugging**
- Run CRUD tests
- Browse database
- View system health

### What Regular Users Can Do:

✅ Take assessments  
✅ Enroll in equip programs  
✅ Create journal entries  
✅ View resources  
✅ Book consultations  
✅ Manage their own profile  

❌ Cannot access admin panel  
❌ Cannot modify other users' data  
❌ Cannot access system logs or metrics

---

## Admin Dashboard Navigation

### Accessing the Admin Panel:

1. Sign in as an admin user
2. Navigate to `/admin` route
3. Admin Dashboard will display 14 admin screens organized into 4 sections:

#### **Content Management**
1. Assessments
2. Equip Programs
3. Resources
4. Professionals
5. Pages

#### **Backend**
6. CRUD Testing
7. Migration
8. Database Browser

#### **Monitoring**
9. API Logs
10. System Logs
11. Performance

#### **Configuration**
12. Communication API
13. Payment Gateway
14. Security Dashboard

---

## Security Best Practices

### For Admin Accounts:

1. **Strong Passwords**: Use complex passwords (min 12 characters)
2. **Unique Emails**: Each admin should have a unique email
3. **Limited Admin Accounts**: Only create admins when necessary
4. **Regular Audits**: Review `/admin/security/audit` for suspicious activity
5. **Session Monitoring**: Check `/admin/security/sessions` for active sessions

### Revoking Admin Access:

```bash
# Update user profile to remove admin status
PUT /admin/users/:userId
Authorization: Bearer <admin_access_token>
{
  "is_admin": false
}
```

### Monitoring Admin Activity:

```bash
# View all admin actions
GET /admin/security/audit
Authorization: Bearer <admin_access_token>

# Filter by specific admin user
GET /admin/security/audit?userId=<admin_user_id>
Authorization: Bearer <admin_access_token>
```

---

## Troubleshooting

### Problem: "Admin access required" error

**Cause**: User is not an admin  
**Solution**: 
1. Check user profile: `GET /users/profile`
2. Verify `is_admin: true`
3. If false, have existing admin grant access via `/admin/set-admin/:userId`

### Problem: Cannot set first admin

**Cause**: Another admin already exists  
**Solution**: 
1. Contact existing admin to grant you access
2. Or manually update KV store (development only):
   ```typescript
   await kv.set('user:YOUR_USER_ID', {
     ...existingProfile,
     is_admin: true,
     admin_since: new Date().toISOString()
   });
   ```

### Problem: Lost access to admin account

**Cause**: Account locked or deleted  
**Solution**:
1. Check system logs: `/admin/system-logs`
2. Create new admin using bootstrap method (if no admins remain)
3. Or manually restore admin status in KV store

---

## Development vs Production

### Development Setup:

```typescript
// Seed a demo admin user
POST /seed/users

// This creates demo users, one can be set as admin:
POST /admin/set-admin/demo-user-001
```

### Production Setup:

```typescript
// 1. Create production admin account
POST /auth/signup
{
  "email": "admin@yourcompany.com",
  "password": "very_secure_password_here",
  "name": "Production Admin"
}

// 2. Sign in
POST /auth/signin

// 3. Bootstrap first admin
POST /admin/set-admin/:userId

// 4. Document admin credentials securely
// 5. Create backup admin accounts
```

---

## Admin Endpoint Reference

### User Management
- `GET /admin/users` - List all users
- `PUT /admin/users/:userId` - Update user
- `DELETE /admin/users/:userId` - Delete user
- `POST /admin/set-admin/:userId` - Grant admin access

### Content CRUD
- `POST /assessments` - Create assessment
- `PUT /assessments/:id` - Update assessment
- `DELETE /assessments/:id` - Delete assessment
- *(Same pattern for equip programs, resources, professionals)*

### Monitoring
- `GET /admin/api-logs` - View API request logs
- `GET /admin/system-logs` - View system event logs
- `GET /admin/performance/current` - Current metrics
- `GET /admin/performance/history` - Historical metrics

### Security
- `GET /admin/security/sessions` - Active sessions
- `DELETE /admin/security/sessions/:userId` - Terminate session
- `GET /admin/security/audit` - Audit logs
- `GET /admin/security/alerts` - Security alerts
- `POST /admin/security/alerts/:id/resolve` - Resolve alert

### Configuration
- `GET /admin/communication/config` - Get comm configs
- `POST /admin/communication/config` - Save comm config
- `POST /admin/communication/test` - Test comm API
- `GET /admin/payment/config` - Get payment configs
- `POST /admin/payment/config` - Save payment config
- `POST /admin/payment/test` - Test payment gateway

---

## FAQ

### Q: Can there be multiple admins?
**A**: Yes! Any admin can grant admin access to other users via `/admin/set-admin/:userId`.

### Q: Can admins see other users' private data?
**A**: Yes. Admins can view all data through the admin panel. This is intentional for support and moderation purposes.

### Q: How do I remove admin access?
**A**: Update the user profile: `PUT /admin/users/:userId` with `{ "is_admin": false }`.

### Q: Are admin actions logged?
**A**: Yes! All admin actions are logged in the audit log accessible at `/admin/security/audit`.

### Q: Can regular users become admins?
**A**: Yes, but only if granted by an existing admin via the `/admin/set-admin` endpoint.

### Q: What happens if all admins are deleted?
**A**: The bootstrap mechanism reactivates - any authenticated user can set themselves as admin using `/admin/set-admin/:userId`.

---

## Support

For additional help:
1. Check system logs: `/admin/system-logs`
2. Review audit logs: `/admin/security/audit`
3. Monitor security alerts: `/admin/security/alerts`
4. Contact development team with user ID and timestamp of issue

---

**Last Updated**: December 15, 2024  
**Version**: v1.0  
**Status**: Production Ready
