import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  className?: string;
  message?: string;
  variant?: "default" | "minimal" | "card";
}

export function PageLoading({ 
  className, 
  message = "Loading...", 
  variant = "default" 
}: PageLoadingProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{message}</span>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("border border-border rounded-lg bg-card", className)}>
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-primary mx-auto" />
            </motion.div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary mx-auto" />
        </motion.div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}