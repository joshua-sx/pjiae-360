import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDemoAppraisalStore } from '@/stores/demoAppraisalStore';

interface CycleActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleId: string | null;
  actionType: 'activate' | 'close' | null;
  onConfirm: () => void;
}

export function CycleActivationDialog({
  open,
  onOpenChange,
  cycleId,
  actionType,
  onConfirm,
}: CycleActivationDialogProps) {
  const { cycles } = useDemoAppraisalStore();
  const cycle = cycleId ? cycles.find(c => c.id === cycleId) : null;

  if (!cycle || !actionType) return null;

  const isActivating = actionType === 'activate';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActivating ? 'Activate' : 'Close'} Appraisal Cycle
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActivating ? (
              <>
                Are you sure you want to activate "{cycle.name}"? This will:
                <br />
                • Make the cycle available to employees for self-assessment
                <br />
                • Send notifications to all participants
                <br />
                • Start the review process
              </>
            ) : (
              <>
                Are you sure you want to close "{cycle.name}"? This will:
                <br />
                • Prevent further changes to appraisals
                <br />
                • Finalize all reviews in this cycle
                <br />
                • Make results available for reporting
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isActivating ? 'Activate Cycle' : 'Close Cycle'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}