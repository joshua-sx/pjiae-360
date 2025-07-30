
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { OnboardingData } from "./OnboardingTypes";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { useDraftPersistence } from "@/hooks/useDraftPersistence";
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
  const { saveDraft, deleteDraft } = useDraftPersistence();
  const draftRecovery = useDraftRecovery();
  
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  // Scroll to top whenever milestone changes
  useScrollToTop(currentMilestoneIndex);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    orgName: "",
    logo: null,
    entryMethod: null,
    adminInfo: {
      name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || "Admin User" : "Admin User",
      email: user?.email || "admin@company.com",
      role: "Administrator"
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
    importStats: {
      total: 0,
      successful: 0,
      errors: 0
    }
  });

  // Get filtered milestones based on entry method
  const getActiveMilestones = () => {
    if (onboardingData.entryMethod === 'manual') {
      // Manual flow: skip mapping step
      return milestones.filter(milestone => milestone.id !== 'mapping');
    }
    // CSV flow: include all steps
    return milestones;
  };

  const activeMilestones = getActiveMilestones();

  // Debounced auto-save trigger
  const debouncedOnboardingData = useDebounce(onboardingData, 2000);

  const handleAutoSave = useCallback(async () => {
    if (!user || autoSaveStatus === 'saving') return;

    setAutoSaveStatus('saving');
    
    try {
      const result = await saveDraft(currentMilestoneIndex, onboardingData, organizationId || undefined);
      if (result.success) {
        setAutoSaveStatus('saved');
        setLastAutoSave('just now');
        
        toast({
          title: "Progress saved",
          description: "Your changes have been automatically saved",
        });
        
        // Reset to idle after short delay
        setTimeout(() => setAutoSaveStatus('idle'), 1000);
      } else {
        setAutoSaveStatus('error');
        console.error('Auto-save failed:', result.error);
        
        toast({
          title: "Save failed",
          description: "Unable to save progress. Please check your connection.",
          variant: "destructive",
        });
        
        // Reset to idle after error
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Auto-save error:', error);
      
      toast({
        title: "Save failed",
        description: "An error occurred while saving your progress",
        variant: "destructive",
      });
      
      // Reset to idle after error
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }
  }, [user, currentMilestoneIndex, onboardingData, organizationId, saveDraft, autoSaveStatus, toast]);

  // Auto-save effect
  useEffect(() => {
    if (currentMilestoneIndex > 0 && autoSaveStatus !== 'saving') {
      handleAutoSave();
    }
  }, [debouncedOnboardingData, currentMilestoneIndex, handleAutoSave]);

  // Initialize from draft if available
  useEffect(() => {
    if (draftRecovery.hasDraft && draftRecovery.draftData && !draftRecovery.isChecking) {
      // Auto-load draft data without showing modal for first-time users
      if (currentMilestoneIndex === 0 && Object.keys(onboardingData).every(key => 
        key === 'adminInfo' || !onboardingData[key as keyof OnboardingData] || 
        (Array.isArray(onboardingData[key as keyof OnboardingData]) && (onboardingData[key as keyof OnboardingData] as any[]).length === 0)
      )) {
        setOnboardingData(draftRecovery.draftData);
        setCurrentMilestoneIndex(draftRecovery.draftStep);
        setCompletedSteps(new Set(Array.from({ length: draftRecovery.draftStep }, (_, i) => i)));
      }
    }
  }, [draftRecovery.hasDraft, draftRecovery.draftData, draftRecovery.isChecking]);

  const onDataChange = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
    setAutoSaveStatus('idle');
  }, []);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentMilestoneIndex]));
      
      // Move to next step in active milestones
      if (currentMilestoneIndex < activeMilestones.length - 1) {
        setCurrentMilestoneIndex(prev => prev + 1);
      } else {
        // Save all onboarding data before marking complete
        toast({
          title: "Saving setup...",
          description: "Processing your organization setup",
        });
        
        const saveResult = await saveOnboardingData(onboardingData);
        
        if (!saveResult.success) {
          toast({
            title: "Save failed",
            description: `Failed to save onboarding data: ${saveResult.error}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Setup saved!",
          description: "Your organization has been successfully configured",
        });
        
        // Mark onboarding as complete when reaching the end
        const markResult = await markOnboardingComplete(saveResult.organizationId);
        if (!markResult.success) {
          toast({
            title: "Setup incomplete",
            description: "Failed to complete onboarding. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
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
  }, [currentMilestoneIndex, navigate, activeMilestones.length, markOnboardingComplete, saveOnboardingData, onboardingData]);

  const handleBack = useCallback(() => {
    if (currentMilestoneIndex > 0) {
      setCurrentMilestoneIndex(prev => prev - 1);
    }
  }, [currentMilestoneIndex]);

  const handleSkipTo = useCallback((stepIndex: number) => {
    // Only allow navigation to completed steps or the next step
    if (completedSteps.has(stepIndex) || stepIndex === currentMilestoneIndex + 1) {
      setCurrentMilestoneIndex(stepIndex);
    }
  }, [completedSteps, currentMilestoneIndex]);

  const handleResumeDraft = useCallback(() => {
    if (draftRecovery.draftData) {
      setOnboardingData(draftRecovery.draftData);
      setCurrentMilestoneIndex(draftRecovery.draftStep);
      setCompletedSteps(new Set(Array.from({ length: draftRecovery.draftStep }, (_, i) => i)));
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
    completedSteps,
    activeMilestones,
    onDataChange,
    handleNext,
    handleBack,
    handleSkipTo,
    // Draft management
    draftRecovery,
    handleResumeDraft,
    handleStartFresh
  };
};
