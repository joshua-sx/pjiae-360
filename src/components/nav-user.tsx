"use client"

import {
  LogOut,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { DemoModeToggle } from "@/components/ui/demo-mode-toggle"

export function NavUser({
  user,
  onSignOut,
}: {
  user: {
    name: string
    email: string
    avatar?: string
    initials: string
  }
  onSignOut: () => void
}) {
  const { state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                <span className="text-sm font-semibold">
                  {user.initials}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-none"
            side={state === "collapsed" ? "right" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <span className="text-sm font-semibold">
                    {user.initials}
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent">
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent"
            >
              <DemoModeToggle />
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent">
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive gap-2 hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}