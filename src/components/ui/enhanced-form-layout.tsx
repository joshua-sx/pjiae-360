import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileFormStep, MobileInput, MobileTextarea, MobileSelect, MobileFormCard } from "@/components/ui/mobile-form-components";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { cn } from "@/lib/utils";

// Enhanced form layout for mobile-first design
interface EnhancedFormLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function EnhancedFormLayout({ 
  children, 
  title, 
  description, 
  className 
}: EnhancedFormLayoutProps) {
  const { isMobile } = useMobileResponsive();
  
  return (
    <div className={cn(
      "space-y-6",
      isMobile ? "px-4" : "px-6",
      isMobile ? "py-4" : "py-6",
      className
    )}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h1 className={cn(
              "font-semibold",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        "space-y-4",
        isMobile ? "space-y-4" : "space-y-6"
      )}>
        {children}
      </div>
    </div>
  );
}

// Enhanced button component with mobile optimizations
interface MobileOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function MobileOptimizedButton({ 
  variant = "default",
  size = "default", 
  fullWidth = false,
  className,
  children,
  ...props 
}: MobileOptimizedButtonProps) {
  const { isMobile } = useMobileResponsive();
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        isMobile && "h-12 text-base", // Larger touch targets on mobile
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Form section wrapper with responsive spacing
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className 
}: FormSectionProps) {
  const { isMobile } = useMobileResponsive();
  
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className={isMobile ? "pb-4" : "pb-6"}>
          {title && (
            <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
              {title}
            </CardTitle>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className={isMobile ? "space-y-4" : "space-y-6"}>
        {children}
      </CardContent>
    </Card>
  );
}

// Responsive grid layout
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = 2, 
  className 
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useMobileResponsive();
  
  // Use static classes to avoid dynamic Tailwind generation issues
  const getGridClass = () => {
    if (isMobile) return "grid-cols-1";
    if (isTablet) return columns > 2 ? "grid-cols-2" : `grid-cols-${Math.min(columns, 2)}`;
    
    // Desktop: use full columns but with static classes
    switch (columns) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };
  
  return (
    <div 
      className={cn(
        "grid gap-4",
        getGridClass(),
        className
      )}
    >
      {children}
    </div>
  );
}