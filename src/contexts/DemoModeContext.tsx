import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRole } from '@/hooks/usePermissions';
import { getRolePrefix } from '@/lib/utils';

interface DemoModeContextType {
  isDemoMode: boolean;
  demoRole: AppRole;
  isRoleSelectionModalOpen: boolean;
  toggleDemoMode: () => void;
  setDemoRole: (role: AppRole) => void;
  openRoleSelectionModal: () => void;
  closeRoleSelectionModal: () => void;
  availableRoles: AppRole[];
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

interface DemoModeProviderProps {
  children: ReactNode;
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('demo-mode') === 'true';
  });
  
  const [demoRole, setDemoRole] = useState<AppRole>(() => {
    return (localStorage.getItem('demo-role') as AppRole) || 'admin';
  });

  const [isRoleSelectionModalOpen, setIsRoleSelectionModalOpen] = useState<boolean>(false);

  const availableRoles: AppRole[] = ['admin', 'director', 'manager', 'supervisor', 'employee'];

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      const newValue = !prev;
      localStorage.setItem('demo-mode', newValue.toString());
      if (!newValue) {
        // Clear demo role when exiting demo mode
        localStorage.removeItem('demo-role');
        setIsRoleSelectionModalOpen(false);
      } else {
        // Open role selection modal when entering demo mode
        setIsRoleSelectionModalOpen(true);
      }
      return newValue;
    });
  };

  const handleSetDemoRole = (role: AppRole) => {
    setDemoRole(role);
    localStorage.setItem('demo-role', role);

    // Navigate to role-based dashboard when demo role changes
    const rolePrefix = getRolePrefix(role);
    navigate(`/${rolePrefix}/dashboard`, { replace: true });
  };

  const openRoleSelectionModal = () => {
    setIsRoleSelectionModalOpen(true);
  };

  const closeRoleSelectionModal = () => {
    setIsRoleSelectionModalOpen(false);
  };

  // Clear demo mode on app close/reload if needed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Optionally clear demo mode on page refresh
      // localStorage.removeItem('demo-mode');
      // localStorage.removeItem('demo-role');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const value: DemoModeContextType = {
    isDemoMode,
    demoRole,
    isRoleSelectionModalOpen,
    toggleDemoMode,
    setDemoRole: handleSetDemoRole,
    openRoleSelectionModal,
    closeRoleSelectionModal,
    availableRoles,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};