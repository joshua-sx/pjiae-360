import { useReducer, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAppraisalCRUD } from "@/features/appraisals/hooks/useAppraisalCRUD";
import { useAppraiserAssignment } from "@/hooks/useAppraiserAssignment";
import { useCurrentOrganization } from "@/hooks/useCurrentOrganization";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { supabase } from "@/integrations/supabase/client";
import { Employee, AppraisalData, Goal, Competency } from '../types';
import { SaveStatus } from '../components/SaveStatusIndicator';
import { NotificationProps } from '../components/NotificationSystem';
import { notifyAppraisalEvent, logAuditEvent } from './useAppraisals';

// Appraisal flow steps definition
const steps = [
  { id: 1, title: "Assign Appraisers", description: "Select Primary & Secondary Appraisers" },
  { id: 2, title: "Goals", description: "Grade Performance Goals" },
  { id: 3, title: "Competencies", description: "Grade Core Competencies" },
  { id: 4, title: "Review & Sign-Off", description: "Calculate & Review Overall Rating" }
];

interface AppraisalState {
  currentStep: number;
  selectedEmployee: Employee | null;
  currentAppraisalId: string | null;
  appraisalData: AppraisalData;
  assignedAppraisers: any[];
  ui: {
    isLoading: boolean;
    isAutoSaving: boolean;
    saveStatus: SaveStatus;
    lastSaved: Date | null;
    showAppraiserModal: boolean;
    showAuditTrail: boolean;
    notification: NotificationProps | null;
  };
}

type AppraisalAction = 
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_EMPLOYEE'; payload: Employee }
  | { type: 'SET_APPRAISAL_ID'; payload: string }
  | { type: 'SET_ASSIGNED_APPRAISERS'; payload: any[] }
  | { type: 'SET_APPRAISAL_DATA'; payload: Partial<AppraisalData> }
  | { type: 'SET_UI_STATE'; payload: Partial<AppraisalState['ui']> }
  | { type: 'UPDATE_GOAL'; payload: { goalId: string; rating?: number; feedback?: string } }
  | { type: 'UPDATE_COMPETENCY'; payload: { competencyId: string; rating?: number; feedback?: string } };

const initialState: AppraisalState = {
  currentStep: 0,
  selectedEmployee: null,
  currentAppraisalId: null,
  appraisalData: {
    employeeId: "",
    goals: [],
    competencies: [],
    status: 'draft',
    signatures: {},
    timestamps: {
      created: new Date(),
      lastModified: new Date()
    }
  },
  assignedAppraisers: [],
  ui: {
    isLoading: false,
    isAutoSaving: false,
    saveStatus: 'idle',
    lastSaved: null,
    showAppraiserModal: false,
    showAuditTrail: false,
    notification: null,
  }
};

function appraisalReducer(state: AppraisalState, action: AppraisalAction): AppraisalState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_EMPLOYEE':
      return { ...state, selectedEmployee: action.payload };
    case 'SET_APPRAISAL_ID':
      return { ...state, currentAppraisalId: action.payload };
    case 'SET_ASSIGNED_APPRAISERS':
      return { ...state, assignedAppraisers: action.payload };
    case 'SET_APPRAISAL_DATA':
      return { 
        ...state, 
        appraisalData: { 
          ...state.appraisalData, 
          ...action.payload,
          timestamps: { ...state.appraisalData.timestamps, lastModified: new Date() }
        }
      };
    case 'SET_UI_STATE':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case 'UPDATE_GOAL':
      return {
        ...state,
        appraisalData: {
          ...state.appraisalData,
          goals: state.appraisalData.goals.map(goal => 
            goal.id === action.payload.goalId 
              ? { ...goal, rating: action.payload.rating, feedback: action.payload.feedback }
              : goal
          ),
          timestamps: { ...state.appraisalData.timestamps, lastModified: new Date() }
        }
      };
    case 'UPDATE_COMPETENCY':
      return {
        ...state,
        appraisalData: {
          ...state.appraisalData,
          competencies: state.appraisalData.competencies.map(competency => 
            competency.id === action.payload.competencyId 
              ? { ...competency, rating: action.payload.rating, feedback: action.payload.feedback }
              : competency
          ),
          timestamps: { ...state.appraisalData.timestamps, lastModified: new Date() }
        }
      };
    default:
      return state;
  }
}

export function useAppraisalFlow(initialStep = 0) {
  const [state, dispatch] = useReducer(appraisalReducer, { ...initialState, currentStep: initialStep });
  const { createAppraisal, getAppraisalGoals, getAppraisalCompetencies } = useAppraisalCRUD();
  const { getAppraisalAppraisers } = useAppraiserAssignment();
  const orgStore = useCurrentOrganization();
  const organizationId = orgStore.id;
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    dispatch({ type: 'SET_UI_STATE', payload: { notification: { type, message } } });
    setTimeout(() => dispatch({ type: 'SET_UI_STATE', payload: { notification: null } }), 5000);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getOrCreateDefaultCycle = async (organizationId: string) => {
    try {
      // In demo mode, return a placeholder cycle ID
      if (isDemoMode) {
        return 'demo-cycle-' + Math.random().toString(36).substr(2, 9);
      }

      // First, try to find an existing active cycle for the organization
      const { data: existingCycles, error: fetchError } = await supabase
        .from('appraisal_cycles')
        .select('id, name, status')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching cycles:', fetchError);
        // In case of RLS or permission issues, provide helpful guidance
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('RLS')) {
          throw new Error('Access denied: You may not have permission to access appraisal cycles. Please contact your administrator.');
        }
        throw fetchError;
      }

      // If an active cycle exists, use it
      if (existingCycles && existingCycles.length > 0) {
        return existingCycles[0].id;
      }

      // No active cycle found, create a default one
      const currentYear = new Date().getFullYear();
      const { data: newCycle, error: createError } = await supabase
        .from('appraisal_cycles')
        .insert({
          name: `${currentYear} Performance Review`,
          organization_id: organizationId,
          year: currentYear,
          start_date: `${currentYear}-01-01`,
          end_date: `${currentYear}-12-31`,
          status: 'active',
          description: 'Default annual performance review cycle'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating cycle:', createError);
        // Provide helpful error messages for common issues
        if (createError.code === 'PGRST116' || createError.message?.includes('RLS')) {
          throw new Error('Permission denied: You may not have permission to create appraisal cycles. Please contact your administrator.');
        }
        throw createError;
      }

      return newCycle.id;
    } catch (error: any) {
      console.error('Failed to get or create default cycle:', error);
      // Re-throw with context
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to setup appraisal cycle. Please try again or contact support.');
    }
  };

  const startAppraisal = async (employee: Employee) => {
    if (!organizationId && !isDemoMode) {
      showNotification('error', 'Organization not found. Please refresh and try again.');
      return;
    }
    
    dispatch({ type: 'SET_UI_STATE', payload: { isLoading: true } });
    
    try {
      if (isDemoMode) {
        // Demo mode: create a local appraisal without hitting the database
        const demoAppraisalId = 'demo-appraisal-' + Math.random().toString(36).substr(2, 9);
        
        dispatch({ type: 'SET_EMPLOYEE', payload: employee });
        dispatch({ type: 'SET_APPRAISAL_ID', payload: demoAppraisalId });
        dispatch({ type: 'SET_APPRAISAL_DATA', payload: { employeeId: employee.id } });
        dispatch({ type: 'SET_STEP', payload: 1 });
        
        scrollToTop();
        showNotification('info', 'Demo appraisal created successfully. (Demo mode - changes won\'t be saved)');
        return;
      }

      // Get or create a default cycle first
      const cycleId = await getOrCreateDefaultCycle(organizationId!);
      
      const appraisal = await createAppraisal({
        employee_id: employee.id,
        cycle_id: cycleId,
        organization_id: organizationId!,
        status: 'draft',
        phase: 'goal_setting'
      });
      
      dispatch({ type: 'SET_EMPLOYEE', payload: employee });
      dispatch({ type: 'SET_APPRAISAL_ID', payload: appraisal.id });
      dispatch({ type: 'SET_APPRAISAL_DATA', payload: { employeeId: employee.id } });
      dispatch({ type: 'SET_STEP', payload: 1 });
      
      scrollToTop();
      showNotification('info', 'Appraisal created successfully.');
    } catch (error: any) {
      console.error('Failed to create appraisal:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Failed to create appraisal. Please try again.';
      
      if (error?.message?.includes('Permission denied') || error?.message?.includes('Access denied')) {
        errorMessage = error.message + ' You may need to contact your administrator.';
      } else if (error?.message?.includes('RLS')) {
        errorMessage = 'Access denied: You may not have permission to create appraisals for this employee.';
      } else if (error?.message?.includes('cycle')) {
        errorMessage = 'Failed to setup appraisal cycle. Please contact your administrator.';
      }
      
      showNotification('error', errorMessage);
    } finally {
      dispatch({ type: 'SET_UI_STATE', payload: { isLoading: false } });
    }
  };

  const updateGoal = useCallback((goalId: string, rating?: number, feedback?: string) => {
    dispatch({ type: 'UPDATE_GOAL', payload: { goalId, rating, feedback } });
    
    // Show immediate visual feedback
    dispatch({ type: 'SET_UI_STATE', payload: { saveStatus: 'saving' } });
    setTimeout(() => dispatch({ type: 'SET_UI_STATE', payload: { saveStatus: 'saved' } }), 500);
    setTimeout(() => dispatch({ type: 'SET_UI_STATE', payload: { saveStatus: 'idle' } }), 2000);
  }, []);

  const updateCompetency = useCallback((competencyId: string, rating?: number, feedback?: string) => {
    dispatch({ type: 'UPDATE_COMPETENCY', payload: { competencyId, rating, feedback } });
    
    // Show immediate visual feedback
    dispatch({ type: 'SET_UI_STATE', payload: { saveStatus: 'saving' } });
    setTimeout(() => dispatch({ type: 'SET_UI_STATE', payload: { saveStatus: 'saved' } }), 500);
    setTimeout(() => dispatch({ type: 'SET_UI_STATE', payload: { saveStatus: 'idle' } }), 2000);
  }, []);

  const calculateOverallRating = useCallback(() => {
    const goalRatings = state.appraisalData.goals.filter(g => g.rating).map(g => g.rating!);
    const competencyRatings = state.appraisalData.competencies.filter(c => c.rating).map(c => c.rating!);
    
    if (goalRatings.length === 0 && competencyRatings.length === 0) return 0;
    
    const allRatings = [...goalRatings, ...competencyRatings];
    return Math.round(allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length * 10) / 10;
  }, [state.appraisalData.goals, state.appraisalData.competencies]);

  const loadAppraisalData = async () => {
    if (!state.currentAppraisalId || !organizationId) return;
    
    try {
      const [goals, competencies] = await Promise.all([
        getAppraisalGoals(state.currentAppraisalId),
        getAppraisalCompetencies(organizationId)
      ]);
      
      dispatch({ type: 'SET_APPRAISAL_DATA', payload: {
        goals: goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || '',
          rating: undefined,
          feedback: ''
        })),
        competencies: competencies.map(comp => ({
          id: comp.id,
          title: comp.name,
          description: comp.description || '',
          rating: undefined,
          feedback: ''
        }))
      }});
    } catch (error) {
      console.error('Failed to load appraisal data:', error);
      showNotification('error', 'Failed to load appraisal data');
    }
  };

  const handleAppraiserAssignmentComplete = async () => {
    if (!state.currentAppraisalId) return;
    
    try {
      const appraisers = await getAppraisalAppraisers(state.currentAppraisalId);
      dispatch({ type: 'SET_ASSIGNED_APPRAISERS', payload: appraisers });
      dispatch({ type: 'SET_UI_STATE', payload: { showAppraiserModal: false } });
      
      await loadAppraisalData();
      showNotification('success', 'Appraisers assigned successfully');
    } catch (error) {
      console.error('Failed to load appraisers:', error);
    }
  };

  const handleSubmit = async (onComplete?: (data: AppraisalData) => void) => {
    dispatch({ type: 'SET_UI_STATE', payload: { isLoading: true } });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const finalData = {
        ...state.appraisalData,
        overallRating: calculateOverallRating(),
        status: 'with_second_appraiser' as const,
        timestamps: {
          ...state.appraisalData.timestamps,
          submitted: new Date(),
          lastModified: new Date()
        }
      };

      dispatch({ type: 'SET_APPRAISAL_DATA', payload: finalData });
      if (state.currentAppraisalId) {
        await notifyAppraisalEvent(state.currentAppraisalId, 'submitted', { status: finalData.status });
        await logAuditEvent(state.currentAppraisalId, 'appraisal_submitted', { status: finalData.status });
        await notifyAppraisalEvent(state.currentAppraisalId, 'needs_signature', { status: finalData.status });
      }
      onComplete?.(finalData);
      showNotification('success', 'Appraisal submitted successfully');
    } catch (error) {
      showNotification('error', 'Failed to submit appraisal');
    } finally {
      dispatch({ type: 'SET_UI_STATE', payload: { isLoading: false } });
    }
  };

  const nextStep = () => {
    if (state.currentStep < steps.length) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
      scrollToTop();
    }
  };

  // Validation functions
  const canProceedFromAppraisers = () => state.assignedAppraisers.length > 0;
  const canProceedFromGoals = () => state.appraisalData.goals.every(goal => goal.rating !== undefined);
  const canProceedFromCompetencies = () => state.appraisalData.competencies.every(competency => competency.rating !== undefined);

  const canProceedFromCurrentStep = () => {
    switch (state.currentStep) {
      case 1: return canProceedFromAppraisers();
      case 2: return canProceedFromGoals();
      case 3: return canProceedFromCompetencies();
      default: return true;
    }
  };

  return {
    state,
    dispatch,
    steps,
    actions: {
      startAppraisal,
      updateGoal,
      updateCompetency,
      calculateOverallRating,
      loadAppraisalData,
      handleAppraiserAssignmentComplete,
      handleSubmit,
      nextStep,
      prevStep,
      canProceedFromCurrentStep,
      canProceedFromAppraisers,
      canProceedFromGoals,
      canProceedFromCompetencies,
      showNotification
    }
  };
}