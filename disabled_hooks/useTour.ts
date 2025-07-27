import { useState, useCallback } from "react"
import { TourStep } from "@/components/ui/tour-guide"

interface UseTourOptions {
  steps: TourStep[]
  autoStart?: boolean
  persistState?: boolean
  storageKey?: string
}

export function useTour({ 
  steps, 
  autoStart = false, 
  persistState = true,
  storageKey = "app-tour-completed"
}: UseTourOptions) {
  const [isOpen, setIsOpen] = useState(() => {
    if (!persistState) return autoStart
    
    const completed = localStorage.getItem(storageKey)
    return autoStart && !completed
  })

  const startTour = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeTour = useCallback(() => {
    setIsOpen(false)
  }, [])

  const completeTour = useCallback(() => {
    setIsOpen(false)
    
    if (persistState) {
      localStorage.setItem(storageKey, "true")
    }
  }, [persistState, storageKey])

  const resetTour = useCallback(() => {
    if (persistState) {
      localStorage.removeItem(storageKey)
    }
    setIsOpen(false)
  }, [persistState, storageKey])

  const isTourCompleted = useCallback(() => {
    if (!persistState) return false
    return !!localStorage.getItem(storageKey)
  }, [persistState, storageKey])

  return {
    isOpen,
    startTour,
    closeTour,
    completeTour,
    resetTour,
    isTourCompleted,
    steps
  }
}