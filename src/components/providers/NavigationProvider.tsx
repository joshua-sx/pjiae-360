
import React, { createContext, useContext, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

interface NavigationContextType {
  isNavigating: boolean
  navigationKey: string
  setNavigationKey: (key: string) => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function useNavigationState() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationState must be used within NavigationProvider')
  }
  return context
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationKey, setNavigationKey] = useState('')
  const location = useLocation()
  
  // Use location changes to track navigation state
  React.useEffect(() => {
    setIsNavigating(false)
  }, [location])

  const handleSetNavigationKey = useCallback((key: string) => {
    setNavigationKey(key)
    setIsNavigating(true)
  }, [])

  return (
    <NavigationContext.Provider 
      value={{ 
        isNavigating, 
        navigationKey, 
        setNavigationKey: handleSetNavigationKey 
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}
