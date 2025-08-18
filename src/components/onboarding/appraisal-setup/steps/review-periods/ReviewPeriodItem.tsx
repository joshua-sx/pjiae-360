import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface ReviewPeriodItemProps {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  onEdit: (id: string, updatedPeriod: { name: string; startDate: Date; endDate: Date }) => void;
  onDelete: (id: string) => void;
}

export const ReviewPeriodItem = ({ 
  id, 
  title, 
  startDate, 
  endDate, 
  durationDays, 
  onEdit, 
  onDelete 
}: ReviewPeriodItemProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; startDate: string; endDate: string; duration: string }>({
    name: '',
    startDate: '',
    endDate: '',
    duration: ''
  });

  const handleEdit = () => {
    setEditingId(id);
    setEditForm({
      name: title,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      duration: durationDays.toString()
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const newStartDate = new Date(editForm.startDate);
    const newEndDate = new Date(editForm.endDate);

    if (newStartDate >= newEndDate) {
      return;
    }

    onEdit(editingId, {
      name: editForm.name,
      startDate: newStartDate,
      endDate: newEndDate
    });

    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', startDate: '', endDate: '', duration: '' });
  };

  const handleDurationChange = (duration: string) => {
    setEditForm(prev => ({ ...prev, duration }));
    
    if (editForm.startDate && duration) {
      const newEndDate = new Date(editForm.startDate);
      newEndDate.setDate(newEndDate.getDate() + parseInt(duration) - 1);
      setEditForm(prev => ({ 
        ...prev, 
        endDate: format(newEndDate, 'yyyy-MM-dd'),
        duration 
      }));
    }
  };

  if (editingId === id) {
    return (
      <div className="p-4 space-y-3">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Period Name</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter period name"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={editForm.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  setEditForm(prev => ({ ...prev, startDate: newStartDate }));
                  
                  // Recalculate end date if duration is set
                  if (editForm.duration && newStartDate) {
                    const endDate = new Date(newStartDate);
                    endDate.setDate(endDate.getDate() + parseInt(editForm.duration) - 1);
                    setEditForm(prev => ({ 
                      ...prev, 
                      endDate: format(endDate, 'yyyy-MM-dd'),
                      startDate: newStartDate
                    }));
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (days)</label>
              <Input
                type="number"
                min="1"
                value={editForm.duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} size="sm">
              Save Changes
            </Button>
            <Button onClick={handleCancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{title}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {startDate.toLocaleDateString()}
            </span>
            <span>to</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {endDate.toLocaleDateString()}
            </span>
            <Badge variant="outline">
              {durationDays} days
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};