import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}
const stepConfig = [{
  label: 'Select Team',
  description: 'Choose team members',
  icon: Users
}, {
  label: 'Goal Details',
  description: 'Define goal & metrics',
  icon: FileText
}, {
  label: 'Schedule & Priority',
  description: 'Set timeline & priority',
  icon: Calendar
}, {
  label: 'Goal Preview',
  description: 'Review & confirm',
  icon: Check
}];
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  return <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6">
          {Array.from({
          length: totalSteps
        }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          const config = stepConfig[index];
          const Icon = config.icon;
          return <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <motion.div className={cn("relative w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2", isCompleted && "bg-primary border-primary text-primary-foreground shadow-lg", isCurrent && "bg-primary border-primary text-primary-foreground shadow-lg ring-4 ring-primary/20", isUpcoming && "bg-background border-border text-muted-foreground")} initial={false} animate={{
                scale: isCurrent ? 1.1 : 1,
                boxShadow: isCurrent ? "0 8px 25px rgba(0,0,0,0.15)" : "0 2px 10px rgba(0,0,0,0.1)"
              }} transition={{
                duration: 0.3
              }}>
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                    
                    {/* Pulse animation for current step */}
                    {isCurrent && <motion.div className="absolute inset-0 rounded-full border-2 border-primary" initial={{
                  scale: 1,
                  opacity: 1
                }} animate={{
                  scale: 1.5,
                  opacity: 0
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }} />}
                  </motion.div>
                  
                  <div className="mt-3 text-center">
                    <p className={cn("text-sm font-medium transition-colors", isCurrent ? "text-primary" : "text-muted-foreground")}>
                      {config.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-24">
                      {config.description}
                    </p>
                  </div>
                </div>
                
                {index < totalSteps - 1 && <div className="flex-1 mx-6 relative">
                    <div className="h-0.5 bg-border relative overflow-hidden rounded-full">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" initial={{
                  width: '0%'
                }} animate={{
                  width: stepNumber < currentStep ? '100%' : '0%'
                }} transition={{
                  duration: 0.5,
                  delay: 0.2
                }} />
                    </div>
                  </div>}
              </React.Fragment>;
        })}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all", "bg-primary border-primary text-primary-foreground")}>
              {currentStep > 1 ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{currentStep}</span>}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stepConfig[currentStep - 1]?.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {stepConfig[currentStep - 1]?.description}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {currentStep} of {totalSteps}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(currentStep / totalSteps * 100)}% complete
            </p>
          </div>
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" initial={{
          width: '0%'
        }} animate={{
          width: `${currentStep / totalSteps * 100}%`
        }} transition={{
          duration: 0.5
        }} />
        </div>
      </div>
      
      {/* Step Counter */}
      
    </div>;
};
export default ProgressIndicator;