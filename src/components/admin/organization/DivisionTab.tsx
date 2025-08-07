import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Edit2, Plus, X, Check, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDivisions } from "@/hooks/useDivisions";
import { useDivisionMutations } from "@/hooks/useDivisionMutations";
import { useEmployeeCounts } from "@/hooks/useEmployeeCounts";
import { DeleteWithCascadeDialog } from "@/components/ui/delete-with-cascade-dialog";

const DivisionTab = () => {
  const { divisions, loading } = useDivisions();
  const { counts, loading: countsLoading } = useEmployeeCounts();
  const { createDivision, updateDivision, deleteDivision, isCreating, isUpdating, isDeleting } = useDivisionMutations();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });
  const { toast } = useToast();

  const handleAddDivision = () => {
    if (!newDivisionName.trim()) {
      toast({
        title: "Error",
        description: "Division name is required",
        variant: "destructive",
      });
      return;
    }

    createDivision({ name: newDivisionName.trim() });
    setNewDivisionName("");
    setShowAddForm(false);
  };

  const handleStartEdit = (division: any) => {
    setEditingId(division.id);
    setEditingName(division.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Division name is required",
        variant: "destructive",
      });
      return;
    }

    updateDivision({ id: editingId!, name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteClick = (division: any) => {
    setDeleteConfirm({
      open: true,
      id: division.id,
      name: division.name,
    });
  };

  const handleConfirmDelete = (handleEmployees: 'unassign' | 'block') => {
    if (handleEmployees === 'block') {
      const employeeCount = counts.divisions[deleteConfirm.id] || 0;
      if (employeeCount > 0) {
        setDeleteConfirm({ open: false, id: "", name: "" });
        return;
      }
    }
    
    deleteDivision({ id: deleteConfirm.id, handleEmployees });
    setDeleteConfirm({ open: false, id: "", name: "" });
  };

  const handleCancel = () => {
    setNewDivisionName("");
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Divisions ({divisions.length})</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Division
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Division name"
                value={newDivisionName}
                onChange={(e) => setNewDivisionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDivision()}
                className="flex-1"
              />
              <Button onClick={handleAddDivision} size="sm">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {divisions.map((division) => (
          <div key={division.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                {editingId === division.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1"
                      disabled={isUpdating}
                    />
                    <Button onClick={handleSaveEdit} size="sm" disabled={isUpdating}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isUpdating}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold">{division.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Division</span>
                      {!countsLoading && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{counts.divisions[division.id] || 0} employees</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {editingId !== division.id && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartEdit(division)}
                  disabled={isUpdating}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(division)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <DeleteWithCascadeDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Delete Division"
        name={deleteConfirm.name}
        employeeCount={counts.divisions[deleteConfirm.id] || 0}
        onConfirm={handleConfirmDelete}
        type="division"
      />
    </div>
  );
};

export default DivisionTab;