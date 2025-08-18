import React from 'react';
import { cn } from "@/lib/utils";

type ContainerSize = 'narrow' | 'standard' | 'wide' | 'full';

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  className?: string;
  fullBleedScroll?: boolean;
}

const sizeClasses: Record<ContainerSize, string> = {
  narrow: 'max-w-2xl',      // 672px - for forms, simple content
  standard: 'max-w-4xl',    // 896px - for most content
  wide: 'max-w-6xl',        // 1152px - for dashboards, wide layouts
  full: 'max-w-none'        // No max-width constraint
};

export function Container({ 
  children, 
  size = 'standard', 
  className,
  fullBleedScroll = false 
}: ContainerProps) {
  if (fullBleedScroll) {
    // For components that need full-width scrolling (like step indicators)
    return (
      <div className={cn("w-full", className)}>
        {children}
      </div>
    );
  }

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