
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Settings, Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const AppraisalCyclesPage = () => {
  // Production-ready: cycles will be loaded from database
  const cycles: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appraisal Cycles"
        description="Manage performance review cycles and track progress across your organization"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Cycle
        </Button>
      </PageHeader>

      {cycles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appraisal Cycles</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first performance review cycle.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Cycle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppraisalCyclesPage;
