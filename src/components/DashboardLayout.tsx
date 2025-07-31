
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
