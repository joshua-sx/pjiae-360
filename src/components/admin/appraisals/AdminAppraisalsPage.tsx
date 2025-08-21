import { useDemoMode } from '@/contexts/DemoModeContext';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import CycleListPage from '@/features/appraisals/pages/admin/CycleListPage';
import { DemoModeBanner } from '@/components/ui/demo-mode-banner';
import { PageContent } from '@/components/ui/page-content';

export default function AdminAppraisalsPage() {
  const { isDemoMode } = useDemoMode();
  const permissions = usePermissions();

  // Only show for admin role
  if (!permissions.isAdmin) {
    return (
      <PageContent>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied. Admin permissions required.</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      {isDemoMode && <DemoModeBanner />}
      <CycleListPage />
    </PageContent>
  );
}