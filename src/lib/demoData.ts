import { AppRole } from '@/hooks/usePermissions';
import { Activity } from '@/components/dashboard/ActivityFeed';

// Demo employee data generator
export const generateDemoEmployees = (role: AppRole) => {
  const baseEmployees = [
    {
      id: 'demo-emp-1',
      job_title: 'Software Engineer',
      status: 'active' as const,
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z',
      user_id: 'demo-user-1',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-1',
      division_id: 'demo-div-1',
      employee_number: 'EMP001',
      hire_date: '2023-01-15',
      manager_id: null,
      profile: {
        id: 'demo-profile-1',
        user_id: 'demo-user-1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@demo.com',
        avatar_url: null,
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z'
      },
      division: {
        id: 'demo-div-1',
        name: 'Technology',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-1',
        name: 'Engineering',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-1'
      }
    },
    {
      id: 'demo-emp-2',
      job_title: 'Product Manager',
      status: 'active' as const,
      created_at: '2022-08-22T00:00:00Z',
      updated_at: '2022-08-22T00:00:00Z',
      user_id: 'demo-user-2',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-2',
      division_id: 'demo-div-1',
      employee_number: 'EMP002',
      hire_date: '2022-08-22',
      manager_id: null,
      profile: {
        id: 'demo-profile-2',
        user_id: 'demo-user-2',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@demo.com',
        avatar_url: null,
        created_at: '2022-08-22T00:00:00Z',
        updated_at: '2022-08-22T00:00:00Z'
      },
      division: {
        id: 'demo-div-1',
        name: 'Technology',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-2',
        name: 'Product',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-1'
      }
    },
    {
      id: 'demo-emp-3',
      job_title: 'Sales Manager',
      status: 'active' as const,
      created_at: '2021-11-10T00:00:00Z',
      updated_at: '2021-11-10T00:00:00Z',
      user_id: 'demo-user-3',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-3',
      division_id: 'demo-div-2',
      employee_number: 'EMP003',
      hire_date: '2021-11-10',
      manager_id: null,
      profile: {
        id: 'demo-profile-3',
        user_id: 'demo-user-3',
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@demo.com',
        avatar_url: null,
        created_at: '2021-11-10T00:00:00Z',
        updated_at: '2021-11-10T00:00:00Z'
      },
      division: {
        id: 'demo-div-2',
        name: 'Operations',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-3',
        name: 'Sales',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-2'
      }
    },
    {
      id: 'demo-emp-4',
      job_title: 'HR Director',
      status: 'active' as const,
      created_at: '2020-03-05T00:00:00Z',
      updated_at: '2020-03-05T00:00:00Z',
      user_id: 'demo-user-4',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-4',
      division_id: 'demo-div-3',
      employee_number: 'EMP004',
      hire_date: '2020-03-05',
      manager_id: null,
      profile: {
        id: 'demo-profile-4',
        user_id: 'demo-user-4',
        first_name: 'Lisa',
        last_name: 'Rodriguez',
        email: 'lisa.rodriguez@demo.com',
        avatar_url: null,
        created_at: '2020-03-05T00:00:00Z',
        updated_at: '2020-03-05T00:00:00Z'
      },
      division: {
        id: 'demo-div-3',
        name: 'Corporate',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-4',
        name: 'Human Resources',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-3'
      }
    },
    {
      id: 'demo-emp-5',
      job_title: 'Marketing Specialist',
      status: 'active' as const,
      created_at: '2023-06-12T00:00:00Z',
      updated_at: '2023-06-12T00:00:00Z',
      user_id: 'demo-user-5',
      organization_id: 'demo-org-1',
      department_id: 'demo-dept-5',
      division_id: 'demo-div-2',
      employee_number: 'EMP005',
      hire_date: '2023-06-12',
      manager_id: null,
      profile: {
        id: 'demo-profile-5',
        user_id: 'demo-user-5',
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.wilson@demo.com',
        avatar_url: null,
        created_at: '2023-06-12T00:00:00Z',
        updated_at: '2023-06-12T00:00:00Z'
      },
      division: {
        id: 'demo-div-2',
        name: 'Operations',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1'
      },
      department: {
        id: 'demo-dept-5',
        name: 'Marketing',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        organization_id: 'demo-org-1',
        division_id: 'demo-div-2'
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
      type: 'annual',
      status: 'in_progress' as const,
      score: 85,
      cycle: 'Annual 2024',
      period: 'Jan 2024 - Dec 2024',
      dueDate: '2024-12-31',
      submittedDate: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-11-20T10:30:00Z'
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      employeeId: '2',
      type: 'quarterly',
      status: 'completed' as const,
      score: 92,
      cycle: 'Q3 2024',
      period: 'Jul 2024 - Sep 2024',
      dueDate: '2024-09-30',
      submittedDate: '2024-09-28',
      createdAt: '2024-07-01T00:00:00Z',
      updatedAt: '2024-09-28T15:45:00Z'
    },
    {
      id: '3',
      employeeName: 'Michael Chen',
      employeeId: '3',
      type: 'annual',
      status: 'draft' as const,
      score: null,
      cycle: 'Annual 2024',
      period: 'Jan 2024 - Dec 2024',
      dueDate: '2024-12-31',
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
      type: "system_alert",
      title: "System Alert",
      description: "15 appraisals missing signatures company wide",
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      tags: ["Q4 Appraisal Cycle"],
      priority: "high",
      actionable: true,
      actionLabel: "Take Action",
      actionVariant: "destructive"
    },
    {
      id: "demo_2",
      type: "goal_assignment",
      title: "Goal Update",
      description: "assigned you a new goal",
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
      type: "appraisal_update",
      title: "Appraisal Completed",
      description: "submitted their quarterly review",
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
        type: "system_alert",
        title: "System Alert",
        description: "Performance review dispute filed",
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
        type: "team_update",
        title: "Team Update",
        description: "Department restructure proposal submitted",
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

// Demo divisions generator
export const generateDemoDivisions = (role: AppRole) => {
  const baseDivisions = [
    { id: 1, name: "Technology", departmentCount: 3, head: "Alex Chen" },
    { id: 2, name: "Operations", departmentCount: 2, head: "Maria Rodriguez" },
    { id: 3, name: "Corporate", departmentCount: 2, head: "James Wilson" }
  ];

  // All roles can see all divisions for now
  return baseDivisions;
};

// Demo organization generator
export const generateDemoOrganization = () => ({
  id: 'demo-org-1',
  name: 'Demo Corporation',
  logo_url: null,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-11-20T10:00:00Z'
});