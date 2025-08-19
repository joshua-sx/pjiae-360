import * as React from "react"
import { MobileTable } from "@/components/ui/mobile-table"
import { useMobileResponsive } from "@/hooks/use-mobile-responsive"
import { cn } from "@/lib/utils"

export interface ResponsiveTableProps<T> {
  data: T[]
  renderDesktop: React.ReactNode
  renderMobileCard: (item: T, index: number) => React.ReactNode
  className?: string
  emptyMessage?: string
  title?: string
  onItemClick?: (item: T) => void
}

export function ResponsiveTable<T>({
  data,
  renderDesktop,
  renderMobileCard,
  className,
  emptyMessage,
  title,
  onItemClick,
}: ResponsiveTableProps<T>) {
  const { isMobile } = useMobileResponsive()

  if (isMobile) {
    return (
      <MobileTable
        data={data}
        renderCard={renderMobileCard}
        className={className}
        emptyMessage={emptyMessage}
        title={title}
        onItemClick={onItemClick}
      />
    )
  }

  return (
    <div className={cn("w-full overflow-x-auto mobile-scroll", className)}>
      {renderDesktop}
    </div>
  )
}
