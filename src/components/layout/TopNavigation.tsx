import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

export function TopNavigation() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.url || index}>
                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                  {breadcrumb.isActive ? (
                    <BreadcrumbPage className="font-medium">
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        to={breadcrumb.url!} 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}