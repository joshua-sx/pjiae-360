import { Card, CardContent } from "@/components/ui/card";

interface CompetencyCriteria {
  enabled: boolean;
  scoringSystem: string;
}

interface Notifications {
  enabled: boolean;
}

interface ConfigurationSummaryProps {
  frequency: "annual" | "bi-annual";
  startDate: string;
  visibility: boolean;
  competencyCriteria: CompetencyCriteria;
  notifications: Notifications;
}

export const ConfigurationSummary = ({ 
  frequency, 
  startDate, 
  visibility, 
  competencyCriteria, 
  notifications 
}: ConfigurationSummaryProps) => {
  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="space-y-2">
        <h3 className="font-medium text-blue-900">Configuration Summary</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Review Frequency: {frequency === "annual" ? "Annual" : "Bi-Annual"}</p>
          <p>• Start Date: {startDate ? new Date(startDate).toLocaleDateString() : 'Not selected'}</p>
          <p>• Visibility: {visibility ? 'Visible to employees' : 'Admin only'}</p>
          <p>• Competency Evaluation: {competencyCriteria.enabled ? "Enabled" : "Disabled"}</p>
          {competencyCriteria.enabled && (
            <p>• Scoring System: {competencyCriteria.scoringSystem}</p>
          )}
          <p>• Notifications: {notifications.enabled ? "Enabled" : "Disabled"}</p>
        </div>
      </div>
    </Card>
  );
};