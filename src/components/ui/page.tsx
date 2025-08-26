import React from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";

interface PageProps {
  children: React.ReactNode;
  className?: string;
  size?: 'narrow' | 'standard' | 'wide' | 'full';
  spacing?: 'sm' | 'md' | 'lg';
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'narrow' | 'standard' | 'wide' | 'full';
}

const sizeClasses = {
  narrow: 'max-w-2xl',      // 672px - for forms, simple content
  standard: 'max-w-4xl',    // 896px - for most content
  wide: 'max-w-6xl',        // 1152px - for dashboards, wide layouts
  full: 'max-w-none'        // No max-width constraint
};

const spacingClasses = {
  sm: 'space-y-4',
  md: 'space-y-6', 
  lg: 'space-y-8'
};

/**
 * Main page container with responsive padding and max-width
 */
export function PageContainer({ children, size = 'standard', className }: PageContainerProps) {
  return (
    <div className={cn(
      "w-full mx-auto px-3 sm:px-4 md:px-6",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Page content area with consistent vertical spacing
 */
export function PageContent({ children, spacing = 'md', className }: PageContentProps) {
  return (
    <div className={cn(
      spacingClasses[spacing],
      "overflow-x-visible",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Complete page scaffold with container and content spacing
 */
export function Page({ children, size = 'standard', spacing = 'md', className }: PageProps) {
  return (
    <PageContainer size={size}>
      <PageContent spacing={spacing} className={className}>
        {children}
      </PageContent>
    </PageContainer>
  );
}

// Re-export PageHeader for convenience
export { PageHeader };