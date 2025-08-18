
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Pencil } from "lucide-react";
import { CycleData } from "../../types";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface GoalWindowsListProps {
  goalSettingWindows: CycleData['goalSettingWindows'];
  reviewPeriods: CycleData['reviewPeriods'];
  onRemove: (id: string) => void;
  onEdit: (id: string, updatedWindow: { name: string; startDate: Date; endDate: Date }) => void;
}

export const GoalWindowsList = ({ goalSettingWindows, reviewPeriods, onRemove, onEdit }: GoalWindowsListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; startDate: string; endDate: string }>({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleRemove = (id: string) => {
    // Check if any review periods depend on this window
    const dependentPeriods = reviewPeriods.filter(period => period.goalWindowId === id);
    if (dependentPeriods.length > 0) {
      toast.error(`Cannot remove window. It's linked to ${dependentPeriods.length} review period(s)`);
      return;
    }

    onRemove(id);
    toast.success("Goal setting window removed");
  };

  const handleEdit = (window: CycleData['goalSettingWindows'][0]) => {
    setEditingId(window.id);
    setEditForm({
      name: window.name,
      startDate: format(window.startDate, 'yyyy-MM-dd'),
      endDate: format(window.endDate, 'yyyy-MM-dd')
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const startDate = new Date(editForm.startDate);
    const endDate = new Date(editForm.endDate);

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    onEdit(editingId, {
      name: editForm.name,
      startDate,
      endDate
    });

    setEditingId(null);
    toast.success("Goal setting window updated");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', startDate: '', endDate: '' });
  };

  if (goalSettingWindows.length === 0) {
    return null;
  }

  return (
    <div className="divide-y">
      {goalSettingWindows.map((window) => (
        <div key={window.id} className="p-4 space-y-3">
              {editingId === window.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Window Name</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter window name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
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
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{window.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {window.startDate.toLocaleDateString()}
                      </span>
                      <span>to</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {window.endDate.toLocaleDateString()}
                      </span>
                      <Badge variant="outline">
                        {Math.ceil((window.endDate.getTime() - window.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(window)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(window.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
        </div>
      ))}
    </div>
  );
};
