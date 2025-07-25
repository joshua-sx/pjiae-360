import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
import { cn } from "@/lib/utils"

interface HelpTooltipProps {
  content: string
  className?: string
  side?: "top" | "right" | "bottom" | "left"
}

export function HelpTooltip({ content, className, side = "top" }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle 
            className={cn(
              "h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help",
              className
            )} 
          />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-80">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}