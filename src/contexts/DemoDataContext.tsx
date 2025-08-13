import React, { createContext, useContext, ReactNode } from 'react';
import { AppRole } from '@/hooks/usePermissions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import {
  generateDemoEmployees,
  generateDemoGoals,
  generateDemoAppraisals,
  generateDemoActivities,
  generateDemoOrganization,
  generateDemoDepartments,
  generateDemoDivisions,
  generateDemoOrgMetrics,
  generateDemoGoalMetrics,
  generateDemoAppraisalMetrics,
  generateDemoSystemHealth,
  generateDemoNotificationMetrics
} from '@/lib/demoData';

interface DemoDataContextType {
  getEmployees: () => any[];
  getGoals: () => any[];
  getAppraisals: () => any[];
  getActivities: () => any[];
  getOrganization: () => any;
  getDepartments: () => any[];
  getDivisions: () => any[];
  getOrgMetrics: () => any;
  getGoalMetrics: () => any;
  getAppraisalMetrics: () => any;
  getSystemHealth: () => any;
  getNotificationMetrics: () => any;
  isDemoMode: boolean;
}

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
}

interface DemoDataProviderProps {
  children: ReactNode;
}

export function DemoDataProvider({ children }: DemoDataProviderProps) {
  const { isDemoMode, demoRole } = useDemoMode();

  // Demo data getters that return memoized data
  const getEmployees = () => generateDemoEmployees(demoRole);
  const getGoals = () => generateDemoGoals(demoRole);
  const getAppraisals = () => generateDemoAppraisals(demoRole);
  const getActivities = () => generateDemoActivities(demoRole);
  const getOrganization = () => generateDemoOrganization();
  const getDepartments = () => generateDemoDepartments(demoRole);
  const getDivisions = () => generateDemoDivisions(demoRole);
  const getOrgMetrics = () => generateDemoOrgMetrics(demoRole);
  const getGoalMetrics = () => generateDemoGoalMetrics(demoRole);
  const getAppraisalMetrics = () => generateDemoAppraisalMetrics(demoRole);
  const getSystemHealth = () => generateDemoSystemHealth(demoRole);
  const getNotificationMetrics = () => generateDemoNotificationMetrics(demoRole);

  const value: DemoDataContextType = {
    getEmployees,
    getGoals,
    getAppraisals,
    getActivities,
    getOrganization,
    getDepartments,
    getDivisions,
    getOrgMetrics,
    getGoalMetrics,
    getAppraisalMetrics,
    getSystemHealth,
    getNotificationMetrics,
    isDemoMode,
  };

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}