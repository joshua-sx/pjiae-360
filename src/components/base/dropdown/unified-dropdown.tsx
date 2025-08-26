/**
 * Unified Dropdown System
 * Single source of truth for all dropdown components across the app
 */
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedDropdownProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  size?: "sm" | "default" | "lg";
  className?: string;
}

interface DropdownButtonProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  className?: string;
}

interface ActionDropdownProps {
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  className?: string;
}

/**
 * Main unified dropdown component
 */
export function UnifiedDropdown({ 
  trigger, 
  children, 
  align = "start", 
  side = "bottom",
  size = "default",
  className 
}: UnifiedDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        side={side} 
        size={size}
        className={cn("z-dropdown", className)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Dropdown with button trigger
 */
export function DropdownButton({ 
  children, 
  variant = "outline", 
  size = "default", 
  disabled = false,
  className 
}: DropdownButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      {children}
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}

/**
 * Three-dot action dropdown
 */
export function ActionDropdown({ size = "default", children, className }: ActionDropdownProps) {
  return (
    <UnifiedDropdown
      trigger={
        <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      }
      align="end"
      size={size}
    >
      {children}
    </UnifiedDropdown>
  );
}

// Re-export all dropdown components for easy access
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

// Default export for main component
export default UnifiedDropdown;