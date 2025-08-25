import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import AppraiserAssignmentForm from "@/features/appraisals/components/AppraiserAssignmentForm";

interface Employee {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  division?: string;
  avatar_url?: string;
}

interface SuggestedAppraiser {
  appraiser_id: string;
  appraiser_name: string;
  appraiser_role: string;
  hierarchy_level: number;
}

interface AppraiserAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onAssignmentComplete: () => void;
}

export default function AppraiserAssignmentModal({
  open,
  onOpenChange,
  employee,
  onAssignmentComplete
}: AppraiserAssignmentModalProps) {
  const handleAssignmentComplete = () => {
    onAssignmentComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assign Appraisers for {employee?.name}
          </DialogTitle>
        </DialogHeader>

        <AppraiserAssignmentForm
          employee={employee}
          appraisalId={null} // Modal doesn't have appraisal context
          onAssignmentComplete={handleAssignmentComplete}
        />
      </DialogContent>
    </Dialog>
  );
}