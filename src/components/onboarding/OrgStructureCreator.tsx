
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle } from "lucide-react";
import { useOrgStructureFromOnboarding } from "@/hooks/useOrgStructureFromOnboarding";

interface OrgStructureCreatorProps {
  peopleData: Array<{
    division?: string;
    department?: string;
  }>;
  onComplete?: () => void;
}

export function OrgStructureCreator({ peopleData, onComplete }: OrgStructureCreatorProps) {
  const { createFromData, isCreating } = useOrgStructureFromOnboarding();

  const handleCreate = () => {
    createFromData(
      { peopleData },
      {
        onSuccess: () => {
          onComplete?.();
        }
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Create Organization Structure</CardTitle>
            <CardDescription>
              We detected divisions and departments in your employee data. Create them automatically?
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Ready to create organizational structure from your data
          </span>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
        
        <Button 
          onClick={handleCreate} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating Structure..." : "Create Organization Structure"}
        </Button>
      </CardContent>
    </Card>
  );
}
