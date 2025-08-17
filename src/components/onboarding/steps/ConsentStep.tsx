import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OnboardingStepProps } from "../OnboardingTypes";
import { Shield, Database, Mail, BarChart3 } from "lucide-react";

export function ConsentStep({ data, onDataChange, onNext, onBack }: OnboardingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.consents?.dataProcessing) {
      newErrors.dataProcessing = "You must consent to data processing to continue";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Record acceptance timestamp
    onDataChange({
      consents: {
        ...data.consents,
        acceptedAt: new Date().toISOString()
      }
    });

    onNext();
  };

  const updateConsent = (type: keyof NonNullable<typeof data.consents>, value: boolean) => {
    onDataChange({
      consents: {
        ...data.consents,
        [type]: value
      }
    });
    
    if (errors[type] && value) {
      setErrors(prev => ({ ...prev, [type]: '' }));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <Shield className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-3xl font-bold">Privacy & Consent</h2>
        <p className="text-muted-foreground">
          Please review and accept our data processing and communication preferences
        </p>
      </div>

      <div className="space-y-4">
        <Card className={errors.dataProcessing ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Processing (Required)
            </CardTitle>
            <CardDescription>
              We need your consent to process employee data for performance management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataProcessing"
                checked={data.consents?.dataProcessing || false}
                onCheckedChange={(checked) => updateConsent('dataProcessing', !!checked)}
                className={errors.dataProcessing ? "border-destructive" : ""}
              />
              <div className="space-y-1">
                <Label htmlFor="dataProcessing" className="text-sm font-medium">
                  I consent to the processing of employee data for performance management purposes
                </Label>
                <p className="text-xs text-muted-foreground">
                  This includes storing, analyzing, and reporting on employee performance data, 
                  goals, and appraisals. Data will be processed in accordance with our Privacy Policy.
                </p>
                {errors.dataProcessing && (
                  <p className="text-sm text-destructive">{errors.dataProcessing}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communications (Optional)
            </CardTitle>
            <CardDescription>
              Receive system notifications and updates about your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="communications"
                checked={data.consents?.communications || false}
                onCheckedChange={(checked) => updateConsent('communications', !!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="communications" className="text-sm font-medium">
                  Send me system notifications and platform updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive emails about important system updates, deadline reminders, 
                  and new feature announcements. You can unsubscribe at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics (Optional)
            </CardTitle>
            <CardDescription>
              Help us improve the platform with anonymized usage data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="analytics"
                checked={data.consents?.analytics || false}
                onCheckedChange={(checked) => updateConsent('analytics', !!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="analytics" className="text-sm font-medium">
                  Share anonymized usage data to help improve the platform
                </Label>
                <p className="text-xs text-muted-foreground">
                  We collect anonymized data about how features are used to improve 
                  the platform. No personal or sensitive business data is included.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          By proceeding, you acknowledge that you have read and understood our{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
          You can modify these preferences at any time in your account settings.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Accept & Continue
        </Button>
      </div>
    </div>
  );
}