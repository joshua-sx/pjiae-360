// Public API for appraisals feature
export { default as AppraisalsPage } from './pages/AppraisalsPage';
export { default as EmployeeAppraisalFlow } from './components/EmployeeAppraisalFlow';
export { default as DigitalSignatureModal } from './components/DigitalSignatureModal';

// Hooks
export { useAppraisals } from './hooks/useAppraisals';
export { useAppraisalCRUD } from './hooks/useAppraisalCRUD';
export { useAppraisalFlow } from './hooks/useAppraisalFlow';
export { useAutoSave } from './hooks/useAutoSave';

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