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

export function TeamSwitcher({
  organization,
  rolePrefix,
  isDemoMode,
}: {
  organization: {
    name: string
    plan: string
  }
  rolePrefix: string
  isDemoMode: boolean
}) {
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
                <span className="truncate font-semibold">{organization.name}</span>
                <span className="truncate text-xs">{organization.plan}</span>
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