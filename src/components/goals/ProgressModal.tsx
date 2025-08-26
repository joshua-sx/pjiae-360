import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDemoGoalStore } from '@/stores/demoGoalStore';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

interface ProgressModalProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgressModal({ goalId, open, onOpenChange }: ProgressModalProps) {
  const { user } = useAuth();
  const notifications = useNotifications();
  const { addProgress } = useDemoGoalStore();
  const [note, setNote] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!note.trim()) {
      notifications.error('Please enter a progress note.');
      return;
    }
    
    if (!user?.user_metadata?.full_name) {
      notifications.error('User information not available.');
      return;
    }

    setIsLoading(true);
    try {
      await addProgress(goalId, note.trim(), user.user_metadata.full_name);
      notifications.success('Progress update added successfully.');
      setNote('');
      onOpenChange(false);
    } catch (error) {
      notifications.error('Failed to add progress update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNote('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Progress Update</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="progress-note">Progress Note</Label>
            <Textarea
              id="progress-note"
              placeholder="Describe your progress, achievements, challenges, or next steps..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !note.trim()}
            >
              {isLoading ? 'Adding...' : 'Add Progress'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}