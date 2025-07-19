
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useNavigationState } from "./providers/NavigationProvider"
import { useSidebarState } from "./providers/SidebarStateProvider"
import { RouteLoader } from "./ui/navigation-loader"
import { Suspense } from "react"

type PageWidth = 'standard' | 'wide' | 'full'

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  pageWidth?: PageWidth
  isLoading?: boolean
}

const getContainerClass = (width: PageWidth) => {
  switch (width) {
    case 'wide':
      return 'container-wide'
    case 'full':
      return 'container-full'
    default:
      return 'container-standard'
  }
}

export function DashboardLayout({ 
  children, 
  breadcrumbs = [{ label: "Dashboard" }], 
  pageWidth = 'standard',
  isLoading = false
}: DashboardLayoutProps) {
  const { isNavigating } = useNavigationState()
  const { isCollapsed } = useSidebarState()
  
  const showLoader = isLoading || isNavigating

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.label} className="flex items-center gap-2">
                    <BreadcrumbItem className="hidden md:block">
                      {breadcrumb.href ? (
                        <BreadcrumbLink href={breadcrumb.href}>
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 pt-0">
          <div className={getContainerClass(pageWidth)}>
            {showLoader ? (
              <RouteLoader />
            ) : (
              <Suspense fallback={<RouteLoader />}>
                {children}
              </Suspense>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
