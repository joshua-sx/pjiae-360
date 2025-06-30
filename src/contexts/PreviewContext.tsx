import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole, ROLE_PERMISSIONS, RolePermissions } from '@/types/roles';

interface PreviewContextType {
  previewRole: UserRole | null;
  isInPreview: boolean;
  enterPreview: (role: UserRole) => void;
  exitPreview: () => void;
  getEffectiveRole: (actualRole: UserRole) => UserRole;
  getEffectivePermissions: (actualRole: UserRole) => RolePermissions;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [previewRole, setPreviewRole] = useState<UserRole | null>(() => {
    // Restore from sessionStorage on init
    const stored = sessionStorage.getItem('preview-role');
    return stored ? (stored as UserRole) : null;
  });

  const isInPreview = previewRole !== null;

  const enterPreview = useCallback((role: UserRole) => {
    setPreviewRole(role);
    sessionStorage.setItem('preview-role', role);
    console.log(`🔍 Preview mode started: ${role}`);
  }, []);

  const exitPreview = useCallback(() => {
    setPreviewRole(null);
    sessionStorage.removeItem('preview-role');
    console.log('🔍 Preview mode ended');
  }, []);

  const getEffectiveRole = useCallback((actualRole: UserRole): UserRole => {
    return previewRole || actualRole;
  }, [previewRole]);

  const getEffectivePermissions = useCallback((actualRole: UserRole): RolePermissions => {
    const effectiveRole = getEffectiveRole(actualRole);
    return ROLE_PERMISSIONS[effectiveRole];
  }, [getEffectiveRole]);

  // Clear preview on page refresh if needed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Keep preview across page reloads - comment out if you want to clear
      // sessionStorage.removeItem('preview-role');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const value: PreviewContextType = {
    previewRole,
    isInPreview,
    enterPreview,
    exitPreview,
    getEffectiveRole,
    getEffectivePermissions,
  };

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview(): PreviewContextType {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
}
