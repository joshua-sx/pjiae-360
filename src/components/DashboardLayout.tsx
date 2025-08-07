
import { RouteLoader } from "./ui/navigation-loader"
import { Suspense } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  isLoading?: boolean
}

export function DashboardLayout({ 
  children,
  isLoading = false
}: DashboardLayoutProps) {
  const showLoader = isLoading

  return (
    <>
      {showLoader ? (
        <RouteLoader />
      ) : (
        <Suspense fallback={<RouteLoader />}>
          {children}
        </Suspense>
      )}
    </>
  )
}
