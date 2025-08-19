
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { OnboardingData } from "./OnboardingTypes";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { useStepByStepPersistence } from "@/hooks/useStepByStepPersistence";
import { useDraftPersistenceContext } from "@/contexts/DraftPersistenceContext";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";
import { useDebounce } from "@/hooks/useDebounce";
import { milestones } from "./OnboardingMilestones";
import { useToast } from "@/hooks/use-toast";

export const useOnboardingLogic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markOnboardingComplete } = useOnboardingStatus();
  const { saveOnboardingData } = useOnboardingPersistence();
  const stepPersistence = useStepByStepPersistence();
  const { 
    saveDraft, 
    deleteDraft,
    saveStatus,
    lastSavedAt,
    isOnline
  } = useDraftPersistenceContext();
  const draftRecovery = useDraftRecovery();
  
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  // Refs for managing save operations and change detection
  const isSavingRef = useRef(false);
  const currentSaveToastRef = useRef<{ id: string; dismiss: () => void } | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const lastQueuedDataRef = useRef<string>('');
  
  // Scroll to top whenever milestone changes with smooth behavior
  useScrollToTop(currentMilestoneIndex, { behavior: 'smooth' });
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    orgName: "",
    logo: null,
    entryMethod: null,
    uiState: {
      peopleStage: 'entry',
      mappingReviewed: false
    },
    orgProfile: {
      industry: undefined,
      companySize: undefined,
      locale: 'en-US',
      timezone: 'UTC',
      currency: 'USD',
      workWeek: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      fiscalYearStart: '2024-01-01',
      publicHolidays: []
    },
    adminInfo: {
      name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || "Admin User" : "Admin User",
      email: user?.email || "admin@company.com",
      role: "Administrator",
      jobTitle: '',
      phoneNumber: '',
      preferredCommunication: 'email'
    },
    csvData: {
      rawData: "",
      headers: [],
      rows: [],
      columnMapping: {}
    },
    people: [],
    orgStructure: [],
    roles: {
      directors: [],
      managers: [],
      supervisors: [],
      employees: []
    },
    reviewCycle: {
      frequency: "quarterly",
      startDate: new Date().toISOString().split('T')[0],
      visibility: true
    },
    notificationSettings: {
      fromEmail: user?.email || '',
      fromName: '',
      defaultReminderDays: 7,
      escalationDays: 14,
      channels: {
        email: true,
        inApp: true
      }
    },
    consents: {
      dataProcessing: false,
      communications: false,
      analytics: false
    },
    importStats: {
      total: 0,
      successful: 0,
      errors: 0
    }
  });

  // Get all active milestones - now returns the updated 5-step flow
  const getActiveMilestones = () => {
    return milestones; // All milestones are active in the new 5-step flow
  };

  const activeMilestones = getActiveMilestones();

  // Clamp currentMilestoneIndex when activeMilestones changes
  useEffect(() => {
    if (currentMilestoneIndex >= activeMilestones.length && activeMilestones.length > 0) {
      setCurrentMilestoneIndex(Math.max(0, activeMilestones.length - 1));
    }
  }, [activeMilestones.length, currentMilestoneIndex]);

  // Debounced auto-save trigger
  const debouncedOnboardingData = useDebounce(onboardingData, 2000);

  // Manage save toast - only show errors, let SaveStatusIndicator handle success states
  const manageSaveToast = useCallback((type: 'error', message?: string) => {
    // Dismiss existing toast
    if (currentSaveToastRef.current) {
      currentSaveToastRef.current.dismiss();
      currentSaveToastRef.current = null;
    }

    // Only create error toasts
    if (type === 'error') {
      const toastResult = toast({
        title: "Save failed",
        description: message || "Unable to save progress. Please check your connection.",
        variant: "destructive",
      });
      currentSaveToastRef.current = toastResult;
      return toastResult;
    }
  }, [toast]);

  const handleAutoSave = useCallback(async () => {
    if (!user || isSavingRef.current || !onboardingData.entryMethod) return;

    // Check if data has actually changed to prevent unnecessary saves
    const currentDataString = JSON.stringify(onboardingData);
    if (currentDataString === lastSavedDataRef.current || currentDataString === lastQueuedDataRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auto-save skipped: no data changes detected');
      }
      return;
    }

    lastQueuedDataRef.current = currentDataString;
    isSavingRef.current = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Auto-save queued for milestone:', currentMilestoneIndex);
    }
    
    try {
      const result = await saveDraft(currentMilestoneIndex, onboardingData, organizationId || undefined);
      
      if (result.success) {
        lastSavedDataRef.current = currentDataString;
        if (process.env.NODE_ENV === 'development') {
          console.log('Auto-save successful');
        }
        // Silent success - let SaveStatusIndicator handle UI feedback
      } else {
        console.error('Auto-save failed:', result.error);
        manageSaveToast('error', result.error?.includes('network') || result.error?.includes('connection') 
          ? "Connection lost. We'll retry automatically." 
          : "Unable to save progress. Please check your connection.");
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      manageSaveToast('error', "An error occurred while saving your progress");
    } finally {
      isSavingRef.current = false;
    }
  }, [user, currentMilestoneIndex, onboardingData, organizationId, saveDraft, manageSaveToast]);

  // Auto-save effect - only trigger on actual data changes
  useEffect(() => {
    if (currentMilestoneIndex > 0 && !isSavingRef.current && onboardingData.entryMethod) {
      handleAutoSave();
    }
  }, [debouncedOnboardingData]); // Removed handleAutoSave dependency to prevent effect re-runs

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up toasts on unmount
      if (currentSaveToastRef.current) {
        currentSaveToastRef.current.dismiss();
      }
    };
  }, []);

  // Load persisted data if no draft is available
  useEffect(() => {
    const loadPersistedDataIfNeeded = async () => {
      if (!user || draftRecovery.draftData || currentMilestoneIndex > 0) return;
      
      try {
        const persistedData = await stepPersistence.loadPersistedData();
        if (persistedData) {
          setOnboardingData(prev => ({ ...prev, ...persistedData }));
          // If we have substantial persisted data, advance to appropriate step
          if (persistedData.people && persistedData.people.length > 0) {
            setCurrentMilestoneIndex(3); // Go to appraisal step
            setCompletedStepIds(new Set(['organization', 'structure', 'people']));
          } else if (persistedData.orgStructure && persistedData.orgStructure.length > 0) {
            setCurrentMilestoneIndex(2); // Go to people step
            setCompletedStepIds(new Set(['organization', 'structure']));
          } else if (persistedData.orgName) {
            setCurrentMilestoneIndex(1); // Go to structure step
            setCompletedStepIds(new Set(['organization']));
          }
        }
      } catch (error) {
        console.warn('Failed to load persisted data:', error);
      }
    };

    loadPersistedDataIfNeeded();
  }, [user, draftRecovery.draftData, currentMilestoneIndex, stepPersistence]);

  const onDataChange = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => {
      const newData = { ...prev, ...updates };
      
      // Reset UI state when switching entry methods
      if (updates.entryMethod && updates.entryMethod !== prev.entryMethod) {
        newData.uiState = {
          peopleStage: 'entry',
          mappingReviewed: false
        };
        // Clear column mapping when switching methods
        if (updates.entryMethod === 'manual' && prev.csvData.columnMapping) {
          newData.csvData = {
            ...newData.csvData,
            columnMapping: {}
          };
        }
      }
      
      return newData;
    });
  }, []);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Auto-save draft progress
      await handleAutoSave();
      
      const currentMilestone = activeMilestones[currentMilestoneIndex];
      
      // Handle sub-step navigation for CSV uploads in people step
      if (currentMilestone?.id === 'people' && onboardingData.entryMethod === 'csv') {
        if (onboardingData.uiState?.peopleStage === 'entry' && onboardingData.csvData.headers.length > 0) {
          setOnboardingData(prev => ({
            ...prev,
            uiState: { ...prev.uiState, peopleStage: 'mapping' }
          }));
          setIsLoading(false);
          return;
        } else if (onboardingData.uiState?.peopleStage === 'mapping') {
          setOnboardingData(prev => ({
            ...prev,
            uiState: { ...prev.uiState, mappingReviewed: true }
          }));
        }
      }
      
      // Save step data to backend before moving to next step
      let saveResult: { success: boolean; organizationId?: string; error?: string } = { success: true };
      
      if (currentMilestone?.id === 'organization') {
        saveResult = await stepPersistence.saveOrgDetails(onboardingData);
        if (saveResult.organizationId) {
          setOrganizationId(saveResult.organizationId);
        }
      } else if (currentMilestone?.id === 'structure' && organizationId) {
        saveResult = await stepPersistence.saveOrgStructure(onboardingData, organizationId);
      } else if (currentMilestone?.id === 'people' && organizationId) {
        saveResult = await stepPersistence.savePeople(onboardingData, organizationId);
      } else if (currentMilestone?.id === 'appraisal' && organizationId) {
        saveResult = await stepPersistence.saveAppraisal(onboardingData, organizationId);
      }
      
      if (!saveResult.success) {
        toast({
          title: "Save failed",
          description: saveResult.error || "Failed to save step data. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Mark current step as completed
      if (currentMilestone) {
        setCompletedStepIds(prev => new Set([...prev, currentMilestone.id]));
      }
      
      // Move to next step or complete onboarding
      if (currentMilestoneIndex < activeMilestones.length - 1) {
        setCurrentMilestoneIndex(prev => prev + 1);
      } else {
        // Final completion
        toast({
          title: "Setup complete!",
          description: "Your organization has been successfully configured",
        });
        
        const finalOrgId = saveResult.organizationId || organizationId;
        const markResult = await markOnboardingComplete(finalOrgId);
        if (!markResult.success) {
          console.error('Failed to mark onboarding complete:', markResult.error);
        }
        
        // Clean up draft data
        try {
          await deleteDraft();
        } catch (error) {
          console.warn('Failed to clean up draft after completion:', error);
        }
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error proceeding to next milestone:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentMilestoneIndex, navigate, activeMilestones, onboardingData, organizationId, stepPersistence, handleAutoSave, markOnboardingComplete, deleteDraft, toast]);

  const handleBack = useCallback(() => {
    const currentMilestone = activeMilestones[currentMilestoneIndex];
    
    // Handle sub-step navigation for CSV uploads in people step
    if (currentMilestone?.id === 'people' && 
        onboardingData.entryMethod === 'csv' && 
        onboardingData.uiState?.peopleStage === 'mapping') {
      // Go back to entry sub-step within people step
      setOnboardingData(prev => ({
        ...prev,
        uiState: { ...prev.uiState, peopleStage: 'entry' }
      }));
      return;
    }
    
    if (currentMilestoneIndex > 0) {
      setCurrentMilestoneIndex(prev => prev - 1);
    }
  }, [currentMilestoneIndex, activeMilestones, onboardingData.entryMethod, onboardingData.uiState?.peopleStage]);

  const handleSkipTo = useCallback((stepIndex: number) => {
    // Only allow navigation to completed steps or the next step
    const targetMilestone = activeMilestones[stepIndex];
    if (targetMilestone && (
      completedStepIds.has(targetMilestone.id) || 
      stepIndex === currentMilestoneIndex + 1
    )) {
      // Reset to entry sub-step when navigating to people step
      if (targetMilestone.id === 'people' && onboardingData.entryMethod === 'csv') {
        setOnboardingData(prev => ({
          ...prev,
          uiState: { ...prev.uiState, peopleStage: 'entry' }
        }));
      }
      setCurrentMilestoneIndex(stepIndex);
    }
  }, [completedStepIds, currentMilestoneIndex, activeMilestones, onboardingData.entryMethod]);

  const handleResumeDraft = useCallback(() => {
    if (draftRecovery.draftData) {
      setOnboardingData(draftRecovery.draftData);
      setCurrentMilestoneIndex(draftRecovery.draftStep);
      
      // Mark all steps up to the draft step as completed by ID
      const completedIds = new Set<string>();
      for (let i = 0; i < draftRecovery.draftStep && i < activeMilestones.length; i++) {
        completedIds.add(activeMilestones[i].id);
      }
      setCompletedStepIds(completedIds);
      
      draftRecovery.clearRecoveryState();
    }
  }, [draftRecovery]);

  const handleStartFresh = useCallback(async () => {
    await draftRecovery.discardDraft();
    draftRecovery.clearRecoveryState();
  }, [draftRecovery]);

  return {
    currentMilestoneIndex,
    isLoading,
    onboardingData,
    completedStepIds,
    activeMilestones,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo,
    // Draft management
    draftRecovery,
    handleResumeDraft,
    handleStartFresh,
    // Save status from draft persistence
    saveStatus,
    lastSavedAt,
    isOnline
  };
};
