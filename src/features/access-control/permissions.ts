/**
 * Centralized permission constants for the application
 * This is the single source of truth for all permission strings
 */

// Core permissions
export const PERMISSIONS = {
  // Employee management
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_EMPLOYEES: 'view_employees', 
  IMPORT_EMPLOYEES: 'import_employees',
  
  // Reports and analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Appraisals
  CREATE_APPRAISALS: 'create_appraisals',
  MANAGE_APPRAISALS: 'manage_appraisals',
  VIEW_ALL_APPRAISALS: 'view_all_appraisals',
  CALIBRATE_APPRAISALS: 'calibrate_appraisals',
  
  // Goals
  MANAGE_GOALS: 'manage_goals',
  CREATE_GOALS: 'create_goals',
  ASSIGN_GOALS: 'assign_goals',
  
  // Role management
  MANAGE_ROLES: 'manage_roles',
  ASSIGN_ROLES: 'assign_roles',
  VIEW_ROLES: 'view_roles',
  
  // System administration
  VIEW_AUDIT: 'view_audit',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_ORGANIZATION: 'manage_organization',
  MANAGE_APPRAISAL_CYCLES: 'manage_appraisal_cycles',
  
  // Security
  MANAGE_SECURITY: 'manage_security',
  VIEW_SECURITY_LOGS: 'view_security_logs',
  
  // System operations
  BULK_OPERATIONS: 'bulk_operations',
  DATA_EXPORT: 'data_export',
  SYSTEM_MAINTENANCE: 'system_maintenance'
} as const;

// Export type for TypeScript safety
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role hierarchy levels for comparison
export const ROLE_LEVELS = {
  admin: 5,
  director: 4,
  manager: 3,
  supervisor: 2,
  employee: 1
} as const;

// Permission groups for UI organization
export const PERMISSION_GROUPS = {
  EMPLOYEE_MANAGEMENT: [
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.IMPORT_EMPLOYEES
  ],
  REPORTING: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  APPRAISALS: [
    PERMISSIONS.CREATE_APPRAISALS,
    PERMISSIONS.MANAGE_APPRAISALS,
    PERMISSIONS.VIEW_ALL_APPRAISALS,
    PERMISSIONS.CALIBRATE_APPRAISALS
  ],
  GOALS: [
    PERMISSIONS.MANAGE_GOALS,
    PERMISSIONS.CREATE_GOALS,
    PERMISSIONS.ASSIGN_GOALS
  ],
  ADMINISTRATION: [
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_AUDIT,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_ORGANIZATION,
    PERMISSIONS.MANAGE_APPRAISAL_CYCLES
  ]
} as const;