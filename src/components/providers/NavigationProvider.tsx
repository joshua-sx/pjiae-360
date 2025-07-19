
import React, { createContext, useContext, useState, useCallback } from 'react'
import { useNavigation } from 'react-router-dom'

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
  const navigation = useNavigation()
  const [navigationKey, setNavigationKey] = useState('')
  
  const isNavigating = navigation.state === 'loading'

  const handleSetNavigationKey = useCallback((key: string) => {
    setNavigationKey(key)
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
