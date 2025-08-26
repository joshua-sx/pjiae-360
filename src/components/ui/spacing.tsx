import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SpacingProps {
  children: ReactNode;
  className?: string;
}

type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface SpacingVariantProps extends SpacingProps {
  size?: SpacingSize;
}

/**
 * Vertical Stack - consistent vertical spacing
 */
export function VStack({ children, size = 'md', className }: SpacingVariantProps) {
  const spacingMap: Record<SpacingSize, string> = {
    xs: 'space-y-1',
    sm: 'space-y-2', 
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
    '3xl': 'space-y-16',
  };

  return (
    <div className={cn(spacingMap[size], className)}>
      {children}
    </div>
  );
}

/**
 * Horizontal Stack - consistent horizontal spacing
 */
export function HStack({ children, size = 'md', className }: SpacingVariantProps) {
  const spacingMap: Record<SpacingSize, string> = {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4', 
    lg: 'space-x-6',
    xl: 'space-x-8',
    '2xl': 'space-x-12',
    '3xl': 'space-x-16',
  };

  return (
    <div className={cn('flex items-center', spacingMap[size], className)}>
      {children}
    </div>
  );
}

/**
 * Grid Container - consistent grid gaps
 */
export function GridContainer({ children, size = 'md', className }: SpacingVariantProps) {
  const gapMap: Record<SpacingSize, string> = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6', 
    xl: 'gap-8',
    '2xl': 'gap-12',
    '3xl': 'gap-16',
  };

  return (
    <div className={cn('grid', gapMap[size], className)}>
      {children}
    </div>
  );
}

/**
 * Section Spacer - consistent section spacing
 */
export function Section({ children, size = 'lg', className }: SpacingVariantProps) {
  const paddingMap: Record<SpacingSize, string> = {
    xs: 'py-2',
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8',
    xl: 'py-12',
    '2xl': 'py-16',
    '3xl': 'py-24',
  };

  return (
    <section className={cn(paddingMap[size], className)}>
      {children}
    </section>
  );
}

/**
 * Container - consistent page containers
 */
interface ContainerProps extends SpacingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, size = 'lg', className }: ContainerProps) {
  const containerMap = {
    sm: 'max-w-2xl mx-auto px-4',
    md: 'max-w-4xl mx-auto px-4', 
    lg: 'max-w-6xl mx-auto px-4',
    xl: 'max-w-7xl mx-auto px-4',
    full: 'w-full px-4',
  };

  return (
    <div className={cn(containerMap[size], className)}>
      {children}  
    </div>
  );
}