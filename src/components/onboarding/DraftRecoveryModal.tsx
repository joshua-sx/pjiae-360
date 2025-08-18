import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Play, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DraftRecoveryModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  onClose: () => void;
  draftStep: number;
  lastSavedAt: string;
  totalSteps: number;
}

export const DraftRecoveryModal = ({
  isOpen,
  onResume,
  onStartFresh,
  onClose,
  draftStep,
  lastSavedAt,
  totalSteps
}: DraftRecoveryModalProps) => {
  const getTimeAgo = () => {
    try {
      if (!lastSavedAt || lastSavedAt.trim() === '') {
        return 'recently';
      }
      const date = new Date(lastSavedAt);
      if (isNaN(date.getTime())) {
        return 'recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn('Invalid date format for lastSavedAt:', lastSavedAt);
      return 'recently';
    }
  };

  const timeAgo = getTimeAgo();
  const progressPercentage = Math.round((draftStep / totalSteps) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Your Setup?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Incomplete Onboarding Found</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last saved {timeAgo}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progressPercentage}% complete</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Step {draftStep + 1} of {totalSteps}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={onResume} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Resume Setup
            </Button>
            <Button 
              onClick={onStartFresh} 
              variant="outline" 
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Start Fresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};