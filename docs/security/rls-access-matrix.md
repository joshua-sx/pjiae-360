# Row Level Security (RLS) Access Matrix

## Overview
This document provides a comprehensive review of all RLS policies across key tables in the Smart Goals 360 platform. It documents the intended access patterns and identifies any security gaps or risks.

## Security Model Summary
- **Organization Isolation**: All data is scoped to organization boundaries via `get_current_user_org_id()`
- **Role Hierarchy**: admin > director > manager > supervisor > employee
- **Self-Access**: Users can generally view/modify their own data
- **Hierarchical Access**: Higher roles can access data of lower roles within their organization

## Table-by-Table RLS Policy Review

### 1. profiles (RECENTLY UPDATED - SECURE)
**Purpose**: User profile information (names, emails, phone numbers)

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|---------|---------|---------|---------|
| Self | ✅ Own profile | ❌ | ✅ Own profile | ❌ |
| Employee | ❌ Others | ❌ | ❌ Others | ❌ |
| Supervisor | ❌ Others | ❌ | ❌ Others | ❌ |
| Manager | ✅ Direct reports only | ❌ | ❌ | ❌ |
| Director | ✅ All in org | ❌ | ❌ | ❌ |
| Admin | ✅ All in org | ❌ | ❌ | ❌ |

**Policies**:
- `Users can view own profile`: user_id = auth.uid()
- `Admins can view all profiles`: Admin + org check
- `Managers can view direct reports profiles`: Manager + manager_id check
- `Directors can view organization profiles`: Director + org check

**Security Notes**: 
- ✅ SECURE: Recently updated to prevent unauthorized access to personal data
- ✅ No recursive RLS issues (uses SECURITY DEFINER functions)

### 2. employee_info (COMPLEX - NEEDS REVIEW)
**Purpose**: Employment data (job titles, departments, managers, hire dates)

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|---------|---------|---------|---------|
| Self | ✅ Own record | ✅ Own record | ✅ Own record | ❌ |
| Employee | ❌ Others | ❌ | ❌ | ❌ |
| Supervisor | ❌ | ❌ | ❌ | ❌ |
| Manager | ❌ | ❌ | ❌ | ❌ |
| Director | ✅ All in org | ✅ All in org | ✅ All in org | ✅ All in org |
| Admin | ✅ All in org | ✅ All in org | ✅ All in org | ✅ All in org |

**Policies**:
- `employee_info_select_all`: Self OR Admin OR Director
- `employee_info_insert_self`: Self only
- `employee_info_insert_admins`: Admin OR Director
- `employee_info_update_self`: Self only  
- `employee_info_update_admins`: Admin OR Director
- `employee_info_delete_admins`: Admin OR Director

**Security Issues**:
- ⚠️ **GAP**: Managers cannot view their direct reports' employee info
- ⚠️ **GAP**: No read access for HR roles or managers who need to see org structure
- ✅ Properly org-scoped

### 3. user_roles (ADMIN ONLY - SECURE)
**Purpose**: Role assignments for users

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|---------|---------|---------|---------|
| Self | ✅ Own roles in org | ❌ | ❌ | ❌ |
| All Users | ✅ All in org | ❌ | ❌ | ❌ |
| Admin | ✅ All | ✅ All | ✅ All | ✅ All |

**Policies**:
- `Users can view roles in their organization`: org check
- `Users can create their initial admin role`: First admin only
- `Admins can manage roles`: Admin only

**Security Notes**:
- ✅ SECURE: Proper admin-only management
- ✅ Allows initial org setup (first admin)

### 4. goals (ROLE-BASED - COMPLEX)
**Purpose**: Goal creation and management

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|---------|---------|---------|---------|
| Creator | ✅ Own goals | ✅ Any | ✅ Own goals | ❌ |
| Assignee | ✅ Assigned goals | ❌ | ❌ | ❌ |
| Manager | ✅ Team goals | ❌ | ✅ Team goals | ❌ |
| Director | ✅ All in org | ❌ | ✅ All | ✅ All |
| Admin | ✅ All in org | ❌ | ✅ All | ✅ All |

**Policies**:
- `Role-based goal access`: Complex logic for creators, assignees, managers
- `Users can create goals`: Org-scoped insert
- `Users can update goals they created or manage`: Creator/Admin/Director/Manager
- `Admins and directors can delete goals`: Admin/Director only

**Security Issues**:
- ✅ Well-designed hierarchical access
- ⚠️ **COMPLEX**: Policy logic is intricate - needs testing

### 5. appraisals (MANAGER-FOCUSED - SECURE)
**Purpose**: Performance appraisal data

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|---------|---------|---------|---------|
| Employee | ✅ Own appraisals | ❌ | ❌ | ❌ |
| Manager | ✅ All appraisals | ✅ All | ✅ All | ❌ |
| Admin | ✅ All appraisals | ✅ All | ✅ All | ❌ |

**Policies**:
- `Users can view their own appraisals`: Self + org check
- `Managers can manage appraisals`: Manager/Admin roles

**Security Notes**:
- ✅ Appropriate manager access for appraisal process
- ⚠️ **QUESTION**: Should directors have access?

### 6. organizations (ORG-SCOPED - SECURE)
**Purpose**: Organization configuration

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|---------|---------|---------|---------|
| All Users | ✅ Own org | ❌ | ❌ | ❌ |
| Authenticated | ❌ | ✅ Create new | ❌ | ❌ |
| Org Members | ❌ | ❌ | ✅ Own org | ❌ |

**Security Notes**:
- ✅ SECURE: Proper org boundaries
- ✅ Allows org creation for new setups

## Security Definer Functions Review

### Existing Functions (SECURE)
- ✅ `get_current_user_org_id()`: Returns user's organization ID
- ✅ `has_role()`, `has_role_simple()`: Role checking without recursion
- ✅ `get_current_user_roles()`: Returns active roles for user

### Functions Preventing RLS Recursion
- ✅ All role-checking functions use SECURITY DEFINER
- ✅ No policies reference the same table they're applied to

## Critical Security Gaps Identified

### HIGH PRIORITY
1. **Manager Access Gap**: Managers cannot view employee_info for their direct reports
2. **Director Appraisal Access**: Directors may need appraisal visibility for strategic oversight
3. **HR Role Missing**: No dedicated HR role with appropriate cross-department access

### MEDIUM PRIORITY  
4. **Audit Trail Access**: Limited visibility into security_audit_log
5. **Complex Policy Testing**: Goals table has complex logic that needs validation

### LOW PRIORITY
6. **Competency Access**: Review competency framework access patterns
7. **Import Process**: Validate import_batches and related table policies

## Recommendations

### Immediate Actions (Must Fix)
1. Add manager access to employee_info for direct reports
2. Test all complex goal policies with real scenarios
3. Consider director access to appraisals

### Security Hardening (Should Do)
1. Add HR role with cross-department employee visibility
2. Implement more granular audit log access
3. Add rate limiting on sensitive operations

### Monitoring (Could Do)
1. Add policy performance monitoring
2. Create RLS policy testing suite
3. Implement access pattern analytics

## Access Matrix Legend
- ✅ = Allowed
- ❌ = Denied  
- ⚠️ = Needs Review
- 🔍 = Complex Logic

## Testing Requirements
Each policy should be tested with:
1. Positive cases (allowed access)
2. Negative cases (denied access)  
3. Cross-organization boundary tests
4. Role escalation attempts
5. Edge cases (null values, missing relationships)