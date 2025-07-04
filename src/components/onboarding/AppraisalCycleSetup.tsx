"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Info, ArrowLeft, CheckCircle, Loader2, Mail, Calendar, Edit, ChevronDown, Plus, Trash, HelpCircle, Clock, Target, Settings, Bell, FileText, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { OnboardingData } from "./OnboardingTypes";
import OnboardingStepLayout from "./components/OnboardingStepLayout";

interface AppraisalCycleSetupProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Competency {
  name: string;
  description: string;
  optional?: boolean;
  applicable?: boolean;
}

interface CycleData {
  frequency: "annual" | "bi-annual";
  cycleName: string;
  goalSettingWindows: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  }>;
  reviewPeriods: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    goalWindowId: string;
  }>;
  competencyCriteria: {
    enabled: boolean;
    model: string;
    customCriteria: string[];
    scoringSystem: string;
    competencies?: Competency[];
  };
  notifications: {
    enabled: boolean;
    email: boolean;
    emailAddress: string;
    reminders: boolean;
    deadlines: boolean;
  };
}

const defaultCycleData: CycleData = {
  frequency: "annual",
  cycleName: "2024 Annual Performance Review",
  goalSettingWindows: [{
    id: "gsw-1",
    name: "Q1 Goal Setting",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31")
  }],
  reviewPeriods: [{
    id: "rp-1",
    name: "Mid-Year Review",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-30"),
    goalWindowId: "gsw-1"
  }, {
    id: "rp-2",
    name: "Year-End Review",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-31"),
    goalWindowId: "gsw-1"
  }],
  competencyCriteria: {
    enabled: true,
    model: "pjiae",
    customCriteria: [],
    scoringSystem: "5-point-scale",
    competencies: [{
      name: "Job Knowledge",
      description: "Understanding of responsibilities, procedures, and required skills."
    }, {
      name: "Quality of Work",
      description: "Accuracy, thoroughness, and attention to detail in tasks."
    }, {
      name: "Productivity",
      description: "Amount of work completed efficiently and effectively."
    }, {
      name: "Initiative",
      description: "Willingness to take on responsibilities, show independence, and go beyond expectations."
    }, {
      name: "Communication Skills",
      description: "Ability to clearly convey information both verbally and in writing."
    }, {
      name: "Teamwork",
      description: "Willingness to cooperate, support team efforts, and contribute to group objectives."
    }, {
      name: "Adaptability/Flexibility",
      description: "Openness to change and ability to adjust to new challenges."
    }, {
      name: "Dependability",
      description: "Reliability in attendance, meeting deadlines, and following through on commitments."
    }]
  },
  notifications: {
    enabled: true,
    email: true,
    emailAddress: "hr@company.com",
    reminders: true,
    deadlines: true
  }
};

const AppraisalCycleSetup = ({ data, onDataChange, onNext, onBack }: AppraisalCycleSetupProps) => {
  const [cycleData, setCycleData] = useState<CycleData>(
    data.appraisalCycle || defaultCycleData
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAndNext = async () => {
    setIsLoading(true);
    try {
      // Save the appraisal cycle data to the onboarding data
      onDataChange({ appraisalCycle: cycleData });
      
      // Simulate saving process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Appraisal cycle configuration saved!");
      onNext();
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingStepLayout
      onNext={handleSaveAndNext}
      onBack={onBack}
      nextLabel={isLoading ? "Saving..." : "Save & Continue"}
      nextDisabled={isLoading}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold">Set Up Appraisal Cycle</h2>
          <p className="text-muted-foreground">
            Configure your organization's performance review cycle and evaluation criteria.
          </p>
        </div>
        {/* Review Frequency Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Review Frequency</Label>
              <p className="text-sm text-muted-foreground">
                Select how often you want to conduct performance reviews.
              </p>
            </div>
            
            <RadioGroup 
              value={cycleData.frequency} 
              onValueChange={(value: "annual" | "bi-annual") => 
                setCycleData(prev => ({ ...prev, frequency: value }))
              } 
              className="space-y-4"
            >
              <label 
                htmlFor="annual" 
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <RadioGroupItem value="annual" id="annual" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Annual Review</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Most organizations prefer annual reviews for comprehensive evaluation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    One formal review cycle per year with a single goal-setting window
                  </p>
                </div>
              </label>

              <label 
                htmlFor="bi-annual" 
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <RadioGroupItem value="bi-annual" id="bi-annual" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Bi-Annual Review</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Recommended
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Two formal review cycles per year for more frequent feedback</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Two formal review cycles per year, each with its own goal-setting period
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>
        </Card>

        {/* Competency Evaluation Settings */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Enable Competency Evaluation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Include competency-based assessment in reviews
                </p>
              </div>
              <Switch 
                checked={cycleData.competencyCriteria.enabled} 
                onCheckedChange={(enabled) => 
                  setCycleData(prev => ({
                    ...prev,
                    competencyCriteria: { ...prev.competencyCriteria, enabled }
                  }))
                } 
              />
            </div>

            {cycleData.competencyCriteria.enabled && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Scoring System</Label>
                  <Select 
                    value={cycleData.competencyCriteria.scoringSystem} 
                    onValueChange={(value) => 
                      setCycleData(prev => ({
                        ...prev,
                        competencyCriteria: { ...prev.competencyCriteria, scoringSystem: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scoring system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-point-scale">5-Point Scale (1-5)</SelectItem>
                      <SelectItem value="4-point-scale">4-Point Scale (1-4)</SelectItem>
                      <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                      <SelectItem value="meets-exceeds">Meets/Exceeds Expectations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Core Competencies Preview */}
                <div className="space-y-2">
                  <Label>Core Competencies (PJIAE Model)</Label>
                  <ScrollArea className="h-40 rounded-md border bg-muted/30 p-4">
                    <div className="space-y-2">
                      {cycleData.competencyCriteria.competencies?.map((competency, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{competency.name}</p>
                            <p className="text-xs text-muted-foreground">{competency.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send automated notifications to participants
                </p>
              </div>
              <Switch 
                checked={cycleData.notifications.enabled} 
                onCheckedChange={(enabled) => 
                  setCycleData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, enabled }
                  }))
                } 
              />
            </div>

            {cycleData.notifications.enabled && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Notification Email Address</Label>
                  <Input 
                    type="email" 
                    value={cycleData.notifications.emailAddress} 
                    onChange={(e) => 
                      setCycleData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailAddress: e.target.value }
                      }))
                    } 
                    placeholder="hr@company.com" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="reminders"
                      checked={cycleData.notifications.reminders}
                      onCheckedChange={(checked) => 
                        setCycleData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, reminders: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="reminders" className="text-sm">Send reminders</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="deadlines"
                      checked={cycleData.notifications.deadlines}
                      onCheckedChange={(checked) => 
                        setCycleData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, deadlines: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="deadlines" className="text-sm">Deadline notifications</Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Configuration Summary */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">Configuration Summary</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Review Frequency: {cycleData.frequency === "annual" ? "Annual" : "Bi-Annual"}</p>
              <p>• Competency Evaluation: {cycleData.competencyCriteria.enabled ? "Enabled" : "Disabled"}</p>
              {cycleData.competencyCriteria.enabled && (
                <p>• Scoring System: {cycleData.competencyCriteria.scoringSystem}</p>
              )}
              <p>• Notifications: {cycleData.notifications.enabled ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </Card>
      </div>
    </OnboardingStepLayout>
  );
};

export default AppraisalCycleSetup;
