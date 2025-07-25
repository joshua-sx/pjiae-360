
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mt-2 flex flex-col gap-6 md:flex-row md:items-start md:justify-between pb-6 border-b">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
}
