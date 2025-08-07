
import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { cn } from '@/lib/utils';

type PageWidth = 'standard' | 'wide' | 'full';

interface AppLayoutProps {
  children: React.ReactNode;
  width?: PageWidth;
}

const getContentClass = (width: PageWidth) => {
  switch (width) {
    case 'wide':
      return 'container-wide';
    case 'full':
      return 'container-full';
    default:
      return 'page-container';
  }
};

export function AppLayout({ children, width = 'standard' }: AppLayoutProps) {
  return (
    <SidebarInset className="flex flex-col min-h-screen">
      <TopNavigation />
      <main className="flex-1 bg-background">
        <div className={cn(getContentClass(width), "space-y-4 sm:space-y-6")}>
          {children}
        </div>
      </main>
    </SidebarInset>
  );
}
