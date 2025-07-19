import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface SidebarStateContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const SidebarStateContext = createContext<SidebarStateContextType | null>(null)

export function useSidebarState() {
  const context = useContext(SidebarStateContext)
  if (!context) {
    throw new Error('useSidebarState must be used within SidebarStateProvider')
  }
  return context
}

interface SidebarStateProviderProps {
  children: React.ReactNode
}

export function SidebarStateProvider({ children }: SidebarStateProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load initial state from localStorage
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [isLoading, setIsLoading] = useState(false)

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return (
    <SidebarStateContext.Provider 
      value={{ 
        isCollapsed, 
        toggleCollapsed, 
        isLoading, 
        setIsLoading 
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  )
}