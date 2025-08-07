
import { RouteLoader } from "./ui/navigation-loader"
import { Suspense } from "react"

type PageWidth = 'standard' | 'wide' | 'full'

interface DashboardLayoutProps {
  children: React.ReactNode
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
  isLoading = false
}: DashboardLayoutProps) {
  const showLoader = isLoading

  return (
    <div className="space-y-8">
      {showLoader ? (
        <RouteLoader />
      ) : (
        <Suspense fallback={<RouteLoader />}>
          {children}
        </Suspense>
      )}
    </div>
  )
}
