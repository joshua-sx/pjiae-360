import React from "react";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

interface StandardPageProps {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export function StandardPage({
  title,
  description,
  right,
  children,
  className,
  headerClassName
}: StandardPageProps) {
  return (
    <PageContent className={cn(className)}>
      <PageHeader title={title} description={description} className={headerClassName}>
        {right}
      </PageHeader>
      {children}
    </PageContent>
  );
}