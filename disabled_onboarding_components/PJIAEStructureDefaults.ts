// PJIAE Organizational Structure Defaults
// Based on the actual Princess Juliana International Airport structure

export interface PJIAEDivision {
  id: string;
  name: string;
  type: 'division';
  departments: Array<{ id: string; name: string; isVacant?: boolean; isInterim?: boolean }>;
  directCEOReporting?: boolean;
  description?: string;
}

export const PJIAE_DIVISIONS: PJIAEDivision[] = [
  {
    id: 'executive',
    name: 'Executive',
    type: 'division',
    directCEOReporting: true,
    description: 'Executive leadership and strategic oversight',
    departments: [
      { id: 'ceo-office', name: 'CEO Office' },
      { id: 'executive-support', name: 'Executive Support' },
      { id: 'legal-counsel', name: 'Legal Counsel' }
    ]
  },
  {
    id: 'technical',
    name: 'Technical',
    type: 'division',
    description: 'Technical operations and IT services',
    departments: [
      { id: 'project-management', name: 'Project Management Unit' },
      { id: 'it-services', name: 'IT Services' }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    type: 'division',
    description: 'Financial management and planning',
    departments: [
      { id: 'finance-dept', name: 'Finance' },
      { id: 'accounting', name: 'Accounting' },
      { id: 'budget-planning', name: 'Budget & Planning' }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    type: 'division',
    description: 'Airport operational activities',
    departments: [
      { id: 'operations-dept', name: 'Operations' },
      { id: 'maintenance', name: 'Maintenance' },
      { id: 'ground-support', name: 'Ground Support' }
    ]
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    type: 'division',
    description: 'Human capital management and development',
    departments: [
      { id: 'hr-dept', name: 'Human Resources' },
      { id: 'training-development', name: 'Training & Development' }
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    type: 'division',
    description: 'Engineering and infrastructure management',
    departments: [
      { id: 'engineering-dept', name: 'Engineering' }
    ]
  },
  {
    id: 'commercial',
    name: 'Commercial',
    type: 'division',
    description: 'Commercial activities and customer relations',
    departments: [
      { id: 'commercial-dept', name: 'Commercial' },
      { id: 'marketing', name: 'Marketing' },
      { id: 'customer-service', name: 'Customer Service' }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    type: 'division',
    description: 'Security and safety operations',
    departments: [
      { id: 'security-dept', name: 'Security' },
      { id: 'safety-compliance', name: 'Safety & Compliance' }
    ]
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    type: 'division',
    description: 'Quality control and audit functions',
    departments: [
      { id: 'qa-dept', name: 'Quality Assurance' },
      { id: 'audit', name: 'Audit' }
    ]
  }
];

// Job title to role mappings for automatic role detection
export const PJIAE_ROLE_MAPPINGS = {
  ceo: ['CEO', 'Chief Executive Officer'],
  division_director: [
    'Director of Technical', 'Technical Director',
    'Director of Finance', 'Finance Director', 'Chief Financial Officer', 'CFO',
    'Director of Operations', 'Operations Director', 'Chief Operations Officer', 'COO',
    'Director of Human Resources', 'HR Director', 'Chief Human Resources Officer', 'CHRO',
    'Director of Engineering', 'Engineering Director',
    'Director of Commercial', 'Commercial Director',
    'Director of Security', 'Security Director',
    'Director of Quality Assurance', 'QA Director'
  ],
  department_head: [
    'Head of', 'Department Head', 'Department Manager',
    'Project Manager', 'IT Manager', 'Finance Manager',
    'Accounting Manager', 'Budget Manager', 'Operations Manager',
    'Maintenance Manager', 'Ground Support Manager', 'HR Manager',
    'Training Manager', 'Engineering Manager', 'Commercial Manager',
    'Marketing Manager', 'Customer Service Manager', 'Security Manager',
    'Safety Manager', 'QA Manager', 'Audit Manager'
  ],
  supervisor: [
    'Supervisor', 'Team Lead', 'Team Leader', 'Senior',
    'Lead', 'Coordinator', 'Specialist'
  ]
};

// Convert PJIAE structure to onboarding format
export function convertToOnboardingStructure(divisions: PJIAEDivision[]) {
  const orgStructure: Array<{
    id: string;
    name: string;
    type: 'division' | 'department';
    parent?: string;
    rank: number;
    description?: string;
    directCEOReporting?: boolean;
  }> = [];

  let rank = 1;

  divisions.forEach(division => {
    // Add division
    orgStructure.push({
      id: division.id,
      name: division.name,
      type: 'division',
      rank: rank++,
      description: division.description,
      directCEOReporting: division.directCEOReporting
    });

    // Add departments
    division.departments.forEach(dept => {
      orgStructure.push({
        id: dept.id,
        name: dept.name,
        type: 'department',
        parent: division.id,
        rank: rank++
      });
    });
  });

  return orgStructure;
}

// Auto-detect role based on job title
export function detectRole(jobTitle: string): string {
  const title = jobTitle.toLowerCase();
  
  if (PJIAE_ROLE_MAPPINGS.ceo.some(ceoTitle => 
    title.includes(ceoTitle.toLowerCase()))) {
    return 'CEO';
  }
  
  if (PJIAE_ROLE_MAPPINGS.division_director.some(dirTitle => 
    title.includes(dirTitle.toLowerCase()))) {
    return 'Division Director';
  }
  
  if (PJIAE_ROLE_MAPPINGS.department_head.some(headTitle => 
    title.includes(headTitle.toLowerCase()))) {
    return 'Department Head';
  }
  
  if (PJIAE_ROLE_MAPPINGS.supervisor.some(supTitle => 
    title.includes(supTitle.toLowerCase()))) {
    return 'Supervisor';
  }
  
  return 'Employee';
}

// Get suggested division for a job title
export function getSuggestedDivision(jobTitle: string): string | null {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('finance') || title.includes('accounting') || title.includes('budget')) {
    return 'finance';
  }
  if (title.includes('technical') || title.includes('it') || title.includes('project')) {
    return 'technical';
  }
  if (title.includes('operations') || title.includes('maintenance') || title.includes('ground')) {
    return 'operations';
  }
  if (title.includes('hr') || title.includes('human') || title.includes('training')) {
    return 'human-resources';
  }
  if (title.includes('engineering')) {
    return 'engineering';
  }
  if (title.includes('commercial') || title.includes('marketing') || title.includes('customer')) {
    return 'commercial';
  }
  if (title.includes('security') || title.includes('safety')) {
    return 'security';
  }
  if (title.includes('quality') || title.includes('audit')) {
    return 'quality-assurance';
  }
  if (title.includes('ceo') || title.includes('executive') || title.includes('legal')) {
    return 'executive';
  }
  
  return null;
}