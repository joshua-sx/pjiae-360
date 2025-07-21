
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppRole } from '@/hooks/usePermissions';

interface RoleMimickingContextType {
  mimickedRole: AppRole | null;
  originalRole: AppRole | null;
  isMimicking: boolean;
  switchToRole: (role: AppRole) => void;
  resetToOriginalRole: () => void;
  setOriginalRole: (role: AppRole) => void;
}

const RoleMimickingContext = createContext<RoleMimickingContextType | undefined>(undefined);

export function useRoleMimicking() {
  const context = useContext(RoleMimickingContext);
  if (!context) {
    throw new Error('useRoleMimicking must be used within a RoleMimickingProvider');
  }
  return context;
}

interface RoleMimickingProviderProps {
  children: React.ReactNode;
}

export function RoleMimickingProvider({ children }: RoleMimickingProviderProps) {
  const [mimickedRole, setMimickedRole] = useState<AppRole | null>(null);
  const [originalRole, setOriginalRole] = useState<AppRole | null>(null);

  const isMimicking = mimickedRole !== null && mimickedRole !== originalRole;

  const switchToRole = (role: AppRole) => {
    setMimickedRole(role);
    // Store in sessionStorage for persistence during the session
    sessionStorage.setItem('mimickedRole', role);
  };

  const resetToOriginalRole = () => {
    setMimickedRole(null);
    sessionStorage.removeItem('mimickedRole');
  };

  // Restore mimicked role from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('mimickedRole');
    if (stored && originalRole) {
      setMimickedRole(stored as AppRole);
    }
  }, [originalRole]);

  return (
    <RoleMimickingContext.Provider
      value={{
        mimickedRole,
        originalRole,
        isMimicking,
        switchToRole,
        resetToOriginalRole,
        setOriginalRole,
      }}
    >
      {children}
    </RoleMimickingContext.Provider>
  );
}
