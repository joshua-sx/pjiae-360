import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Edit2, Plus, X, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/useDepartments";
import { useDepartmentMutations } from "@/hooks/useDepartmentMutations";
import { useEmployeeCounts } from "@/hooks/useEmployeeCounts";
import { DeleteWithCascadeDialog } from "@/components/ui/delete-with-cascade-dialog";

const DepartmentTab = () => {
  const { departments, loading } = useDepartments();
  const { counts, loading: countsLoading } = useEmployeeCounts();
  const { createDepartment, updateDepartment, deleteDepartment, isCreating, isUpdating, isDeleting } = useDepartmentMutations();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });
  const { toast } = useToast();

  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    createDepartment({ name: newDepartmentName.trim() });
    setNewDepartmentName("");
    setShowAddForm(false);
  };

  const handleStartEdit = (department: any) => {
    setEditingId(department.id);
    setEditingName(department.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    updateDepartment({ id: editingId!, name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteClick = (department: any) => {
    setDeleteConfirm({
      open: true,
      id: department.id,
      name: department.name,
    });
  };

  const handleConfirmDelete = (handleEmployees: 'unassign' | 'block') => {
    if (handleEmployees === 'block') {
      const employeeCount = counts.departments[deleteConfirm.id] || 0;
      if (employeeCount > 0) {
        setDeleteConfirm({ open: false, id: "", name: "" });
        return;
      }
    }
    
    deleteDepartment({ id: deleteConfirm.id, handleEmployees });
    setDeleteConfirm({ open: false, id: "", name: "" });
  };

  const handleCancel = () => {
    setNewDepartmentName("");
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
        <h3 className="text-lg font-semibold">Departments ({departments.length})</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Department name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                className="flex-1"
              />
              <Button onClick={handleAddDepartment} size="sm">
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
        {departments.map((department) => (
          <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                {editingId === department.id ? (
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
                    <h4 className="font-semibold">{department.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Department</span>
                      {!countsLoading && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{counts.departments[department.id] || 0} employees</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {editingId !== department.id && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartEdit(department)}
                  disabled={isUpdating}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(department)}
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
        title="Delete Department"
        name={deleteConfirm.name}
        employeeCount={counts.departments[deleteConfirm.id] || 0}
        onConfirm={handleConfirmDelete}
        type="department"
      />
    </div>
  );
};

export default DepartmentTab;