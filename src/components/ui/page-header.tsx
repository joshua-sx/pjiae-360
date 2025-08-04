import React from 'react';
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}
export function PageHeader({
  title,
  description,
  children
}: PageHeaderProps) {
  return <>
      
      {children}
    </>;
}