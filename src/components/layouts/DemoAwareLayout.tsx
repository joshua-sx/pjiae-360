
import React, { ReactNode } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface DemoAwareLayoutProps {
  children: ReactNode;
}

export function DemoAwareLayout({ children }: DemoAwareLayoutProps) {
  const { isDemoMode } = useDemoMode();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
