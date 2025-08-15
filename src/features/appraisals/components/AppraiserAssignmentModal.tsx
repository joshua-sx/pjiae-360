import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, Mail, Building, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "./types";

interface AppraiserAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onAssignmentComplete?: () => void;
}

// Mock data for potential appraisers
const mockAppraisers: Employee[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com", 
    department: "Engineering",
    position: "Senior Engineering Manager"
  },
  {
    id: "2", 
    name: "Mike Chen",
    email: "mike.chen@company.com",
    department: "Product",
    position: "Product Director"
  },
  {
    id: "3",
    name: "Lisa Rodriguez", 
    email: "lisa.rodriguez@company.com",
    department: "Engineering",
    position: "Principal Engineer"
  },
  {
    id: "4",
    name: "David Park",
    email: "david.park@company.com", 
    department: "Design",
    position: "Design Manager"
  }
];

export function AppraiserAssignmentModal({ 
  open, 
  onOpenChange, 
  employee, 
  onAssignmentComplete 
}: AppraiserAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppraisers, setSelectedAppraisers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter appraisers based on search term
  const filteredAppraisers = useMemo(() => {
    return mockAppraisers.filter(appraiser =>
      appraiser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraiser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraiser.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraiser.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAppraiserToggle = (appraiserId: string) => {
    setSelectedAppraisers(prev =>
      prev.includes(appraiserId)
        ? prev.filter(id => id !== appraiserId)
        : [...prev, appraiserId]
    );
  };

  const handleAssignment = async () => {
    if (selectedAppraisers.length === 0) {
      toast({
        title: "No appraisers selected",
        description: "Please select at least one appraiser before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Appraisers assigned successfully",
        description: `${selectedAppraisers.length} appraiser(s) have been assigned to ${employee.name}.`
      });
      
      onAssignmentComplete?.();
      onOpenChange(false);
      setSelectedAppraisers([]);
      setSearchTerm("");
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: "Failed to assign appraisers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedAppraisers([]);
    setSearchTerm("");
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Assign Appraisers for {employee?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={employee?.avatar} />
                  <AvatarFallback>{getInitials(employee?.name || "")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{employee?.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee?.position}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building className="w-3 h-3" />
                    {employee?.department}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search appraisers by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected Count */}
          {selectedAppraisers.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">
                {selectedAppraisers.length} appraiser(s) selected
              </span>
            </div>
          )}

          {/* Appraisers List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredAppraisers.map((appraiser) => (
                <Card 
                  key={appraiser.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedAppraisers.includes(appraiser.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleAppraiserToggle(appraiser.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedAppraisers.includes(appraiser.id)}
                        onChange={() => handleAppraiserToggle(appraiser.id)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={appraiser.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(appraiser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{appraiser.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {appraiser.department}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {appraiser.position}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {appraiser.email}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAppraisers.length === 0 && searchTerm && (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No appraisers found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignment} 
            disabled={selectedAppraisers.length === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Assign {selectedAppraisers.length} Appraiser{selectedAppraisers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}