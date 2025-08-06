/**
 * Breadcrumb configuration for dynamic route mapping
 */

export interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    parent?: string;
    dynamic?: boolean;
    resolver?: (params: Record<string, string>) => string;
  };
}

/**
 * Configuration for breadcrumb labels and hierarchy
 */
export const breadcrumbConfig: BreadcrumbConfig = {
  // Root level
  dashboard: { label: 'Dashboard' },
  
  // Main sections
  goals: { label: 'Goals' },
  appraisals: { label: 'Appraisals' },
  calendar: { label: 'Calendar' },
  
  // Admin sections
  employees: { label: 'Employees' },
  organization: { label: 'Organization' },
  cycles: { label: 'Appraisal Cycles' },
  reports: { label: 'Reports' },
  roles: { label: 'Roles & Permissions' },
  audit: { label: 'Audit Log' },
  settings: { label: 'Settings' },
  analytics: { label: 'Analytics' },
  
  // Manager/Supervisor sections
  personal: { label: 'Personal' },
  team: { label: 'Team' },
  
  // Actions
  create: { label: 'Create' },
  import: { label: 'Import' },
  manage: { label: 'Manage' },
  new: { label: 'New' },
  edit: { label: 'Edit' },
  
  // Nested routes
  'employees/import': { label: 'Import Employees', parent: 'employees' },
  'roles/manage': { label: 'Manage Roles', parent: 'roles' },
  'team/goals': { label: 'Team Goals', parent: 'team' },
  'team/appraisals': { label: 'Team Appraisals', parent: 'team' },
  'personal/goals': { label: 'Personal Goals', parent: 'personal' },
  'personal/appraisals': { label: 'Personal Appraisals', parent: 'personal' },
  
  // Dynamic routes (examples)
  'goals/:id': { 
    label: 'Goal Details', 
    parent: 'goals',
    dynamic: true,
    resolver: (params) => `Goal: ${params.id}`
  },
  'appraisals/:id': { 
    label: 'Appraisal Details', 
    parent: 'appraisals',
    dynamic: true,
    resolver: (params) => `Appraisal: ${params.id}`
  },
  'employees/:id': { 
    label: 'Employee Details', 
    parent: 'employees',
    dynamic: true,
    resolver: (params) => `Employee: ${params.id}`
  },
};

/**
 * Get breadcrumb label for a route segment
 */
export function getBreadcrumbLabel(segment: string, params?: Record<string, string>): string {
  const config = breadcrumbConfig[segment];
  
  if (!config) {
    // Fallback to capitalized segment
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  }
  
  if (config.dynamic && config.resolver && params) {
    return config.resolver(params);
  }
  
  return config.label;
}

/**
 * Get parent route for a given segment
 */
export function getBreadcrumbParent(segment: string): string | undefined {
  return breadcrumbConfig[segment]?.parent;
}