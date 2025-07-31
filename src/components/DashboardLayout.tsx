
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
      <SidebarInset>
        <header className="flex h-16 sm:h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-area-top">
          <div className="flex items-center gap-2 px-3 sm:px-4 lg:px-6 w-full">
            <SidebarTrigger className="-ml-1 tap-target" />
            <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
            <Breadcrumb className="flex-1 min-w-0">
              <BreadcrumbList className="flex-wrap">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.label} className="flex items-center gap-1 sm:gap-2">
                    <BreadcrumbItem className="flex">
                      {breadcrumb.href ? (
                        <BreadcrumbLink 
                          href={breadcrumb.href} 
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base truncate max-w-[120px] sm:max-w-none"
                        >
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="font-medium text-foreground text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                          {breadcrumb.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden xs:block" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main ref={mainRef} className="flex-1 overflow-auto mobile-scroll safe-area-bottom" data-sidebar="inset">
          <div className={`${getContainerClass(pageWidth)} py-4 sm:py-6 lg:py-8`}>
            {showLoader ? (
              <RouteLoader />
            ) : (
              <Suspense fallback={<RouteLoader />}>
                {children}
              </Suspense>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
