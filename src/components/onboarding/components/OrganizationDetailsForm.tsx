
"use client";

import * as React from "react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeAlert, BadgeCheck } from "lucide-react";
import LogoUpload from "./LogoUpload";

interface OrganizationDetailsFormProps {
  orgName: string;
  logo: File | null;
  onOrgNameChange: (name: string) => void;
  onLogoChange: (logo: File | null) => void;
}

export default function OrganizationDetailsForm({
  orgName,
  logo,
  onOrgNameChange,
  onLogoChange
}: OrganizationDetailsFormProps) {
  const handleOrgNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onOrgNameChange(e.target.value);
  }, [onOrgNameChange]);

  const isValidName = orgName.trim().length >= 2;
  const isEmpty = orgName.trim().length === 0;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="space-y-6 pt-6">
        {/* Organization Name */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor="orgName" className="block text-sm font-medium text-foreground">
              Organization Name
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isValidName ? (
                    <BadgeCheck className="h-4 w-4 text-primary cursor-help" />
                  ) : (
                    <BadgeAlert className="h-4 w-4 text-destructive cursor-help" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {isValidName ? (
                    <p>Organization name is valid</p>
                  ) : isEmpty ? (
                    <p>Organization name is required</p>
                  ) : (
                    <p>Organization name must be at least 2 characters</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="orgName"
            type="text"
            placeholder="Enter Your Organization Name"
            value={orgName}
            onChange={handleOrgNameChange}
            className={cn(
              "text-base h-11 transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "hover:border-primary/50"
            )}
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Used as Your Company Name in the Dashboard
          </p>
        </div>

        {/* Logo Upload */}
        <LogoUpload logo={logo} onLogoChange={onLogoChange} />
      </CardContent>
    </Card>
  );
}
