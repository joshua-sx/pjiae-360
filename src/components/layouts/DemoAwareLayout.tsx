import React, { ReactNode } from 'react';
import { DemoModeBanner } from '@/components/ui/demo-mode-banner';
import { DemoRoleSwitcher } from '@/components/ui/demo-role-switcher';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface DemoAwareLayoutProps {
  children: ReactNode;
}

export function DemoAwareLayout({ children }: DemoAwareLayoutProps) {
  const { isDemoMode } = useDemoMode();

  return (
    <div className="flex flex-col h-full">
      {isDemoMode && (
        <div className="space-y-4 p-4 border-b bg-muted/20">
          <DemoModeBanner />
          <DemoRoleSwitcher />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}