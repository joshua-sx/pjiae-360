
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus, Zap } from "lucide-react";
import { useOrgStructureTemplate } from "@/hooks/useOrgStructureTemplate";

interface EmptyOrgStateProps {
  onCreateManually: () => void;
}

export function EmptyOrgState({ onCreateManually }: EmptyOrgStateProps) {
  const { applyTemplate, isApplying } = useOrgStructureTemplate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="text-center space-y-2">
        <Building className="h-12 w-12 text-muted-foreground mx-auto" />
        <h3 className="text-lg font-semibold">No Organization Structure</h3>
        <p className="text-muted-foreground max-w-md">
          Get started by creating divisions and departments for your organization. You can use our template or create them manually.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => applyTemplate()}>
          <CardHeader className="text-center pb-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Use Template</CardTitle>
            <CardDescription className="text-sm">
              Quick start with a pre-built organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation();
                applyTemplate();
              }}
              disabled={isApplying}
            >
              {isApplying ? "Applying..." : "Apply Airport Template"}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onCreateManually}>
          <CardHeader className="text-center pb-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Create Manually</CardTitle>
            <CardDescription className="text-sm">
              Build your structure from scratch with full control
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" onClick={onCreateManually}>
              Start Creating
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
