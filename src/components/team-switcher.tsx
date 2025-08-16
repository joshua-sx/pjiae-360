
"use client"

import * as React from "react"
import { Target } from "lucide-react"
import { Link } from "react-router-dom"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DemoRoleCombobox } from "@/components/ui/demo-role-combobox"
import { useOrganization } from "@/hooks/useOrganization"
import { useOrganizationStore, selectOrganizationName } from "@/stores"

export function TeamSwitcher({
  rolePrefix,
  isDemoMode,
}: {
  rolePrefix: string
  isDemoMode: boolean
}) {
  const { organization, loading } = useOrganization()
  const storedOrgName = useOrganizationStore(selectOrganizationName)

  if (loading) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
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
        
        {isDemoMode && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DemoRoleCombobox />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </>
    )
  }

  const organizationName = storedOrgName || organization?.name || 'PJIAE 360 Enterprise'
  const organizationPlan = organization?.subscription_plan || 'Professional'

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
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
      
      {isDemoMode && (
        <SidebarMenu>
          <SidebarMenuItem>
            <DemoRoleCombobox />
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </>
  )
}
