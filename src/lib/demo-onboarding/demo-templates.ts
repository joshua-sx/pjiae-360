// Demo-only organizational templates - NEVER used in production
import { AppRole } from '@/features/access-control/hooks/usePermissions';

export interface DemoOrgTemplate {
  name: string;
  divisions: DemoDivisionTemplate[];
}

export interface DemoDivisionTemplate {
  name: string;
  departments: string[];
}

// Airport organization template (demo only)
export const DEMO_AIRPORT_TEMPLATE: DemoOrgTemplate = {
  name: 'Demo Airport Authority',
  divisions: [
    {
      name: 'Airside Operations',
      departments: ['Ground Handling', 'Air Traffic Control', 'Runway Operations']
    },
    {
      name: 'Terminal Operations', 
      departments: ['Passenger Services', 'Security', 'Retail & Food']
    },
    {
      name: 'Corporate Services',
      departments: ['Human Resources', 'Finance', 'IT', 'Legal']
    }
  ]
};

// Corporate organization template (demo only)
export const DEMO_CORPORATE_TEMPLATE: DemoOrgTemplate = {
  name: 'Demo Corporation',
  divisions: [
    {
      name: 'Technology',
      departments: ['Engineering', 'Product', 'Data Science', 'DevOps']
    },
    {
      name: 'Business Operations',
      departments: ['Sales', 'Marketing', 'Customer Success', 'Operations']
    },
    {
      name: 'Corporate Functions', 
      departments: ['HR', 'Finance', 'Legal', 'Facilities']
    }
  ]
};

export function getDemoTemplate(type: 'airport' | 'corporate' = 'corporate'): DemoOrgTemplate {
  return type === 'airport' ? DEMO_AIRPORT_TEMPLATE : DEMO_CORPORATE_TEMPLATE;
}

/**
 * DEMO ONLY: Generate role mappings for demo purposes
 * This should NEVER be used in production onboarding
 */
export function generateDemoRoleMappings(role: AppRole) {
  const baseMappings = {
    'ceo': 'admin',
    'president': 'admin', 
    'director': 'director',
    'manager': 'manager',
    'supervisor': 'supervisor',
    'lead': 'supervisor',
    'coordinator': 'employee',
    'specialist': 'employee',
    'analyst': 'employee',
    'representative': 'employee'
  };

  // Filter based on demo role for demonstration purposes
  switch (role) {
    case 'admin':
      return baseMappings;
    case 'director':
      return Object.fromEntries(
        Object.entries(baseMappings).filter(([_, mappedRole]) => 
          mappedRole !== 'admin'
        )
      );
    case 'manager':
      return Object.fromEntries(
        Object.entries(baseMappings).filter(([_, mappedRole]) => 
          !['admin', 'director'].includes(mappedRole)
        )
      );
    default:
      return Object.fromEntries(
        Object.entries(baseMappings).filter(([_, mappedRole]) => 
          mappedRole === 'employee'
        )
      );
  }
}