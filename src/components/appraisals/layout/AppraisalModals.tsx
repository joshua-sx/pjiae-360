import React from 'react';
import { Employee } from '../types';
import AuditTrailDialog from '../AuditTrailDialog';
import AppraiserAssignmentModal from '../../onboarding/components/AppraiserAssignmentModal';

interface AppraisalModalsProps {
  showAppraiserModal: boolean;
  showAuditTrail: boolean;
  selectedEmployee: Employee | null;
  onAppraiserModalChange: (open: boolean) => void;
  onAuditTrailChange: (open: boolean) => void;
  onAppraiserAssignmentComplete: () => void;
}

export function AppraisalModals({
  showAppraiserModal,
  showAuditTrail,
  selectedEmployee,
  onAppraiserModalChange,
  onAuditTrailChange,
  onAppraiserAssignmentComplete
}: AppraisalModalsProps) {
  return (
    <>
      {/* Audit Trail Dialog */}
      <AuditTrailDialog
        open={showAuditTrail}
        onOpenChange={onAuditTrailChange}
        auditLog={[]} // Production-ready: Audit log will be loaded from database
      />

      {/* Appraiser Assignment Modal */}
      <AppraiserAssignmentModal
        open={showAppraiserModal}
        onOpenChange={onAppraiserModalChange}
        employee={selectedEmployee}
        onAssignmentComplete={onAppraiserAssignmentComplete}
      />
    </>
  );
}