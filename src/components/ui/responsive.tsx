import * as React from "react"
import { cn } from "@/lib/utils"

interface ShowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ShowOnMobile({ children, className, ...props }: ShowProps) {
  return (
    <div className={cn("block md:hidden", className)} {...props}>
      {children}
    </div>
  )
}

export function ShowOnDesktop({ children, className, ...props }: ShowProps) {
  return (
    <div className={cn("hidden md:block", className)} {...props}>
      {children}
    </div>
  )
}

export function StackOnMobile({ children, className, ...props }: ShowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-center md:gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
