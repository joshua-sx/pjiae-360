
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Plus, UserPlus, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ManualUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddManuallyCardProps {
  uploadMethod: 'upload' | 'manual' | null;
  onMethodChange: () => void;
  manualUsers: ManualUser[];
}

export default function AddManuallyCard({ uploadMethod, onMethodChange, manualUsers }: AddManuallyCardProps) {
  const isSelected = uploadMethod === 'manual';
  const hasUsers = manualUsers.length > 0;
  const isDisabled = uploadMethod === 'upload'; // Disabled when CSV is uploaded
  
  if (hasUsers) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-primary-foreground/30"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="60s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-primary-foreground" aria-hidden="true" />
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Team members added successfully!
          </h3>
          <p className="text-muted-foreground text-sm">
            Your team members have been added and are ready to use.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">
                  Added team members:
                </h4>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground">
                  {manualUsers.length}
                </div>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto mb-2">
                {manualUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="text-sm text-muted-foreground truncate">
                    {user.firstName} {user.lastName} ({user.email})
                  </div>
                ))}
                {manualUsers.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    +{manualUsers.length - 3} more
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700 font-medium">Ready to import</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={onMethodChange} variant="outline" className="w-full">
          + Add More
        </Button>
      </div>
    );
  }

  if (isDisabled) {
    return (
      <div className="space-y-4 opacity-50 pointer-events-none">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Add Manually
          </h3>
          <p className="text-muted-foreground text-sm">
            CSV file uploaded. Manual entry is disabled.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">
              Manual entry is not available when CSV is uploaded
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full" disabled>
          Add Person
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-muted-foreground/30"
                strokeWidth="2"
                strokeDasharray="4 4"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="60s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">
          Add Manually
        </h3>
        <p className="text-muted-foreground text-sm">
          Enter people one by one to build your team.
        </p>
      </div>

      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <div className="text-center py-4">
          <div className="text-sm text-muted-foreground mb-4">
            Ready to add team members manually
          </div>
          <Button
            onClick={onMethodChange}
            variant="default"
            className="gap-2"
            aria-label="Start adding team members manually"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Person
          </Button>
        </div>
      </div>
    </div>
  );
}
