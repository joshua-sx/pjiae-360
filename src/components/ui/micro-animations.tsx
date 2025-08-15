import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Animation variants for common use cases
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Reusable animated components
interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: keyof typeof animationVariants;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: boolean;
}

const animationVariants = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInRight,
  slideInLeft,
  staggerContainer
};

export function AnimatedContainer({ 
  children, 
  variant = "fadeInUp", 
  className,
  delay = 0,
  duration = 0.3,
  stagger = false
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : animationVariants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay, duration }}
    >
      {stagger ? (
        <>
          {React.Children.map(children, (child, index) => (
            <motion.div key={index} variants={staggerItem}>
              {child}
            </motion.div>
          ))}
        </>
      ) : (
        children
      )}
    </motion.div>
  );
}

// Animated list component
interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({ children, className, staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Animated button with hover and tap effects
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "ghost" | "outline";
}

export function AnimatedButton({ 
  children, 
  onClick, 
  className, 
  disabled = false,
  variant = "default"
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "border border-input hover:bg-accent hover:text-accent-foreground": variant === "outline"
        },
        "h-10 px-4 py-2",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
}

// Loading dots animation
export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Hover card animation
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  scaleOnHover?: boolean;
  shadowOnHover?: boolean;
}

export function HoverCard({ 
  children, 
  className, 
  scaleOnHover = true, 
  shadowOnHover = true 
}: HoverCardProps) {
  return (
    <motion.div
      className={cn("transition-all duration-200", className)}
      whileHover={{
        scale: scaleOnHover ? 1.02 : 1,
        boxShadow: shadowOnHover ? "0 8px 30px rgba(0, 0, 0, 0.12)" : undefined
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}