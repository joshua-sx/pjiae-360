import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { simulateLatency } from '@/utils/demo-latency';

export interface AppraisalCycle {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  startDate: Date;
  endDate: Date;
  selfAssessmentDeadline: Date;
  managerReviewDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppraisalGoal {
  id: string;
  title: string;
  description: string;
  selfRating?: number;
  selfFeedback?: string;
  managerRating?: number;
  managerFeedback?: string;
}

export interface AppraisalCompetency {
  id: string;
  name: string;
  description: string;
  selfRating?: number;
  selfFeedback?: string;
  managerRating?: number;
  managerFeedback?: string;
}

export interface Appraisal {
  id: string;
  cycleId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  managerId: string;
  managerName: string;
  status: 'not_started' | 'self_assessment' | 'manager_review' | 'complete';
  goals: AppraisalGoal[];
  competencies: AppraisalCompetency[];
  overallSelfRating?: number;
  overallManagerRating?: number;
  employeeComments?: string;
  managerComments?: string;
  developmentPlan?: string;
  createdAt: Date;
  updatedAt: Date;
  selfAssessmentSubmittedAt?: Date;
  managerReviewSubmittedAt?: Date;
}

interface DemoAppraisalState {
  cycles: AppraisalCycle[];
  appraisals: Appraisal[];
  loading: boolean;
  initialized: boolean;
}

interface DemoAppraisalActions {
  initializeData: () => Promise<void>;
  
  // Cycle management
  createCycle: (cycle: Omit<AppraisalCycle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AppraisalCycle>;
  updateCycle: (id: string, updates: Partial<AppraisalCycle>) => Promise<AppraisalCycle>;
  deleteCycle: (id: string) => Promise<void>;
  activateCycle: (id: string) => Promise<void>;
  closeCycle: (id: string) => Promise<void>;
  
  // Appraisal management
  getAppraisalsForCycle: (cycleId: string) => Appraisal[];
  getAppraisalForEmployee: (cycleId: string, employeeId: string) => Appraisal | undefined;
  submitSelfAssessment: (appraisalId: string, data: {
    goals: AppraisalGoal[];
    competencies: AppraisalCompetency[];
    overallSelfRating: number;
    employeeComments: string;
  }) => Promise<void>;
  submitManagerReview: (appraisalId: string, data: {
    goals: AppraisalGoal[];
    competencies: AppraisalCompetency[];
    overallManagerRating: number;
    managerComments: string;
    developmentPlan: string;
  }) => Promise<void>;
}

// Demo data
const createDemoCycles = (): AppraisalCycle[] => [
  {
    id: 'cycle-1',
    name: '2024 Annual Review',
    description: 'Annual performance review for 2024',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    selfAssessmentDeadline: new Date('2024-02-15'),
    managerReviewDeadline: new Date('2024-03-15'),
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cycle-2',
    name: '2024 Mid-Year Review',
    description: 'Mid-year performance check-in',
    status: 'draft',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    selfAssessmentDeadline: new Date('2024-07-15'),
    managerReviewDeadline: new Date('2024-08-15'),
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
  }
];

const createDemoAppraisals = (): Appraisal[] => [
  {
    id: 'appraisal-1',
    cycleId: 'cycle-1',
    employeeId: 'emp-1',
    employeeName: 'John Smith',
    employeeEmail: 'john.smith@company.com',
    managerId: 'mgr-1',
    managerName: 'Sarah Johnson',
    status: 'self_assessment',
    goals: [
      {
        id: 'goal-1',
        title: 'Improve Customer Satisfaction',
        description: 'Increase customer satisfaction score by 15%',
      },
      {
        id: 'goal-2',
        title: 'Team Leadership',
        description: 'Lead cross-functional project teams effectively',
      }
    ],
    competencies: [
      {
        id: 'comp-1',
        name: 'Communication',
        description: 'Effectively communicates with team members and stakeholders',
      },
      {
        id: 'comp-2',
        name: 'Problem Solving',
        description: 'Identifies and resolves complex problems efficiently',
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  }
];

export const useDemoAppraisalStore = create<DemoAppraisalState & DemoAppraisalActions>()(
  subscribeWithSelector((set, get) => ({
    cycles: [],
    appraisals: [],
    loading: false,
    initialized: false,

    initializeData: async () => {
      if (get().initialized) return;
      
      set({ loading: true });
      await simulateLatency(800, 1200);
      
      set({
        cycles: createDemoCycles(),
        appraisals: createDemoAppraisals(),
        loading: false,
        initialized: true,
      });
    },

    createCycle: async (cycleData) => {
      set({ loading: true });
      await simulateLatency();
      
      const newCycle: AppraisalCycle = {
        ...cycleData,
        id: `cycle-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => ({
        cycles: [...state.cycles, newCycle],
        loading: false,
      }));
      
      return newCycle;
    },

    updateCycle: async (id, updates) => {
      set({ loading: true });
      await simulateLatency();
      
      const updatedCycle = {
        ...get().cycles.find(c => c.id === id)!,
        ...updates,
        updatedAt: new Date(),
      };
      
      set((state) => ({
        cycles: state.cycles.map(c => c.id === id ? updatedCycle : c),
        loading: false,
      }));
      
      return updatedCycle;
    },

    deleteCycle: async (id) => {
      set({ loading: true });
      await simulateLatency();
      
      set((state) => ({
        cycles: state.cycles.filter(c => c.id !== id),
        appraisals: state.appraisals.filter(a => a.cycleId !== id),
        loading: false,
      }));
    },

    activateCycle: async (id) => {
      await get().updateCycle(id, { status: 'active' });
    },

    closeCycle: async (id) => {
      await get().updateCycle(id, { status: 'closed' });
    },

    getAppraisalsForCycle: (cycleId) => {
      return get().appraisals.filter(a => a.cycleId === cycleId);
    },

    getAppraisalForEmployee: (cycleId, employeeId) => {
      return get().appraisals.find(a => a.cycleId === cycleId && a.employeeId === employeeId);
    },

    submitSelfAssessment: async (appraisalId, data) => {
      set({ loading: true });
      await simulateLatency();
      
      set((state) => ({
        appraisals: state.appraisals.map(a => 
          a.id === appraisalId 
            ? {
                ...a,
                ...data,
                status: 'manager_review' as const,
                selfAssessmentSubmittedAt: new Date(),
                updatedAt: new Date(),
              }
            : a
        ),
        loading: false,
      }));
    },

    submitManagerReview: async (appraisalId, data) => {
      set({ loading: true });
      await simulateLatency();
      
      set((state) => ({
        appraisals: state.appraisals.map(a => 
          a.id === appraisalId 
            ? {
                ...a,
                ...data,
                status: 'complete' as const,
                managerReviewSubmittedAt: new Date(),
                updatedAt: new Date(),
              }
            : a
        ),
        loading: false,
      }));
    },
  }))
);