import { AppRole } from '@/features/access-control/hooks/usePermissions';
import { Activity } from '@/hooks/useActivities';

// Demo employee data generator
export const generateDemoEmployees = (role: AppRole) => {
  const baseEmployees = [
    {
      id: 'demo-emp-1',
      job_title: 'Airport Operations Manager',
      status: 'active' as const,
      created_at: '2022-03-15T00:00:00Z',
      updated_at: '2022-03-15T00:00:00Z',
      user_id: 'demo-user-1',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-1',
      division_id: 'demo-div-1',
      employee_number: 'PJI001',
      hire_date: '2022-03-15',
      manager_id: null,
      profile: {
        id: 'demo-profile-1',
        user_id: 'demo-user-1',
        first_name: 'Marcus',
        last_name: 'Johnson',
        email: 'marcus.johnson@pjiae.com',
        avatar_url: null,
        created_at: '2022-03-15T00:00:00Z',
        updated_at: '2022-03-15T00:00:00Z'
      },
      division: {
        id: 'demo-div-1',
        name: 'Airside Operations',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-1',
        name: 'Operations',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-1'
      }
    },
    {
      id: 'demo-emp-2',
      job_title: 'Financial Analyst',
      status: 'active' as const,
      created_at: '2021-08-22T00:00:00Z',
      updated_at: '2021-08-22T00:00:00Z',
      user_id: 'demo-user-2',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-2',
      division_id: 'demo-div-2',
      employee_number: 'PJI002',
      hire_date: '2021-08-22',
      manager_id: null,
      profile: {
        id: 'demo-profile-2',
        user_id: 'demo-user-2',
        first_name: 'Sarah',
        last_name: 'Williams',
        email: 'sarah.williams@pjiae.com',
        avatar_url: null,
        created_at: '2021-08-22T00:00:00Z',
        updated_at: '2021-08-22T00:00:00Z'
      },
      division: {
        id: 'demo-div-2',
        name: 'Financial Planning',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-2',
        name: 'Finance',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-2'
      }
    },
    {
      id: 'demo-emp-3',
      job_title: 'Security Supervisor',
      status: 'active' as const,
      created_at: '2020-11-10T00:00:00Z',
      updated_at: '2020-11-10T00:00:00Z',
      user_id: 'demo-user-3',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-3',
      division_id: 'demo-div-3',
      employee_number: 'PJI003',
      hire_date: '2020-11-10',
      manager_id: null,
      profile: {
        id: 'demo-profile-3',
        user_id: 'demo-user-3',
        first_name: 'David',
        last_name: 'Brown',
        email: 'david.brown@pjiae.com',
        avatar_url: null,
        created_at: '2020-11-10T00:00:00Z',
        updated_at: '2020-11-10T00:00:00Z'
      },
      division: {
        id: 'demo-div-3',
        name: 'Airport Security',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-3',
        name: 'Security',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-3'
      }
    },
    {
      id: 'demo-emp-4',
      job_title: 'HR Specialist',
      status: 'active' as const,
      created_at: '2019-03-05T00:00:00Z',
      updated_at: '2019-03-05T00:00:00Z',
      user_id: 'demo-user-4',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-4',
      division_id: 'demo-div-4',
      employee_number: 'PJI004',
      hire_date: '2019-03-05',
      manager_id: null,
      profile: {
        id: 'demo-profile-4',
        user_id: 'demo-user-4',
        first_name: 'Lisa',
        last_name: 'Davis',
        email: 'lisa.davis@pjiae.com',
        avatar_url: null,
        created_at: '2019-03-05T00:00:00Z',
        updated_at: '2019-03-05T00:00:00Z'
      },
      division: {
        id: 'demo-div-4',
        name: 'Employee Relations',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-4',
        name: 'Human Resources',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-4'
      }
    },
    {
      id: 'demo-emp-5',
      job_title: 'Maintenance Technician',
      status: 'active' as const,
      created_at: '2023-06-12T00:00:00Z',
      updated_at: '2023-06-12T00:00:00Z',
      user_id: 'demo-user-5',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-5',
      division_id: 'demo-div-5',
      employee_number: 'PJI005',
      hire_date: '2023-06-12',
      manager_id: null,
      profile: {
        id: 'demo-profile-5',
        user_id: 'demo-user-5',
        first_name: 'Michael',
        last_name: 'Wilson',
        email: 'michael.wilson@pjiae.com',
        avatar_url: null,
        created_at: '2023-06-12T00:00:00Z',
        updated_at: '2023-06-12T00:00:00Z'
      },
      division: {
        id: 'demo-div-5',
        name: 'Facilities',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-5',
        name: 'Maintenance',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-5'
      }
    },
    {
      id: 'demo-emp-6',
      job_title: 'Customer Service Representative',
      status: 'active' as const,
      created_at: '2022-09-18T00:00:00Z',
      updated_at: '2022-09-18T00:00:00Z',
      user_id: 'demo-user-6',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-6',
      division_id: 'demo-div-6',
      employee_number: 'PJI006',
      hire_date: '2022-09-18',
      manager_id: null,
      profile: {
        id: 'demo-profile-6',
        user_id: 'demo-user-6',
        first_name: 'Jennifer',
        last_name: 'Miller',
        email: 'jennifer.miller@pjiae.com',
        avatar_url: null,
        created_at: '2022-09-18T00:00:00Z',
        updated_at: '2022-09-18T00:00:00Z'
      },
      division: {
        id: 'demo-div-6',
        name: 'Terminal Services',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-6',
        name: 'Customer Service',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-6'
      }
    },
    {
      id: 'demo-emp-7',
      job_title: 'IT Support Specialist',
      status: 'active' as const,
      created_at: '2021-04-14T00:00:00Z',
      updated_at: '2021-04-14T00:00:00Z',
      user_id: 'demo-user-7',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-7',
      division_id: 'demo-div-7',
      employee_number: 'PJI007',
      hire_date: '2021-04-14',
      manager_id: null,
      profile: {
        id: 'demo-profile-7',
        user_id: 'demo-user-7',
        first_name: 'Christopher',
        last_name: 'Garcia',
        email: 'christopher.garcia@pjiae.com',
        avatar_url: null,
        created_at: '2021-04-14T00:00:00Z',
        updated_at: '2021-04-14T00:00:00Z'
      },
      division: {
        id: 'demo-div-7',
        name: 'Technical Support',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-7',
        name: 'Information Technology',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-7'
      }
    },
    {
      id: 'demo-emp-8',
      job_title: 'Marketing Coordinator',
      status: 'active' as const,
      created_at: '2023-01-08T00:00:00Z',
      updated_at: '2023-01-08T00:00:00Z',
      user_id: 'demo-user-8',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-8',
      division_id: 'demo-div-8',
      employee_number: 'PJI008',
      hire_date: '2023-01-08',
      manager_id: null,
      profile: {
        id: 'demo-profile-8',
        user_id: 'demo-user-8',
        first_name: 'Amanda',
        last_name: 'Rodriguez',
        email: 'amanda.rodriguez@pjiae.com',
        avatar_url: null,
        created_at: '2023-01-08T00:00:00Z',
        updated_at: '2023-01-08T00:00:00Z'
      },
      division: {
        id: 'demo-div-8',
        name: 'Communications',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-8',
        name: 'Marketing',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-8'
      }
    },
    {
      id: 'demo-emp-9',
      job_title: 'Ground Equipment Operator',
      status: 'active' as const,
      created_at: '2022-12-03T00:00:00Z',
      updated_at: '2022-12-03T00:00:00Z',
      user_id: 'demo-user-9',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-9',
      division_id: 'demo-div-9',
      employee_number: 'PJI009',
      hire_date: '2022-12-03',
      manager_id: null,
      profile: {
        id: 'demo-profile-9',
        user_id: 'demo-user-9',
        first_name: 'Joshua',
        last_name: 'Martinez',
        email: 'joshua.martinez@pjiae.com',
        avatar_url: null,
        created_at: '2022-12-03T00:00:00Z',
        updated_at: '2022-12-03T00:00:00Z'
      },
      division: {
        id: 'demo-div-9',
        name: 'Ramp Operations',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-9',
        name: 'Ground Support',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-9'
      }
    },
    {
      id: 'demo-emp-10',
      job_title: 'Administrative Assistant',
      status: 'active' as const,
      created_at: '2021-07-25T00:00:00Z',
      updated_at: '2021-07-25T00:00:00Z',
      user_id: 'demo-user-10',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-10',
      division_id: 'demo-div-10',
      employee_number: 'PJI010',
      hire_date: '2021-07-25',
      manager_id: null,
      profile: {
        id: 'demo-profile-10',
        user_id: 'demo-user-10',
        first_name: 'Ashley',
        last_name: 'Anderson',
        email: 'ashley.anderson@pjiae.com',
        avatar_url: null,
        created_at: '2021-07-25T00:00:00Z',
        updated_at: '2021-07-25T00:00:00Z'
      },
      division: {
        id: 'demo-div-10',
        name: 'Executive Support',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-10',
        name: 'Administration',
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-10'
      }
    }
  ];

  // Filter based on role
  switch (role) {
    case 'admin':
    case 'director':
      return baseEmployees; // See all employees
    case 'manager':
      return baseEmployees.slice(0, 3); // See team members
    case 'supervisor':
      return baseEmployees.slice(0, 2); // See direct reports
    case 'employee':
      return [baseEmployees[0]]; // See only self
    default:
      return baseEmployees;
  }
};

// Demo goals generator
export const generateDemoGoals = (role: AppRole) => {
  const baseGoals = [
    {
      id: '1',
      title: 'Improve Customer Satisfaction',
      description: 'Increase customer satisfaction scores by 15% through better service delivery',
      employeeName: 'John Smith',
      employeeId: '1',
      status: 'active',
      cycle: 'Q4 2024',
      dueDate: '2024-12-31',
      type: 'performance',
      weight: 30,
      year: '2024',
      progress: 65,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-11-20T14:30:00Z'
    },
    {
      id: '2',
      title: 'Complete React Training',
      description: 'Finish advanced React certification course and apply learnings to current projects',
      employeeName: 'Sarah Johnson',
      employeeId: '2',
      status: 'active',
      cycle: 'Q4 2024',
      dueDate: '2024-12-15',
      type: 'development',
      weight: 25,
      year: '2024',
      progress: 80,
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-11-18T16:45:00Z'
    },
    {
      id: '3',
      title: 'Increase Sales Revenue',
      description: 'Achieve 120% of quarterly sales target through new client acquisition',
      employeeName: 'Michael Chen',
      employeeId: '3',
      status: 'completed',
      cycle: 'Q4 2024',
      dueDate: '2024-12-31',
      type: 'performance',
      weight: 40,
      year: '2024',
      progress: 100,
      createdAt: '2024-01-10T11:00:00Z',
      updatedAt: '2024-11-15T12:00:00Z'
    }
  ];

  // Filter based on role
  switch (role) {
    case 'admin':
    case 'director':
      return baseGoals; // See all goals
    case 'manager':
      return baseGoals.slice(0, 2); // See team goals
    case 'supervisor':
    case 'employee':
      return [baseGoals[0]]; // See own goals
    default:
      return baseGoals;
  }
};

// Demo appraisals generator
export const generateDemoAppraisals = (role: AppRole) => {
  const baseAppraisals = [
    {
      id: '1',
      employeeName: 'John Smith',
      employeeId: '1',
      type: 'Mid Year',
      status: 'in_progress' as const,
      score: 4,
      cycle: 'Mid Year 2024',
      period: 'Jan 2024 - Jun 2024',
      dueDate: '2024-06-30',
      submittedDate: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-11-20T10:30:00Z'
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      employeeId: '2',
      type: 'Mid Year',
      status: 'completed' as const,
      score: 5,
      cycle: 'Mid Year 2024',
      period: 'Jan 2024 - Jun 2024',
      dueDate: '2024-06-30',
      submittedDate: '2024-06-28',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-28T15:45:00Z'
    },
    {
      id: '3',
      employeeName: 'Michael Chen',
      employeeId: '3',
      type: 'Mid Year',
      status: 'draft' as const,
      score: null,
      cycle: 'Mid Year 2024',
      period: 'Jan 2024 - Jun 2024',
      dueDate: '2024-06-30',
      submittedDate: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-11-01T09:00:00Z'
    }
  ];

  // Filter based on role
  switch (role) {
    case 'admin':
    case 'director':
      return baseAppraisals; // See all appraisals
    case 'manager':
      return baseAppraisals.slice(0, 2); // See team appraisals
    case 'supervisor':
    case 'employee':
      return [baseAppraisals[0]]; // See own appraisals
    default:
      return baseAppraisals;
  }
};

// Demo activities generator
export const generateDemoActivities = (role: AppRole): Activity[] => {
  const baseActivities: Activity[] = [
    {
      id: "demo_1",
      activity_type: "system_alert",
      type: "system_alert",
      title: "System Alert",
      description: "15 appraisals missing signatures company wide",
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      tags: ["Q4 Appraisal Cycle"],
      priority: "high",
      actionable: true,
      actionLabel: "Take Action",
      actionVariant: "destructive"
    },
    {
      id: "demo_2",
      activity_type: "goal_assignment", 
      type: "goal_assignment",
      title: "Goal Update",
      description: "assigned you a new goal",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: {
        name: "Sarah Johnson",
        initials: "SJ",
        department: "Product",
        role: "Product Manager"
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      tags: ["Improve Customer Retention"],
      priority: "medium",
      actionable: true,
      actionLabel: "Review"
    },
    {
      id: "demo_3",
      activity_type: "appraisal_update",
      type: "appraisal_update",
      title: "Appraisal Completed",
      description: "submitted their quarterly review",
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Michael Chen",
        initials: "MC",
        department: "Sales",
        role: "Sales Manager"
      },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      tags: ["Q4 Review"],
      priority: "low",
      actionable: false,
      actionLabel: "View"
    }
  ];

  // Role-specific activities
  const roleSpecificActivities: Record<AppRole, Activity[]> = {
    admin: [
      ...baseActivities,
        {
          id: "demo_admin_1",
          activity_type: "system_alert",
          type: "system_alert",
          title: "System Alert",
          description: "Performance review dispute filed",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: {
            name: "Lisa Rodriguez",
            initials: "LR",
            department: "HR",
            role: "HR Director"
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          tags: ["Annual Review Appeal"],
          priority: "high",
          actionable: true,
          actionLabel: "Take Action",
          actionVariant: "destructive"
        }
    ],
    director: [
      ...baseActivities,
        {
          id: "demo_director_1",
          activity_type: "team_update",
          type: "team_update",
          title: "Team Update",
          description: "Department restructure proposal submitted",
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          tags: ["Organization Change"],
          priority: "medium",
          actionable: true,
          actionLabel: "Review"
        }
    ],
    manager: baseActivities.slice(0, 2),
    supervisor: baseActivities.slice(0, 1),
    employee: [baseActivities[1]] // Only goal-related activities
  };

  return roleSpecificActivities[role] || baseActivities;
};

export const generateDemoOrganization = () => ({
  id: 'demo-org-1',
  name: 'Princess Juliana International Airport',
  logo_url: null,
  status: 'active',
  subscription_plan: 'enterprise',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export function generateDemoDepartments(role: AppRole) {
  const departments = [
    { id: 'dept-1', name: 'Operations', division_id: 'div-1', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-2', name: 'Finance', division_id: 'div-2', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-3', name: 'Security', division_id: 'div-3', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-4', name: 'Human Resources', division_id: 'div-4', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-5', name: 'Maintenance', division_id: 'div-5', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-6', name: 'Customer Service', division_id: 'div-6', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-7', name: 'Information Technology', division_id: 'div-7', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-8', name: 'Marketing', division_id: 'div-8', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-9', name: 'Ground Support', division_id: 'div-9', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'dept-10', name: 'Administration', division_id: 'div-10', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  if (role === 'employee') return departments.slice(0, 3);
  if (role === 'supervisor' || role === 'manager') return departments.slice(0, 6);
  return departments;
}

export function generateDemoDivisions(role: AppRole) {
  const divisions = [
    { id: 'div-1', name: 'Airside Operations', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-2', name: 'Financial Planning', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-3', name: 'Airport Security', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-4', name: 'Employee Relations', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-5', name: 'Facilities', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-6', name: 'Terminal Services', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-7', name: 'Technical Support', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-8', name: 'Communications', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-9', name: 'Ramp Operations', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'div-10', name: 'Executive Support', organization_id: 'demo-org-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  if (role === 'employee') return divisions.slice(0, 3);
  if (role === 'supervisor' || role === 'manager') return divisions.slice(0, 6);
  return divisions;
}

// Demo divisions generator (legacy)
export const generateDemoDivisions_legacy = (role: AppRole) => {
  const baseDivisions = [
    { id: 1, name: "Technology", departmentCount: 3, head: "Alex Chen" },
    { id: 2, name: "Operations", departmentCount: 2, head: "Maria Rodriguez" },
    { id: 3, name: "Corporate", departmentCount: 2, head: "James Wilson" }
  ];

  // All roles can see all divisions for now
  return baseDivisions;
};

export const generateDemoGoalMetrics = (role: AppRole) => {
  const baseMetrics = {
    totalGoals: 342,
    completionRate: 78,
    employeesWithGoals: 148,
    dueThisQuarter: 89,
    completionRateChange: '+12%',
    employeesWithGoalsPercentage: '95% of workforce'
  };

  switch (role) {
    case 'manager':
      return {
        ...baseMetrics,
        totalGoals: 45,
        employeesWithGoals: 12,
        dueThisQuarter: 8
      };
    case 'supervisor':
      return {
        ...baseMetrics,
        totalGoals: 23,
        employeesWithGoals: 8,
        dueThisQuarter: 5
      };
    case 'employee':
      return {
        ...baseMetrics,
        totalGoals: 3,
        employeesWithGoals: 1,
        dueThisQuarter: 1
      };
    default:
      return baseMetrics;
  }
};

export const generateDemoAppraisalMetrics = (role: AppRole) => {
  const baseMetrics = {
    totalAppraisals: 156,
    completed: 128,
    inProgress: 23,
    overdue: 5,
    completionRate: '82% completion rate'
  };

  switch (role) {
    case 'manager':
      return {
        ...baseMetrics,
        totalAppraisals: 15,
        completed: 12,
        inProgress: 2,
        overdue: 1
      };
    case 'supervisor':
      return {
        ...baseMetrics,
        totalAppraisals: 8,
        completed: 6,
        inProgress: 2,
        overdue: 0
      };
    case 'employee':
      return {
        ...baseMetrics,
        totalAppraisals: 1,
        completed: 0,
        inProgress: 1,
        overdue: 0
      };
    default:
      return baseMetrics;
  }
};

export const generateDemoSystemHealth = (role: AppRole) => {
  const baseHealth = {
    completionRate: '87%',
    userActivity: '94% active',
    dataQuality: 'Good'
  };

  switch (role) {
    case 'manager':
      return {
        ...baseHealth,
        completionRate: '92%',
        userActivity: '98% active'
      };
    case 'supervisor':
      return {
        ...baseHealth,
        completionRate: '89%',
        userActivity: '96% active'
      };
    default:
      return baseHealth;
  }
};

export const generateDemoNotificationMetrics = (role: AppRole) => {
  const baseMetrics = {
    activeAlerts: 23,
    emailsSent: 1247,
    inAppNotifications: 892,
    scheduled: 15
  };

  switch (role) {
    case 'manager':
      return {
        ...baseMetrics,
        activeAlerts: 5,
        emailsSent: 156,
        inAppNotifications: 89,
        scheduled: 3
      };
    case 'supervisor':
      return {
        ...baseMetrics,
        activeAlerts: 2,
        emailsSent: 67,
        inAppNotifications: 45,
        scheduled: 1
      };
    case 'employee':
      return {
        ...baseMetrics,
        activeAlerts: 1,
        emailsSent: 12,
        inAppNotifications: 8,
        scheduled: 0
      };
    default:
      return baseMetrics;
  }
};

export const generateDemoOrgMetrics = (role: AppRole) => {
  const baseMetrics = {
    totalEmployees: 247,
    vacantPositions: 8,
    pendingAppraisals: 23,
    coverageRate: '94%',
    totalEmployeesChange: '+12',
    vacantPositionsChange: '-3',
    pendingAppraisalsChange: '+5',
    coverageRateChange: '+2%',
    totalEmployeesChangeType: 'positive' as const,
    vacantPositionsChangeType: 'positive' as const,
    pendingAppraisalsChangeType: 'negative' as const,
    coverageRateChangeType: 'positive' as const
  };

  switch (role) {
    case 'director':
      return baseMetrics;
    case 'manager':
      return {
        ...baseMetrics,
        totalEmployees: 15,
        vacantPositions: 1,
        pendingAppraisals: 3,
        coverageRate: '96%'
      };
    case 'supervisor':
      return {
        ...baseMetrics,
        totalEmployees: 8,
        vacantPositions: 0,
        pendingAppraisals: 1,
        coverageRate: '100%'
      };
    default:
      return baseMetrics;
  }
};
