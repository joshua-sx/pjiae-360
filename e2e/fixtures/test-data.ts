export const testEmployeeData = [
  {
    name: 'John Doe',
    email: 'john.doe@company.com',
    division: 'Engineering',
    department: 'Software Development',
    role: 'employee'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@company.com', 
    division: 'Engineering',
    department: 'QA',
    role: 'supervisor'
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    division: 'Sales',
    department: 'Enterprise',
    role: 'manager'
  }
];

export const csvContent = `name,email,division,department
John Doe,john.doe@company.com,Engineering,Software Development
Jane Smith,jane.smith@company.com,Engineering,QA
Bob Johnson,bob.johnson@company.com,Sales,Enterprise`;

export const testOrganizationData = {
  name: 'Test Company Inc',
  industry: 'Technology',
  size: '50-200',
  entryMethod: 'manual' as const
};

export const testAppraisalCycle = {
  name: 'Q4 2024 Performance Review',
  description: 'Quarterly performance evaluation cycle',
  startDate: new Date('2024-10-01'),
  endDate: new Date('2024-12-31'),
  reviewPeriods: [
    {
      id: 'period-1',
      name: 'Mid-Quarter Check-in',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-11-15'),
      type: 'checkpoint' as const
    }
  ],
  goalWindows: [
    {
      id: 'window-1', 
      name: 'Q4 Goals',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
      type: 'setting' as const
    }
  ]
};