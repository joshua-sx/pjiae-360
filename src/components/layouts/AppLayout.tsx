
import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarInset className="flex flex-col min-h-screen">
      <TopNavigation />
      <main className="flex-1 bg-background">
        <div className="main-content">
          {children}
        </div>
      </main>
    </SidebarInset>
  );
}
