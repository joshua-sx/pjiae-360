import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineSignature {
  id: string;
  appraisalId: string;
  signatureData: string;
  timestamp: number;
  role: string;
  synced: boolean;
}

const STORAGE_KEY = 'appraisal_offline_signatures';
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useOfflineSignature() {
  const [offlineSignatures, setOfflineSignatures] = useState<OfflineSignature[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load offline signatures from localStorage
  useEffect(() => {
    loadOfflineSignatures();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "Attempting to sync offline signatures...",
      });
      syncOfflineSignatures();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "Signatures will be saved offline and synced when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && offlineSignatures.some(sig => !sig.synced)) {
      syncOfflineSignatures();
    }
  }, [isOnline, offlineSignatures]);

  const loadOfflineSignatures = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const signatures: OfflineSignature[] = JSON.parse(stored);
        // Filter out expired signatures (older than grace period)
        const validSignatures = signatures.filter(
          sig => Date.now() - sig.timestamp <= GRACE_PERIOD_MS
        );
        setOfflineSignatures(validSignatures);
        
        // Update localStorage if we filtered out expired signatures
        if (validSignatures.length !== signatures.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validSignatures));
        }
      }
    } catch (error) {
      console.error('Error loading offline signatures:', error);
    }
  };

  const saveOfflineSignature = useCallback((
    appraisalId: string,
    signatureData: string,
    role: string
  ): string => {
    const signature: OfflineSignature = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      appraisalId,
      signatureData,
      timestamp: Date.now(),
      role,
      synced: false
    };

    const updatedSignatures = [...offlineSignatures, signature];
    setOfflineSignatures(updatedSignatures);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSignatures));
      
      toast({
        title: "Signature Saved Offline",
        description: "Your signature has been saved and will sync when connection is restored.",
      });
    } catch (error) {
      console.error('Error saving offline signature:', error);
      toast({
        title: "Storage Error",
        description: "Failed to save signature offline. Please ensure you have sufficient storage space.",
        variant: "destructive",
      });
    }

    return signature.id;
  }, [offlineSignatures, toast]);

  const syncOfflineSignatures = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    
    const unsyncedSignatures = offlineSignatures.filter(sig => !sig.synced);
    if (unsyncedSignatures.length === 0) return;

    setIsSyncing(true);

    try {
      const syncPromises = unsyncedSignatures.map(async (signature) => {
        try {
          // Import supabase dynamically to avoid issues if offline
          const { supabase } = await import('@/integrations/supabase/client');
          
          const { error } = await supabase
            .from('signatures')
            .insert({
              appraisal_id: signature.appraisalId,
              user_id: (await supabase.auth.getUser()).data.user?.id || '',
              signature_data: signature.signatureData,
              role: signature.role,
              created_at: new Date(signature.timestamp).toISOString(),
              ip_address: window.location.hostname,
              user_agent: navigator.userAgent
            });

          if (error) throw error;

          return { ...signature, synced: true };
        } catch (error) {
          console.error(`Failed to sync signature ${signature.id}:`, error);
          return signature; // Keep unsynced
        }
      });

      const results = await Promise.all(syncPromises);
      const syncedCount = results.filter(sig => sig.synced).length;
      
      // Update signatures with sync status
      const updatedSignatures = offlineSignatures.map(sig => {
        const result = results.find(r => r.id === sig.id);
        return result || sig;
      });

      setOfflineSignatures(updatedSignatures);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSignatures));

      if (syncedCount > 0) {
        toast({
          title: "Signatures Synced",
          description: `Successfully synced ${syncedCount} offline signature(s).`,
        });
        
        // Remove synced signatures after a delay
        setTimeout(() => {
          const remainingSignatures = updatedSignatures.filter(sig => !sig.synced);
          setOfflineSignatures(remainingSignatures);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingSignatures));
        }, 5000);
      }

      if (syncedCount < unsyncedSignatures.length) {
        toast({
          title: "Partial Sync",
          description: `${syncedCount}/${unsyncedSignatures.length} signatures synced. Retrying failed signatures...`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing offline signatures:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline signatures. Will retry automatically.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [offlineSignatures, isOnline, isSyncing, toast]);

  const clearOfflineSignatures = useCallback(() => {
    setOfflineSignatures([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getSignatureStatus = useCallback((appraisalId: string, role: string) => {
    const signature = offlineSignatures.find(
      sig => sig.appraisalId === appraisalId && sig.role === role
    );
    
    if (!signature) return null;
    
    return {
      id: signature.id,
      timestamp: signature.timestamp,
      synced: signature.synced,
      isExpired: Date.now() - signature.timestamp > GRACE_PERIOD_MS
    };
  }, [offlineSignatures]);

  return {
    isOnline,
    isSyncing,
    offlineSignatures: offlineSignatures.filter(sig => !sig.synced),
    saveOfflineSignature,
    syncOfflineSignatures,
    clearOfflineSignatures,
    getSignatureStatus,
    hasUnsyncedSignatures: offlineSignatures.some(sig => !sig.synced)
  };
}