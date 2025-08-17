import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../OnboardingTypes";
import { Building, Globe, Calendar } from "lucide-react";

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Real Estate", "Consulting", "Non-profit", "Government", "Other"
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", 
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo"
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

export function OrgProfileStep({ data, onDataChange, onNext, onBack }: OnboardingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.orgProfile?.industry) {
      newErrors.industry = "Industry is required";
    }
    if (!data.orgProfile?.companySize) {
      newErrors.companySize = "Company size is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  const updateOrgProfile = (updates: Partial<typeof data.orgProfile>) => {
    onDataChange({
      orgProfile: {
        ...data.orgProfile,
        ...updates
      }
    });
    // Clear related errors
    if (errors.industry && updates.industry) {
      setErrors(prev => ({ ...prev, industry: '' }));
    }
    if (errors.companySize && updates.companySize) {
      setErrors(prev => ({ ...prev, companySize: '' }));
    }
  };

  const updateWorkWeek = (day: string, checked: boolean) => {
    updateOrgProfile({
      workWeek: {
        ...data.orgProfile?.workWeek,
        [day]: checked
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <Building className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-3xl font-bold">Organization Profile</h2>
        <p className="text-muted-foreground">
          Tell us more about your organization to customize your experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Details
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select value={data.orgProfile?.industry || ""} onValueChange={(value) => updateOrgProfile({ industry: value })}>
                <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry}</p>}
            </div>

            <div>
              <Label htmlFor="companySize">Company Size *</Label>
              <Select value={data.orgProfile?.companySize || ""} onValueChange={(value) => updateOrgProfile({ companySize: value as any })}>
                <SelectTrigger className={errors.companySize ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
              {errors.companySize && <p className="text-sm text-destructive mt-1">{errors.companySize}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Configure locale and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={data.orgProfile?.timezone || "UTC"} onValueChange={(value) => updateOrgProfile({ timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={data.orgProfile?.currency || "USD"} onValueChange={(value) => updateOrgProfile({ currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="locale">Locale</Label>
              <Input
                value={data.orgProfile?.locale || "en-US"}
                onChange={(e) => updateOrgProfile({ locale: e.target.value })}
                placeholder="e.g., en-US, fr-FR"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Work Schedule & Calendar
            </CardTitle>
            <CardDescription>
              Define your organization's work week and calendar settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Work Week</Label>
              <p className="text-sm text-muted-foreground mb-3">Select the days your organization typically works</p>
              <div className="flex flex-wrap gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={data.orgProfile?.workWeek?.[day as keyof typeof data.orgProfile.workWeek] ?? (day !== 'saturday' && day !== 'sunday')}
                      onCheckedChange={(checked) => updateWorkWeek(day, !!checked)}
                    />
                    <Label htmlFor={day} className="capitalize">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
                <Input
                  type="date"
                  value={data.orgProfile?.fiscalYearStart || "2024-01-01"}
                  onChange={(e) => updateOrgProfile({ fiscalYearStart: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Continue
        </Button>
      </div>
    </div>
  );
}