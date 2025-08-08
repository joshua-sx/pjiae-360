import React, { useEffect, useState } from 'react';
import { Employee, AuditLogEntry } from '../types';
import AuditTrailDialog from '../AuditTrailDialog';
import { AppraiserAssignmentModal } from '../AppraiserAssignmentModal';
import { useAppraisalCRUD } from '@/hooks/useAppraisalCRUD';

interface AppraisalModalsProps {
  showAppraiserModal: boolean;
  showAuditTrail: boolean;
  selectedEmployee: Employee | null;
  appraisalId?: string | null;
  onAppraiserModalChange: (open: boolean) => void;
  onAuditTrailChange: (open: boolean) => void;
  onAppraiserAssignmentComplete: () => void;
}

export function AppraisalModals({
  showAppraiserModal,
  showAuditTrail,
  selectedEmployee,
  appraisalId,
  onAppraiserModalChange,
  onAuditTrailChange,
  onAppraiserAssignmentComplete
}: AppraisalModalsProps) {
  const { fetchAuditLog } = useAppraisalCRUD();
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    if (showAuditTrail && appraisalId) {
      fetchAuditLog(appraisalId)
        .then(setAuditLog)
        .catch(err => console.error('Failed to load audit log', err));
    }
  }, [showAuditTrail, appraisalId, fetchAuditLog]);

  return (
    <>
      {/* Audit Trail Dialog */}
      <AuditTrailDialog
        open={showAuditTrail}
        onOpenChange={onAuditTrailChange}
        auditLog={auditLog}
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