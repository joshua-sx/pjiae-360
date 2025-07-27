import { useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

/**
 * Hook to manage sidebar state with localStorage persistence
 * Uses shadcn sidebar as the single source of truth
 */
export function useSidebarSync() {
  const { open, setOpen } = useSidebar()

  // Sync shadcn sidebar state to localStorage (one-way only)
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(!open))
  }, [open])

  // Initialize sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      const isCollapsed = JSON.parse(saved)
      setOpen(!isCollapsed)
    }
  }, [setOpen])

  return {
    isOpen: open,
    isCollapsed: !open,
    toggle: () => setOpen(!open)
  }
}