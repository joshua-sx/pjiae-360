
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <>
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight break-words">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl break-words">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 lg:flex-nowrap lg:flex-shrink-0">
          {children}
        </div>
      )}
    </>
  );
}
