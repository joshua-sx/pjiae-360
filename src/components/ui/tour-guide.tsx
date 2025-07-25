import { useState, useEffect, useRef } from "react"
import { Button } from "./button"
import { Card, CardContent, CardFooter } from "./card"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TourStep {
  target: string
  title: string
  content: string
  placement?: "top" | "bottom" | "left" | "right"
  action?: () => void
}

interface TourGuideProps {
  steps: TourStep[]
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  className?: string
}

export function TourGuide({ 
  steps, 
  isOpen, 
  onClose, 
  onComplete,
  className 
}: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tourRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return

    const target = document.querySelector(steps[currentStep].target) as HTMLElement
    if (target) {
      setTargetElement(target)
      
      // Scroll element into view
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      
      // Add highlight class
      target.classList.add('tour-highlight')
      
      // Calculate position
      const rect = target.getBoundingClientRect()
      const placement = steps[currentStep].placement || 'bottom'
      
      let top = 0
      let left = 0
      
      switch (placement) {
        case 'top':
          top = rect.top - 10
          left = rect.left + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + 10
          left = rect.left + rect.width / 2
          break
        case 'left':
          top = rect.top + rect.height / 2
          left = rect.left - 10
          break
        case 'right':
          top = rect.top + rect.height / 2
          left = rect.right + 10
          break
      }
      
      setPosition({ top, left })
    }

    return () => {
      // Remove highlight class
      target?.classList.remove('tour-highlight')
    }
  }, [currentStep, isOpen, steps])

  const handleNext = () => {
    if (steps[currentStep]?.action) {
      steps[currentStep].action?.()
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete?.()
    onClose()
    setCurrentStep(0)
  }

  const handleSkip = () => {
    onClose()
    setCurrentStep(0)
  }

  if (!isOpen || !steps[currentStep]) return null

  const step = steps[currentStep]
  const placement = step.placement || 'bottom'

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      
      {/* Tour Card */}
      <Card 
        ref={tourRef}
        className={cn(
          "fixed z-50 w-80 shadow-lg",
          placement === 'top' && "transform -translate-x-1/2 -translate-y-full",
          placement === 'bottom' && "transform -translate-x-1/2",
          placement === 'left' && "transform -translate-x-full -translate-y-1/2",
          placement === 'right' && "transform -translate-y-1/2",
          className
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {step.content}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentStep + 1} of {steps.length}</span>
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    index === currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 pt-0">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSkip}
            >
              Skip Tour
            </Button>
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            {currentStep < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}