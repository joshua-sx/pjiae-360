import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps } from "../OnboardingTypes";
import { User, Mail, Phone } from "lucide-react";

export function EnhancedAdminInfoStep({ data, onDataChange, onNext, onBack }: OnboardingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.adminInfo?.name?.trim()) {
      newErrors.name = "Name is required";
    }
    if (!data.adminInfo?.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminInfo.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!data.adminInfo?.jobTitle?.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  const updateAdminInfo = (updates: Partial<typeof data.adminInfo>) => {
    onDataChange({
      adminInfo: {
        ...data.adminInfo,
        ...updates
      }
    });
    
    // Clear related errors
    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: '' }));
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <User className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-3xl font-bold">Administrator Information</h2>
        <p className="text-muted-foreground">
          Set up your admin profile and contact preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your details as the system administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="adminName">Full Name *</Label>
            <Input
              id="adminName"
              value={data.adminInfo?.name || ""}
              onChange={(e) => updateAdminInfo({ name: e.target.value })}
              placeholder="Enter your full name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="adminEmail">Email Address *</Label>
            <Input
              id="adminEmail"
              type="email"
              value={data.adminInfo?.email || ""}
              onChange={(e) => updateAdminInfo({ email: e.target.value })}
              placeholder="admin@company.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="adminJobTitle">Job Title *</Label>
            <Input
              id="adminJobTitle"
              value={data.adminInfo?.jobTitle || ""}
              onChange={(e) => updateAdminInfo({ jobTitle: e.target.value })}
              placeholder="e.g., HR Director, Chief People Officer"
              className={errors.jobTitle ? "border-destructive" : ""}
            />
            {errors.jobTitle && <p className="text-sm text-destructive mt-1">{errors.jobTitle}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Optional contact details and communication preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="adminPhone">Phone Number</Label>
            <Input
              id="adminPhone"
              type="tel"
              value={data.adminInfo?.phoneNumber || ""}
              onChange={(e) => updateAdminInfo({ phoneNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="preferredCommunication">Preferred Communication Method</Label>
            <Select 
              value={data.adminInfo?.preferredCommunication || "email"} 
              onValueChange={(value) => updateAdminInfo({ preferredCommunication: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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