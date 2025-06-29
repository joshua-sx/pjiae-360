
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface Milestone {
  id: string;
  title: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  description: string;
}

export interface MilestoneHeaderProps {
  milestone: Milestone;
  progress: number;
  currentStep: number;
  totalSteps: number;
}

export default function MilestoneHeader({
  milestone,
  progress,
  currentStep,
  totalSteps
}: MilestoneHeaderProps) {
  const IconComponent = milestone.icon;

  return (
    <header role="banner" className="sticky top-0 z-20 bg-background border-b border-border shadow-sm">
      <div className="px-4 md:px-12 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Milestone Info */}
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              key={milestone.id}
              initial={{
                scale: 0.8,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
              className="flex-shrink-0"
            >
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full">
                <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h1
                key={milestone.title}
                initial={{
                  y: -10,
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  opacity: 1
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.1,
                  ease: "easeOut"
                }}
                className="text-lg md:text-xl font-semibold text-foreground truncate"
              >
                {milestone.title}
              </motion.h1>
              <motion.p
                key={milestone.description}
                initial={{
                  y: -10,
                  opacity: 0
                }}
                animate={{
                  y: 0,
                  opacity: 1
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.2,
                  ease: "easeOut"
                }}
                className="text-sm text-muted-foreground truncate"
              >
                {milestone.description}
              </motion.p>
            </div>

            {/* Step Counter (Hidden on mobile) */}
            <div className="hidden sm:flex items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{currentStep}</span>
              <span className="mx-1">/</span>
              <span>{totalSteps}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            
            <div className="relative">
              <Progress
                value={progress}
                className="h-2 bg-muted"
                aria-label={`Onboarding progress: ${Math.round(progress)}% complete`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              
              {/* Animated progress indicator */}
              <motion.div
                initial={{
                  width: 0
                }}
                animate={{
                  width: `${progress}%`
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut"
                }}
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                style={{
                  boxShadow: progress > 0 ? '0 0 8px rgba(var(--primary), 0.3)' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
