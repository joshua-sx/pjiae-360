import { useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'
import { useSidebarState } from '@/components/providers/SidebarStateProvider'

/**
 * Hook to synchronize sidebar state between our custom provider and shadcn sidebar
 */
export function useSidebarSync() {
  const { open, setOpen } = useSidebar()
  const { isCollapsed, toggleCollapsed } = useSidebarState()

  // Sync our custom state to shadcn sidebar state
  useEffect(() => {
    if (open !== !isCollapsed) {
      setOpen(!isCollapsed)
    }
  }, [isCollapsed, open, setOpen])

  // Sync shadcn sidebar state back to our custom state (reverse sync)
  useEffect(() => {
    if (isCollapsed === open) {
      toggleCollapsed()
    }
  }, [open, isCollapsed, toggleCollapsed])

  // Return unified functions
  return {
    isOpen: open,
    isCollapsed: !open,
    toggle: () => {
      // Use shadcn's setOpen directly - it will trigger our reverse sync
      setOpen(!open)
    }
  }
}