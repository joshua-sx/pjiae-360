// Public API for appraisals feature
export { default as AppraisalsPage } from './pages/AppraisalsPage';
export { default as EmployeeAppraisalFlow } from './components/EmployeeAppraisalFlow';
export { default as DigitalSignatureModal } from './components/DigitalSignatureModal';

// Hooks
export { useAppraisals } from './hooks/useAppraisals';
export { useAppraisalCRUD } from './hooks/useAppraisalCRUD';
export { useAppraisalFlow } from './hooks/useAppraisalFlow';
export { useAutoSave } from './hooks/useAutoSave';

// Components
export { SaveStatusIndicator } from './components/SaveStatusIndicator';
export { NotificationSystem } from './components/NotificationSystem';

// Types
export type { 
  Employee, 
  Goal, 
  Competency, 
  AppraisalData, 
  AuditLogEntry, 
  Step 
} from './types';
export type { Appraisal } from './hooks/useAppraisals';
export type { SaveStatus } from './components/SaveStatusIndicator';
export type { NotificationProps } from './components/NotificationSystem';

// Placeholder dashboard components
export function ManagerAppraisalsDashboard() {
  return null; // Placeholder - will be implemented later
}