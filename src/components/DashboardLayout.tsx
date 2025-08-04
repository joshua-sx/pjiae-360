
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
import { RouteLoader } from "./ui/navigation-loader"
import { useScrollToTop } from "@/hooks/useScrollToTop"

import { Suspense, useRef, useEffect } from "react"

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
      return 'page-container'
  }
}

export function DashboardLayout({ 
  children, 
  breadcrumbs = [{ label: "Dashboard" }], 
  pageWidth = 'standard',
  isLoading = false
}: DashboardLayoutProps) {
  const { isNavigating, navigationKey } = useNavigationState()
  const mainRef = useRef<HTMLElement>(null)
  
  // Scroll to top when navigation occurs
  useScrollToTop(navigationKey)
  
  const showLoader = isLoading || isNavigating

  // Get initial state from localStorage
  const getInitialOpen = () => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? !JSON.parse(saved) : true
  }

  // Prevent scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <SidebarProvider defaultOpen={getInitialOpen()}>
      <AppSidebar />
      <SidebarInset data-sidebar="inset">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.label} className="flex items-center gap-1 sm:gap-2">
                    <BreadcrumbItem>
                      {breadcrumb.href ? (
                        <BreadcrumbLink href={breadcrumb.href}>
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main ref={mainRef} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
