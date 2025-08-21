import { useDemoMode } from "@/contexts/DemoModeContext";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { PageContent } from "@/components/ui/page-content";
import MyAppraisalPage from "@/features/appraisals/pages/employee/MyAppraisalPage";

const PersonalAppraisalsPage = () => {
  const { isDemoMode } = useDemoMode();

  return (
    <PageContent>
      {isDemoMode && <DemoModeBanner />}
      <MyAppraisalPage />
    </PageContent>
  );
};

export default PersonalAppraisalsPage;