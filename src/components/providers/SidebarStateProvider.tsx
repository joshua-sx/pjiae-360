import React, { createContext, useContext, useState } from 'react'

interface SidebarStateContextType {
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
  const [isLoading, setIsLoading] = useState(false)

  return (
    <SidebarStateContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading 
      }}
    >
      {children}
    </SidebarStateContext.Provider>
  )
}