import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { AppraisalData } from '../types';
import { SaveStatus } from '../components/SaveStatusIndicator';

export function useAutoSave(
  data: AppraisalData, 
  enabled: boolean,
  onSaveDraft?: (data: AppraisalData) => void
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  const { toast } = useToast();

  // Silent auto-save function without notifications
  const handleSilentAutoSave = useCallback(async () => {
    if (!enabled || !data.employeeId) return;
    
    setIsAutoSaving(true);
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Brief success indicator
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [data, enabled]);

  // Manual save with notification
  const handleManualSave = useCallback(async () => {
    setSaveStatus('saving');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedData = {
        ...data,
        timestamps: { ...data.timestamps, lastModified: new Date() }
      };
      
      setLastSaved(new Date());
      onSaveDraft?.(updatedData);
      setSaveStatus('saved');
      
      toast({
        title: "Draft saved",
        description: "Your appraisal draft has been saved successfully.",
        duration: 3000,
      });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      
      toast({
        title: "Save failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [data, onSaveDraft, toast]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled || !data.employeeId) return;
    
    const currentDataString = JSON.stringify(data);
    if (currentDataString === lastDataRef.current) return;
    
    lastDataRef.current = currentDataString;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      handleSilentAutoSave();
    }, 3000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, handleSilentAutoSave]);

  return { 
    saveStatus, 
    lastSaved, 
    isAutoSaving,
    handleManualSave 
  };
}