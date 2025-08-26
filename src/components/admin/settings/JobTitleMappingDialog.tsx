import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { JobTitleMapping } from '@/hooks/useJobTitleMappings';
import type { AppRole } from '@/config/types';

interface JobTitleMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping?: JobTitleMapping | null;
  onSubmit: (data: Partial<JobTitleMapping>) => void;
  isLoading?: boolean;
}

const roleOptions: { value: AppRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'director', label: 'Director' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'employee', label: 'Employee' },
];

export function JobTitleMappingDialog({
  open,
  onOpenChange,
  mapping,
  onSubmit,
  isLoading = false,
}: JobTitleMappingDialogProps) {
  const [normalizedTitle, setNormalizedTitle] = useState('');
  const [role, setRole] = useState<AppRole>('employee');
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [newSynonym, setNewSynonym] = useState('');

  useEffect(() => {
    if (mapping) {
      setNormalizedTitle(mapping.normalized_title);
      setRole(mapping.role);
      setSynonyms(mapping.synonyms);
    } else {
      setNormalizedTitle('');
      setRole('employee');
      setSynonyms([]);
    }
    setNewSynonym('');
  }, [mapping, open]);

  const handleAddSynonym = () => {
    if (newSynonym.trim() && !synonyms.includes(newSynonym.trim())) {
      setSynonyms([...synonyms, newSynonym.trim()]);
      setNewSynonym('');
    }
  };

  const handleRemoveSynonym = (synonymToRemove: string) => {
    setSynonyms(synonyms.filter(synonym => synonym !== synonymToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedTitle.trim()) return;

    onSubmit({
      normalized_title: normalizedTitle.trim().toLowerCase(),
      role,
      synonyms,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSynonym.trim()) {
      e.preventDefault();
      handleAddSynonym();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mapping ? 'Edit Job Title Mapping' : 'Create Job Title Mapping'}
          </DialogTitle>
          <DialogDescription>
            Configure how a job title should be mapped to an organizational role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="normalized-title">Job Title</Label>
            <Input
              id="normalized-title"
              value={normalizedTitle}
              onChange={(e) => setNormalizedTitle(e.target.value)}
              placeholder="e.g., software engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: AppRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Synonyms</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newSynonym}
                  onChange={(e) => setNewSynonym(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add synonym..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSynonym}
                  disabled={!newSynonym.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {synonyms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {synonyms.map((synonym) => (
                    <Badge key={synonym} variant="secondary" className="gap-1">
                      {synonym}
                      <button
                        type="button"
                        onClick={() => handleRemoveSynonym(synonym)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <LoadingButton 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              isLoading={isLoading}
            >
              Cancel
            </LoadingButton>
            <LoadingButton 
              type="submit" 
              isLoading={isLoading}
              disabled={!normalizedTitle.trim()}
              loadingText="Saving..."
            >
              {mapping ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}