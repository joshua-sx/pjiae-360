
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
      return 'page-container'
  }
}

export function DashboardLayout({ 
  children, 
  breadcrumbs = [{ label: "Dashboard" }], 
  pageWidth = 'standard',
  isLoading = false
}: DashboardLayoutProps) {
  const { isNavigating } = useNavigationState()
  
  const showLoader = isLoading || isNavigating

  // Get initial state from localStorage
  const getInitialOpen = () => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? !JSON.parse(saved) : true
  }

  return (
    <SidebarProvider defaultOpen={getInitialOpen()}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-sticky bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 lg:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <div key={breadcrumb.label} className="flex items-center gap-2">
                      <BreadcrumbItem className="hidden md:block">
                        {breadcrumb.href ? (
                          <BreadcrumbLink href={breadcrumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="font-medium text-foreground">{breadcrumb.label}</BreadcrumbPage>
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
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className={`${getContainerClass(pageWidth)} py-6 lg:py-8`}>
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
