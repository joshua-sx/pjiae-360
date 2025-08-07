import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AlertTriangle, Users } from "lucide-react";

interface DeleteWithCascadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  name: string;
  employeeCount: number;
  onConfirm: (handleEmployees: 'unassign' | 'block') => void;
  type: 'division' | 'department';
}

export function DeleteWithCascadeDialog({
  open,
  onOpenChange,
  title,
  name,
  employeeCount,
  onConfirm,
  type
}: DeleteWithCascadeDialogProps) {
  const [handleEmployees, setHandleEmployees] = useState<'unassign' | 'block'>('block');

  const handleConfirm = () => {
    onConfirm(handleEmployees);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to delete <strong>"{name}"</strong>?
            </p>
            
            {employeeCount > 0 && (
              <>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{employeeCount}</strong> employee{employeeCount !== 1 ? 's are' : ' is'} assigned to this {type}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">What should happen to assigned employees?</p>
                  <RadioGroup value={handleEmployees} onValueChange={(value: 'unassign' | 'block') => setHandleEmployees(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="block" id="block" />
                      <Label htmlFor="block" className="text-sm">
                        Cancel deletion (I'll reassign them first)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unassign" id="unassign" />
                      <Label htmlFor="unassign" className="text-sm">
                        Remove {type} assignment from employees
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            
            {employeeCount === 0 && (
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={employeeCount > 0 && handleEmployees === 'block' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
          >
            {employeeCount > 0 && handleEmployees === 'block' ? 'Keep ' + type.charAt(0).toUpperCase() + type.slice(1) : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}