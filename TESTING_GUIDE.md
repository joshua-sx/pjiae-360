# Phase 4: Testing & Validation Guide

## Overview
This guide provides comprehensive testing procedures for all implemented features in the employee import and role management system.

## 🔧 Test Components Created

### 1. SystemTestPanel (`src/components/debug/SystemTestPanel.tsx`)
- Comprehensive system health checks
- Authentication and permission validation
- Database connectivity tests
- Role management verification

### 2. ImportTestSuite (`src/components/debug/ImportTestSuite.tsx`)
- Employee import functionality testing
- Single and bulk import scenarios
- Real-time validation and error reporting

## 📋 Testing Checklist

### Phase 1: UUID Generation & Role Assignment
- [ ] **UUID Generation Test**
  - Generate employee records with crypto.randomUUID()
  - Verify UUIDs are valid (36 characters, proper format)
  - Confirm edge function accepts generated UUIDs

- [ ] **Role Assignment Test**
  - Import employees with different roles (employee, supervisor, manager, director)
  - Verify roles are correctly assigned in user_roles table
  - Check role hierarchy and permissions

### Phase 2: Organization Creation & Admin Role Assignment
- [ ] **New User Organization Creation**
  - Register a new user account
  - Verify organization is created automatically
  - Confirm user profile is linked to organization

- [ ] **Admin Role Assignment**
  - Check first user in organization gets admin role
  - Verify subsequent users get employee role by default
  - Test admin capabilities (employee management, role assignment)

- [ ] **Organization Isolation**
  - Verify users can only see employees in their organization
  - Test RLS policies prevent cross-organization access

### Phase 3: Permission System & Bulk Operations
- [ ] **Permission Enforcement**
  - Test access to admin-only features
  - Verify role-based navigation restrictions
  - Check permission guards on sensitive operations

- [ ] **Bulk Role Assignment**
  - Select multiple employees
  - Assign roles in bulk
  - Verify all assignments complete successfully
  - Check audit trail for bulk operations

## 🧪 Test Scenarios

### Scenario 1: New Organization Setup
1. **Register new user**: Create account with email `admin@newcompany.com`
2. **Verify admin role**: Check user receives admin role automatically
3. **Import employees**: Upload CSV with 5-10 employees
4. **Assign roles**: Use bulk assignment to set managers and supervisors
5. **Test permissions**: Verify role-based access works correctly

### Scenario 2: Existing Organization Import
1. **Login as admin**: Use existing admin account
2. **Import new batch**: Add 5+ employees to existing organization
3. **Role assignment**: Test individual and bulk role assignments
4. **Permission validation**: Verify new employees have correct access

### Scenario 3: Permission Edge Cases
1. **Non-admin user**: Test employee trying to access admin features
2. **Manager permissions**: Verify managers can assign lower roles only
3. **Supervisor limits**: Check supervisors cannot assign manager roles
4. **Cross-organization**: Ensure users cannot access other organizations

## 🚀 Running Tests

### Using Test Components
```bash
# Add test components to admin dashboard or create test route
/admin/tests/system-tests    # SystemTestPanel
/admin/tests/import-tests    # ImportTestSuite
```

### Manual Testing Steps

1. **System Health Check**
   ```bash
   # Navigate to SystemTestPanel
   # Click "Run All Tests"
   # Review all test suites for failures
   ```

2. **Import Testing**
   ```bash
   # Navigate to ImportTestSuite
   # Test single employee import
   # Test bulk import with 5+ employees
   # Verify success rates and error handling
   ```

3. **Role Assignment Testing**
   ```bash
   # Navigate to employee management
   # Select multiple employees
   # Use bulk role assignment
   # Verify audit logs and permissions
   ```

## 🔍 Verification Points

### Database Verification
```sql
-- Check user roles
SELECT ur.*, ei.name, ei.email 
FROM user_roles ur 
JOIN employee_info ei ON ei.id = ur.profile_id 
WHERE ur.is_active = true;

-- Check organization isolation
SELECT o.name, COUNT(ei.id) as employee_count
FROM organizations o
LEFT JOIN employee_info ei ON ei.organization_id = o.id
GROUP BY o.id, o.name;

-- Check role audit trail
SELECT ral.*, ei.name, ei.email
FROM role_audit_log ral
JOIN employee_info ei ON ei.id = ral.profile_id
ORDER BY ral.created_at DESC
LIMIT 20;
```

### Frontend Verification
- [ ] Permission guards prevent unauthorized access
- [ ] Role-based navigation shows correct menu items
- [ ] Bulk operations work with selected employees
- [ ] Error messages are user-friendly and helpful
- [ ] Loading states show during operations

## 🐛 Common Issues & Solutions

### Issue 1: UUID Validation Errors
**Problem**: Edge function rejects UUIDs
**Solution**: Verify crypto.randomUUID() is used, not timestamp-based IDs

### Issue 2: Permission Denied Errors
**Problem**: Users cannot access features they should have access to
**Solution**: Check role assignment and permission calculation logic

### Issue 3: Organization Isolation Failures
**Problem**: Users see employees from other organizations
**Solution**: Verify RLS policies and organization_id filters

### Issue 4: Bulk Operations Timeout
**Problem**: Bulk assignments fail with large employee counts
**Solution**: Implement batching or increase timeout limits

## 📊 Success Criteria

### System is considered working correctly when:
- [ ] All SystemTestPanel tests pass (green status)
- [ ] Import success rate is >95% for valid data
- [ ] Role assignments complete within 5 seconds
- [ ] Permission enforcement is 100% effective
- [ ] No cross-organization data leakage occurs
- [ ] Audit logs capture all role changes
- [ ] UI shows appropriate loading and error states

## 🔄 Continuous Testing

### After Each Change:
1. Run SystemTestPanel full suite
2. Test affected functionality specifically
3. Verify no regressions in other areas
4. Check browser console for errors
5. Review network requests for failures

### Before Production:
1. Complete all test scenarios above
2. Test with realistic data volumes (100+ employees)
3. Verify performance under load
4. Check security with different user roles
5. Test error recovery and edge cases

This comprehensive testing approach ensures the system works reliably across all implemented features and use cases.