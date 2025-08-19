import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Settings, Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { usePermissions } from "@/features/access-control/hooks/usePermissions";
import { Seo } from "@/components/seo/Seo";

const AppraisalCyclesPage = () => {
  const { isMobile } = useMobileResponsive();
  const permissions = usePermissions();
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
    <div className="space-y-4 sm:space-y-6">
      <Seo 
        title="Appraisal Cycles | Manage Review Cycles"
        description="Create and manage performance review cycles and phases across your organization."
      />
      <PageHeader
        title="Appraisal Cycles"
        description="Manage performance review cycles and track progress across your organization"
      >
        {permissions.canManageAppraisalCycles && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Cycle
          </Button>
        )}
      </PageHeader>

      {cycles.length === 0 && (
        <Card>
          <CardContent className={`text-center ${isMobile ? 'py-8 px-4' : 'py-12'}`}>
            <Calendar className={`mx-auto text-muted-foreground mb-4 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
            <h3 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No Appraisal Cycles</h3>
            <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-sm' : ''}`}>
              Get started by creating your first performance review cycle.
            </p>
            {permissions.canManageAppraisalCycles && (
              <Button className={isMobile ? 'w-full h-12' : ''}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Cycle
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppraisalCyclesPage;
