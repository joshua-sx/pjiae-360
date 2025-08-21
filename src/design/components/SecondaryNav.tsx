/**
 * Secondary Navigation Component
 * Reusable navigation for subsections (settings, admin panels, etc.)
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icons, type IconName } from '../icons/iconRegistry';

interface SecondaryNavItem {
  path: string;
  label: string;
  icon?: IconName;
  description?: string;
  disabled?: boolean;
}

interface SecondaryNavProps {
  items: SecondaryNavItem[];
  className?: string;
  variant?: 'tabs' | 'sidebar' | 'pills';
  orientation?: 'horizontal' | 'vertical';
}

/**
 * SecondaryNav - Consistent navigation for subsections
 */
export function SecondaryNav({ 
  items, 
  className,
  variant = 'tabs',
  orientation = 'horizontal'
}: SecondaryNavProps): JSX.Element {
  const location = useLocation();

  const getNavClassName = (item: SecondaryNavItem) => {
    const isActive = location.pathname === item.path;
    const baseClasses = "motion-safe transition-colors duration-base ease-standard";
    
    switch (variant) {
      case 'tabs':
        return cn(
          baseClasses,
          "px-3 py-2 text-sm font-medium rounded-none border-b-2 border-transparent",
          "hover:text-foreground hover:border-muted-foreground/50",
          isActive 
            ? "text-primary border-primary" 
            : "text-muted-foreground",
          item.disabled && "opacity-50 cursor-not-allowed"
        );
      
      case 'sidebar':
        return cn(
          baseClasses,
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          isActive 
            ? "bg-accent text-accent-foreground" 
            : "text-muted-foreground",
          item.disabled && "opacity-50 cursor-not-allowed"
        );
      
      case 'pills':
        return cn(
          baseClasses,
          "px-3 py-2 text-sm font-medium rounded-full",
          "hover:bg-accent hover:text-accent-foreground",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground",
          item.disabled && "opacity-50 cursor-not-allowed"
        );
      
      default:
        return baseClasses;
    }
  };

  const containerClassName = cn(
    "flex",
    orientation === 'horizontal' ? "space-x-1" : "flex-col space-y-1",
    variant === 'tabs' && orientation === 'horizontal' && "border-b border-border",
    className
  );

  return (
    <nav className={containerClassName} role="navigation">
      {items.map((item) => {
        const IconComponent = item.icon ? Icons[item.icon] : null;
        
        if (item.disabled) {
          return (
            <div
              key={item.path}
              className={getNavClassName(item)}
              title={item.description}
            >
              {IconComponent && (
                <IconComponent className="w-4 h-4" />
              )}
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => getNavClassName({ ...item })}
            title={item.description}
          >
            {IconComponent && (
              <IconComponent className="w-4 h-4" />
            )}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * Hook for building secondary navigation items with consistent patterns
 */
export function useSecondaryNavItems() {
  const buildNavItems = React.useCallback((
    baseItems: Array<{
      key: string;
      label: string;
      icon?: IconName;
      description?: string;
      disabled?: boolean;
    }>,
    basePath: string
  ): SecondaryNavItem[] => {
    return baseItems.map(item => ({
      path: `${basePath}/${item.key}`,
      label: item.label,
      icon: item.icon,
      description: item.description,
      disabled: item.disabled,
    }));
  }, []);

  return { buildNavItems };
}