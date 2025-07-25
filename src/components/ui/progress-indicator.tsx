import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  steps: { id: string; label: string; description?: string }[]
  currentStep: number
  className?: string
  variant?: "dots" | "line" | "circle"
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  className,
  variant = "dots" 
}: ProgressIndicatorProps) {
  if (variant === "line") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center text-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index <= currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>
              <span className="text-xs mt-2 max-w-20">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  if (variant === "circle") {
    const circumference = 2 * Math.PI * 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (currentStep / (steps.length - 1)) * circumference

    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {Math.round((currentStep / (steps.length - 1)) * 100)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-semibold">{steps[currentStep]?.label}</h3>
          {steps[currentStep]?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Default dots variant
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors",
            index <= currentStep 
              ? "bg-primary" 
              : "bg-muted"
          )} />
          {index < steps.length - 1 && (
            <div className={cn(
              "w-8 h-px mx-2 transition-colors",
              index < currentStep 
                ? "bg-primary" 
                : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}