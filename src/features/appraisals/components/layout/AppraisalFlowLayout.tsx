import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import NotificationSystem, { NotificationProps } from '../NotificationSystem';

interface AppraisalFlowLayoutProps {
  isDemoMode: boolean;
  notification: NotificationProps | null;
  children: React.ReactNode;
}

export function AppraisalFlowLayout({ 
  isDemoMode, 
  notification, 
  children 
}: AppraisalFlowLayoutProps) {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {isDemoMode && <DemoModeBanner />}
        <NotificationSystem notification={notification} />
        {children}
      </div>
    </TooltipProvider>
  );
}