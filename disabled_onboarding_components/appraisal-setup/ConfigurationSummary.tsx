import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Configuration Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[
            { label: "Review Frequency", value: frequency === "annual" ? "Annual" : "Bi-Annual" },
            { label: "Start Date", value: startDate ? new Date(startDate).toLocaleDateString() : 'Not selected' },
            { label: "Visibility", value: visibility ? 'Visible to employees' : 'Admin only' },
            { label: "Competency Evaluation", value: competencyCriteria.enabled ? "Enabled" : "Disabled" },
            ...(competencyCriteria.enabled ? [{ label: "Scoring System", value: competencyCriteria.scoringSystem }] : []),
            { label: "Notifications", value: notifications.enabled ? "Enabled" : "Disabled" }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <p className="text-slate-700 text-sm">
                <span className="font-medium">{item.label}:</span> {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};