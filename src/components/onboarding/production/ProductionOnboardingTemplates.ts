// Production-only organizational templates
// These are generic templates that don't contain any specific organization data

export interface ProductionOrgTemplate {
  name: string;
  type: 'generic' | 'custom';
  divisions: ProductionDivisionTemplate[];
}

export interface ProductionDivisionTemplate {
  name: string;
  departments: string[];
}

// Generic organizational structure templates for production onboarding
export const GENERIC_CORPORATE_TEMPLATE: ProductionOrgTemplate = {
  name: 'Corporate Structure',
  type: 'generic',
  divisions: [
    {
      name: 'Operations',
      departments: ['Business Operations', 'Customer Relations', 'Quality Assurance']
    },
    {
      name: 'Technology',
      departments: ['Engineering', 'Product Development', 'IT Support']
    },
    {
      name: 'Administration', 
      departments: ['Human Resources', 'Finance', 'Legal & Compliance']
    }
  ]
};

export const GENERIC_SERVICES_TEMPLATE: ProductionOrgTemplate = {
  name: 'Service Organization',
  type: 'generic',
  divisions: [
    {
      name: 'Service Delivery',
      departments: ['Customer Service', 'Field Operations', 'Project Management']
    },
    {
      name: 'Business Development',
      departments: ['Sales', 'Marketing', 'Partnerships']
    },
    {
      name: 'Support Functions',
      departments: ['HR', 'Finance', 'Administration']
    }
  ]
};

export const GENERIC_MANUFACTURING_TEMPLATE: ProductionOrgTemplate = {
  name: 'Manufacturing Organization',
  type: 'generic',
  divisions: [
    {
      name: 'Production',
      departments: ['Manufacturing', 'Quality Control', 'Supply Chain']
    },
    {
      name: 'Engineering',
      departments: ['Design', 'Process Engineering', 'Maintenance']
    },
    {
      name: 'Business Operations',
      departments: ['Sales', 'Finance', 'Human Resources']
    }
  ]
};

export function getProductionTemplates(): ProductionOrgTemplate[] {
  return [
    GENERIC_CORPORATE_TEMPLATE,
    GENERIC_SERVICES_TEMPLATE,
    GENERIC_MANUFACTURING_TEMPLATE
  ];
}

export function getProductionTemplate(type: 'corporate' | 'services' | 'manufacturing' = 'corporate'): ProductionOrgTemplate {
  switch (type) {
    case 'services':
      return GENERIC_SERVICES_TEMPLATE;
    case 'manufacturing':
      return GENERIC_MANUFACTURING_TEMPLATE;
    default:
      return GENERIC_CORPORATE_TEMPLATE;
  }
}