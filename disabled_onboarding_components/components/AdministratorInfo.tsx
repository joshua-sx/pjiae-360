
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminInfo {
  name: string;
  email: string;
  role: string;
}

interface AdministratorInfoProps {
  adminInfo: AdminInfo;
}

export default function AdministratorInfo({ adminInfo }: AdministratorInfoProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Administrator Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Name</span>
            <span className="text-sm text-muted-foreground">{adminInfo.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Email</span>
            <span className="text-sm text-muted-foreground">{adminInfo.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Role</span>
            <span className="text-sm text-muted-foreground">{adminInfo.role}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          You'll Be Set Up as the Primary Administrator for Your Organization
        </p>
      </CardContent>
    </Card>
  );
}
