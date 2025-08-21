
import { useDemoMode } from "@/contexts/DemoModeContext";
import { usePermissions } from "@/features/access-control/hooks/usePermissions";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { PageContent } from "@/components/ui/page-content";
import ManagerReviewPage from "@/features/appraisals/pages/manager/ManagerReviewPage";

const TeamAppraisalsPage = () => {
  const permissions = usePermissions();
  const { isDemoMode } = useDemoMode();

  return (
    <PageContent>
      {isDemoMode && <DemoModeBanner />}
      <ManagerReviewPage />
    </PageContent>
  );
};

export default TeamAppraisalsPage;
