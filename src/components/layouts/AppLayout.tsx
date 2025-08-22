
import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { LayoutWidthProvider } from '@/contexts/LayoutWidthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <LayoutWidthProvider>
      <SidebarInset className="flex flex-col min-h-screen">
        <TopNavigation />
        <main className="flex-1 bg-background overflow-x-visible pb-16 md:pb-0">
          <div className="main-content overflow-x-visible">
            {children}
          </div>
        </main>
      </SidebarInset>
    </LayoutWidthProvider>
  );
}
