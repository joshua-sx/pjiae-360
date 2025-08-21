/**
 * AppShell Layout Contract
 * Unified layout system ensuring consistent sidebar behavior and responsive design
 */

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppLayout } from '@/components/layouts/AppLayout';
import { MobileBottomNavigation } from '@/components/layout/MobileBottomNavigation';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  defaultSidebarOpen?: boolean;
}

/**
 * AppShell - The unified layout contract for all authenticated pages
 * 
 * Features:
 * - Consistent sidebar behavior with token-based sizing
 * - Responsive design with mobile-first approach
 * - Persistent sidebar state management
 * - Mobile bottom navigation integration
 */
export function AppShell({ 
  children, 
  className,
  defaultSidebarOpen 
}: AppShellProps): JSX.Element {
  const savedSidebarState = React.useMemo(() => {
    if (typeof defaultSidebarOpen !== 'undefined') {
      return defaultSidebarOpen;
    }
    
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved ? !JSON.parse(saved) : true;
    } catch {
      return true;
    }
  }, [defaultSidebarOpen]);

  return (
    <SidebarProvider 
      defaultOpen={savedSidebarState}
      className={cn("min-h-screen w-full", className)}
    >
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <AppLayout>
          {children}
        </AppLayout>
        <MobileBottomNavigation />
      </div>
    </SidebarProvider>
  );
}

/**
 * Utility hook for accessing AppShell state
 */
export function useAppShell() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    sidebarWidth: {
      collapsed: 'var(--size-sidebar-collapsed)',
      expanded: 'var(--size-sidebar-expanded)',
    },
    headerHeight: 'var(--size-header)',
    containerPadding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
  };
}