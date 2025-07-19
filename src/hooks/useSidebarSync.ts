import { useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'
import { useSidebarState } from '@/components/providers/SidebarStateProvider'

/**
 * Hook to synchronize sidebar state between our custom provider and shadcn sidebar
 */
export function useSidebarSync() {
  const { open, setOpen } = useSidebar()
  const { isCollapsed, toggleCollapsed } = useSidebarState()

  // Sync shadcn sidebar state with our custom state
  useEffect(() => {
    if (open !== !isCollapsed) {
      setOpen(!isCollapsed)
    }
  }, [isCollapsed, open, setOpen])

  // Return unified functions
  return {
    isOpen: open,
    isCollapsed: !open,
    toggle: () => {
      toggleCollapsed()
      setOpen(isCollapsed)
    }
  }
}