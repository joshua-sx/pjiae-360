import { create } from 'zustand';

export interface GoalProgressEntry {
  id: string;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface GoalAuditEntry {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}

export interface DemoGoal {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  status: 'draft' | 'published' | 'acknowledged' | 'active' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  createdAt: string;
  publishedAt?: string;
  acknowledgedAt?: string;
  completedAt?: string;
  archivedAt?: string;
  progress: GoalProgressEntry[];
  auditLog: GoalAuditEntry[];
  type: string;
  weight: number;
  year: string;
  tags: string[];
}

export interface DivisionalGoal {
  id: string;
  title: string;
  description: string;
  division: string;
  directorId: string;
  directorName: string;
  status: 'draft' | 'active';
  createdAt: string;
  activatedAt?: string;
}

interface DemoGoalStore {
  goals: DemoGoal[];
  divisionalGoals: DivisionalGoal[];
  
  // Goal actions
  createGoal: (goalData: Partial<DemoGoal>) => Promise<DemoGoal>;
  publishGoal: (goalId: string, publisherId: string) => Promise<void>;
  acknowledgeGoal: (goalId: string, employeeId: string) => Promise<void>;
  addProgress: (goalId: string, note: string, userId: string) => Promise<void>;
  markCompleted: (goalId: string, managerId: string) => Promise<void>;
  archiveGoal: (goalId: string, managerId: string) => Promise<void>;
  
  // Divisional goal actions
  createDivisionalGoal: (goalData: Partial<DivisionalGoal>) => Promise<DivisionalGoal>;
  activateDivisionalGoal: (goalId: string, directorId: string) => Promise<void>;
  
  // Selectors
  getGoalsByEmployee: (employeeId: string) => DemoGoal[];
  getGoalsByManager: (managerId: string) => DemoGoal[];
  getActiveDivisionalGoals: () => DivisionalGoal[];
  getGoalById: (goalId: string) => DemoGoal | undefined;
}

// Initial demo data
const initialGoals: DemoGoal[] = [
  {
    id: 'goal-1',
    title: 'Improve Customer Satisfaction Score',
    description: 'Increase CSAT from 4.2 to 4.6 through improved response times and service quality.',
    employeeId: 'emp-sarah-chen',
    employeeName: 'Sarah Chen',
    managerId: 'mgr-alex-rivera',
    managerName: 'Alex Rivera',
    status: 'published',
    priority: 'high',
    dueDate: '2024-12-31',
    createdAt: '2024-01-15T10:00:00Z',
    publishedAt: '2024-01-16T09:00:00Z',
    progress: [],
    auditLog: [
      {
        id: 'audit-1',
        action: 'Goal Created',
        performedBy: 'Alex Rivera',
        performedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'audit-2',
        action: 'Goal Published',
        performedBy: 'Alex Rivera',
        performedAt: '2024-01-16T09:00:00Z',
      }
    ],
    type: 'Performance',
    weight: 25,
    year: '2024',
    tags: ['customer-service', 'quality']
  },
  {
    id: 'goal-2',
    title: 'Complete Advanced React Training',
    description: 'Finish the advanced React course and implement learnings in current project.',
    employeeId: 'emp-marcus-jones',
    employeeName: 'Marcus Jones',
    managerId: 'mgr-alex-rivera',
    managerName: 'Alex Rivera',
    status: 'active',
    priority: 'medium',
    dueDate: '2024-06-30',
    createdAt: '2024-01-10T14:00:00Z',
    publishedAt: '2024-01-11T09:00:00Z',
    acknowledgedAt: '2024-01-11T15:30:00Z',
    progress: [
      {
        id: 'progress-1',
        note: 'Completed modules 1-3 of the React course. Learned about hooks and context.',
        createdAt: '2024-02-15T11:00:00Z',
        createdBy: 'Marcus Jones'
      }
    ],
    auditLog: [
      {
        id: 'audit-3',
        action: 'Goal Created',
        performedBy: 'Alex Rivera',
        performedAt: '2024-01-10T14:00:00Z',
      },
      {
        id: 'audit-4',
        action: 'Goal Published',
        performedBy: 'Alex Rivera',
        performedAt: '2024-01-11T09:00:00Z',
      },
      {
        id: 'audit-5',
        action: 'Goal Acknowledged',
        performedBy: 'Marcus Jones',
        performedAt: '2024-01-11T15:30:00Z',
      }
    ],
    type: 'Development',
    weight: 20,
    year: '2024',
    tags: ['training', 'development']
  }
];

const initialDivisionalGoals: DivisionalGoal[] = [
  {
    id: 'div-goal-1',
    title: 'Digital Transformation Initiative',
    description: 'Lead company-wide digital transformation to improve efficiency by 30%.',
    division: 'Technology',
    directorId: 'dir-jennifer-kim',
    directorName: 'Jennifer Kim',
    status: 'active',
    createdAt: '2024-01-05T09:00:00Z',
    activatedAt: '2024-01-06T10:00:00Z'
  }
];

export const useDemoGoalStore = create<DemoGoalStore>((set, get) => ({
  goals: initialGoals,
  divisionalGoals: initialDivisionalGoals,
  
  createGoal: async (goalData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newGoal: DemoGoal = {
      id: `goal-${Date.now()}`,
      title: goalData.title || '',
      description: goalData.description || '',
      employeeId: goalData.employeeId || '',
      employeeName: goalData.employeeName || '',
      managerId: goalData.managerId || '',
      managerName: goalData.managerName || '',
      status: 'draft',
      priority: goalData.priority || 'medium',
      dueDate: goalData.dueDate || '',
      createdAt: new Date().toISOString(),
      progress: [],
      auditLog: [{
        id: `audit-${Date.now()}`,
        action: 'Goal Created',
        performedBy: goalData.managerName || 'Manager',
        performedAt: new Date().toISOString(),
      }],
      type: goalData.type || 'Performance',
      weight: goalData.weight || 25,
      year: goalData.year || '2024',
      tags: goalData.tags || []
    };
    
    set((state) => ({
      goals: [...state.goals, newGoal]
    }));
    
    return newGoal;
  },
  
  publishGoal: async (goalId, publisherId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              status: 'published' as const,
              publishedAt: new Date().toISOString(),
              auditLog: [...goal.auditLog, {
                id: `audit-${Date.now()}`,
                action: 'Goal Published',
                performedBy: publisherId,
                performedAt: new Date().toISOString(),
              }]
            }
          : goal
      )
    }));
  },
  
  acknowledgeGoal: async (goalId, employeeId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              status: 'active' as const,
              acknowledgedAt: new Date().toISOString(),
              auditLog: [...goal.auditLog, {
                id: `audit-${Date.now()}`,
                action: 'Goal Acknowledged',
                performedBy: goal.employeeName,
                performedAt: new Date().toISOString(),
              }]
            }
          : goal
      )
    }));
  },
  
  addProgress: async (goalId, note, userId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              progress: [...goal.progress, {
                id: `progress-${Date.now()}`,
                note,
                createdAt: new Date().toISOString(),
                createdBy: userId
              }],
              auditLog: [...goal.auditLog, {
                id: `audit-${Date.now()}`,
                action: 'Progress Added',
                performedBy: userId,
                performedAt: new Date().toISOString(),
                details: note.substring(0, 50) + (note.length > 50 ? '...' : '')
              }]
            }
          : goal
      )
    }));
  },
  
  markCompleted: async (goalId, managerId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              auditLog: [...goal.auditLog, {
                id: `audit-${Date.now()}`,
                action: 'Goal Completed',
                performedBy: managerId,
                performedAt: new Date().toISOString(),
              }]
            }
          : goal
      )
    }));
  },
  
  archiveGoal: async (goalId, managerId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              status: 'archived' as const,
              archivedAt: new Date().toISOString(),
              auditLog: [...goal.auditLog, {
                id: `audit-${Date.now()}`,
                action: 'Goal Archived',
                performedBy: managerId,
                performedAt: new Date().toISOString(),
              }]
            }
          : goal
      )
    }));
  },
  
  createDivisionalGoal: async (goalData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const newDivisionalGoal: DivisionalGoal = {
      id: `div-goal-${Date.now()}`,
      title: goalData.title || '',
      description: goalData.description || '',
      division: goalData.division || '',
      directorId: goalData.directorId || '',
      directorName: goalData.directorName || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      divisionalGoals: [...state.divisionalGoals, newDivisionalGoal]
    }));
    
    return newDivisionalGoal;
  },
  
  activateDivisionalGoal: async (goalId, directorId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    set((state) => ({
      divisionalGoals: state.divisionalGoals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              status: 'active' as const,
              activatedAt: new Date().toISOString(),
            }
          : goal
      )
    }));
  },
  
  // Selectors
  getGoalsByEmployee: (employeeId) => {
    return get().goals.filter(goal => goal.employeeId === employeeId);
  },
  
  getGoalsByManager: (managerId) => {
    return get().goals.filter(goal => goal.managerId === managerId);
  },
  
  getActiveDivisionalGoals: () => {
    return get().divisionalGoals.filter(goal => goal.status === 'active');
  },
  
  getGoalById: (goalId) => {
    return get().goals.find(goal => goal.id === goalId);
  },
}));