# Multi-Tenant Architecture Documentation

## Overview

This application implements a **Shared Database + Tenant ID Column** multi-tenancy model using PostgreSQL with Row Level Security (RLS). This is a modern best practice for multi-tenant SaaS applications providing strong data isolation while maintaining cost efficiency.

## Architecture Components

### 1. Database Design

- **Single PostgreSQL database** shared across all tenants
- **`organization_id` column** on all tenant-scoped tables for data partitioning
- **Row Level Security (RLS)** enabled on all tables with tenant data
- **Security Definer functions** for organization-aware operations

### 2. Data Isolation Mechanisms

#### Primary Isolation: RLS Policies
All tenant tables have RLS policies that automatically filter data by organization:

```sql
-- Example policy pattern
CREATE POLICY "Users can only see data in their organization"
ON tenant_table FOR ALL
USING (organization_id = get_current_user_org_id());
```

#### Secondary Isolation: Organization-Aware Functions
Database functions enforce organization context:

- `get_current_user_org_id()` - Returns current user's organization ID
- `has_role(role)` - Checks roles within user's organization only
- `has_role_at_least(role)` - Hierarchical role checking within organization

#### Tertiary Isolation: Application Guards
Frontend and backend operations use security wrappers:

- `guardMultiTenantOperation()` - Validates session and organization context
- `secureWriteOperation()` / `secureReadOperation()` - Secure mutation/query wrappers
- Cross-organization access detection and logging

### 3. Security Features

#### Audit Logging
- **Secure edge function** (`secure-audit-log`) for all security events
- **Hardened database trigger** automatically sets user/org context on audit logs
- **Performance index** on `(organization_id, created_at)` for fast admin queries

#### Session Security
- **Multi-tenant session validation** with organization binding
- **Session fingerprinting** to detect hijacking attempts
- **Automatic session refresh** with organization re-validation

#### Invitation System
- **Secure token-based invitations** with organization pre-assignment
- **Atomic claiming process** that links users to correct organization
- **Invitation expiry** and status tracking

### 4. Frontend Security Patterns

#### Route Protection
- **Organization-aware route guards** that validate user belongs to an organization
- **Onboarding flow separation** from production data access
- **Demo mode isolation** from production database operations

#### Error Handling
- **Tenancy-specific error mapping** for 403/RLS violations
- **User-friendly messages** that don't leak security details
- **Automatic logging** of cross-tenant access attempts

#### Data Access
- **useDataAccessGuard** hook prevents database calls in demo mode
- **Secure operation wrappers** for all mutations
- **Organization context validation** before sensitive operations

## Implementation Guidelines

### Database Changes
1. All new tenant tables MUST include `organization_id uuid NOT NULL`
2. All tenant tables MUST have RLS enabled with organization filtering
3. Use `get_current_user_org_id()` in policies for consistent organization resolution
4. Prefer `has_role()` over `has_role_simple()` for new policies

### Frontend Development
1. Wrap all write operations with `secureWriteOperation()`
2. Use `guardMultiTenantOperation()` for sensitive reads
3. Handle tenancy errors with `handleTenancyError()`
4. Validate organization context before UI state changes

### Security Operations
1. All security events MUST go through `secure-audit-log` edge function
2. Use `logSecurityEvent()` for client-side security logging
3. Monitor audit logs for cross-organization access attempts
4. Validate invitation tokens server-side only

## Verification Checklist

### Database Security
- [ ] All tenant tables have RLS enabled
- [ ] All policies use organization-scoped functions
- [ ] Audit log trigger enforces context automatically
- [ ] Cross-tenant queries return empty results

### Application Security  
- [ ] All mutations use secure operation wrappers
- [ ] Session validation includes organization binding
- [ ] Demo mode is isolated from production data
- [ ] Error messages don't leak cross-tenant information

### Monitoring
- [ ] Security audit logs capture all tenant violations
- [ ] Performance indexes support organization-scoped queries
- [ ] Cross-organization access attempts are logged and blocked
- [ ] Invitation flow prevents organization mismatches

## Known Limitations

1. **Single Database Performance**: Heavy tenant load can impact others (mitigated by connection pooling and indexes)
2. **Manual Auth Config**: Leaked password protection requires manual Supabase dashboard configuration  
3. **Demo Mode Separation**: Requires careful frontend logic to prevent production database access

## Security Compliance

This implementation provides:
- **Data isolation** at the database level through RLS
- **Access control** through organization-aware role checking  
- **Audit trails** for all security-relevant operations
- **Session security** with multi-tenant validation
- **Cross-tenant protection** with automatic violation detection

The architecture follows enterprise security best practices for multi-tenant SaaS applications.