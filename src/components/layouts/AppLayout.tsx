
import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarInset>
      <TopNavigation />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {children}
      </div>
    </SidebarInset>
  );
}
