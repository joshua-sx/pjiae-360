
"use client"

import * as React from "react"
import { Target } from "lucide-react"
import { Link } from "react-router-dom"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useOrganization } from "@/hooks/useOrganization"

export function OrganizationSwitcher({
  rolePrefix,
}: {
  rolePrefix: string
}) {
  const { organization, loading } = useOrganization()

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-16 items-center group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-600 text-sidebar-primary-foreground">
                <Target className="size-4 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Loading...</span>
                <span className="truncate text-xs">Professional</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const organizationName = organization?.name || 'PJIAE 360 Enterprise'
  const organizationPlan = organization?.subscription_plan || 'Professional'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="h-16 items-center group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <Link to={`/${rolePrefix}/dashboard`}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-600 text-sidebar-primary-foreground">
              <Target className="size-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{organizationName}</span>
              <span className="truncate text-xs">{organizationPlan}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
