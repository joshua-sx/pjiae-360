
export interface ActionDefinition {
  label: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  icon?: string;
  category: string;
  objectLabelRule?: (objectType: string, objectName: string, objectId: string) => string;
  detailRule?: (metadata: any) => string;
}

export const ACTION_TAXONOMY: Record<string, ActionDefinition> = {
  // Authentication & Sessions
  'auth.login.success': {
    label: 'Signed in',
    severity: 'success',
    category: 'Authentication',
  },
  'auth.login.failed': {
    label: 'Failed sign-in',
    severity: 'danger',
    category: 'Authentication',
  },
  'auth.session.terminated': {
    label: 'Signed out',
    severity: 'info',
    category: 'Authentication',
  },

  // Employee Management
  'employee.created': {
    label: 'Created employee',
    severity: 'success',
    category: 'Employees',
  },
  'employee.updated': {
    label: 'Updated employee',
    severity: 'info',
    category: 'Employees',
    detailRule: (metadata) => {
      if (metadata?.changes) {
        const fields = Object.keys(metadata.changes);
        return `Updated ${fields.join(', ')}`;
      }
      return undefined;
    },
  },
  'employee.imported': {
    label: 'Imported employees',
    severity: 'success',
    category: 'Employees',
    detailRule: (metadata) => {
      if (metadata?.count) return `${metadata.count} employees`;
      return undefined;
    },
  },

  // Role Management
  'role_granted': {
    label: 'Assigned role',
    severity: 'info',
    category: 'Roles',
    detailRule: (metadata) => metadata?.role ? `Role: ${metadata.role}` : undefined,
  },
  'role_activated': {
    label: 'Activated role',
    severity: 'success',
    category: 'Roles',
    detailRule: (metadata) => metadata?.role ? `Role: ${metadata.role}` : undefined,
  },
  'role_deactivated': {
    label: 'Deactivated role',
    severity: 'warning',
    category: 'Roles',
    detailRule: (metadata) => metadata?.role ? `Role: ${metadata.role}` : undefined,
  },
  'role_assignment_success': {
    label: 'Assigned role',
    severity: 'success',
    category: 'Roles',
    detailRule: (metadata) => metadata?.assigned_role ? `Role: ${metadata.assigned_role}` : undefined,
  },

  // Appraisal Management
  'appraisal.cycle.opened': {
    label: 'Opened appraisal cycle',
    severity: 'info',
    category: 'Appraisals',
  },
  'appraisal.cycle.closed': {
    label: 'Closed appraisal cycle',
    severity: 'info',
    category: 'Appraisals',
  },
  'appraisal.created': {
    label: 'Created appraisal',
    severity: 'success',
    category: 'Appraisals',
  },
  'appraisal.graded': {
    label: 'Graded appraisal',
    severity: 'info',
    category: 'Appraisals',
    detailRule: (metadata) => {
      if (metadata?.final_rating) return `Rating: ${metadata.final_rating}`;
      return undefined;
    },
  },
  'appraisal.signed.employee': {
    label: 'Employee signed appraisal',
    severity: 'success',
    category: 'Appraisals',
  },
  'appraisal.signed.manager': {
    label: 'Manager signed appraisal',
    severity: 'success',
    category: 'Appraisals',
  },

  // Goal Management
  'goal.created': {
    label: 'Created goal',
    severity: 'success',
    category: 'Goals',
  },
  'goal.updated': {
    label: 'Updated goal',
    severity: 'info',
    category: 'Goals',
    detailRule: (metadata) => {
      if (metadata?.progress_from !== undefined && metadata?.progress_to !== undefined) {
        return `Progress: ${metadata.progress_from}% → ${metadata.progress_to}%`;
      }
      return undefined;
    },
  },
  'goal.deleted': {
    label: 'Deleted goal',
    severity: 'warning',
    category: 'Goals',
  },
  'goal.assigned': {
    label: 'Assigned goal',
    severity: 'info',
    category: 'Goals',
  },

  // Organization Management
  'org_created': {
    label: 'Created organization',
    severity: 'success',
    category: 'Organization',
  },
  'org_created_or_found': {
    label: 'Set up organization',
    severity: 'success',
    category: 'Organization',
  },
  'user_joined_org': {
    label: 'Joined organization',
    severity: 'success',
    category: 'Organization',
    detailRule: (metadata) => metadata?.role ? `As ${metadata.role}` : undefined,
  },

  // Invitations
  'invitation_claimed': {
    label: 'Claimed invitation',
    severity: 'success',
    category: 'Invitations',
    detailRule: (metadata) => metadata?.role_assigned ? `Role: ${metadata.role_assigned}` : undefined,
  },

  // Security Events
  'unauthorized_access_attempt': {
    label: 'Unauthorized access attempt',
    severity: 'danger',
    category: 'Security',
  },
  'cross_organization_access_attempt': {
    label: 'Cross-org access attempt',
    severity: 'danger',
    category: 'Security',
  },
  'user_creation_error': {
    label: 'User creation failed',
    severity: 'danger',
    category: 'Users',
  },

  // Fallback for unmapped events
  DEFAULT: {
    label: 'System activity',
    severity: 'info',
    category: 'System',
  },
};

export function getActionDefinition(actionCode: string): ActionDefinition {
  return ACTION_TAXONOMY[actionCode] || ACTION_TAXONOMY.DEFAULT;
}

export function formatObjectName(objectType: string, objectName: string, objectId: string): string {
  if (objectName) return objectName;
  
  const typeLabels: Record<string, string> = {
    employee: 'Employee',
    appraisal: 'Appraisal',
    goal: 'Goal',
    organization: 'Organization',
    role: 'Role',
  };
  
  const typeLabel = typeLabels[objectType] || objectType;
  return `${typeLabel} ${objectId?.slice(0, 8) || 'Unknown'}`;
}

export function getObjectTypeChip(objectType: string): { label: string; variant: string } {
  const typeMap: Record<string, { label: string; variant: string }> = {
    employee: { label: 'Employee', variant: 'default' },
    appraisal: { label: 'Appraisal', variant: 'secondary' },
    goal: { label: 'Goal', variant: 'outline' },
    organization: { label: 'Org', variant: 'secondary' },
    role: { label: 'Role', variant: 'outline' },
  };
  
  return typeMap[objectType] || { label: objectType || 'Unknown', variant: 'outline' };
}

export const ACTION_CATEGORIES = [
  'Authentication',
  'Employees', 
  'Roles',
  'Appraisals',
  'Goals',
  'Organization',
  'Invitations',
  'Security',
  'Users',
  'System',
];
