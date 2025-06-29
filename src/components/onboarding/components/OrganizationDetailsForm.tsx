
"use client";

import * as React from "react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Organization Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-3">
          <label htmlFor="orgName" className="block text-sm font-medium text-foreground">
            Organization Name *
          </label>
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
