import React from "react";
import { AnimatedContainer, AnimatedList, HoverCard, PageTransition } from "@/components/ui/micro-animations";
import { AccessibleFormField, ScreenReaderOnly, FocusTrap } from "@/components/ui/accessibility";
import { ProgressiveLoader, LazyContainer, OptimizedImage } from "@/components/ui/performance-optimizations";
import { useKeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import { cn } from "@/lib/utils";

// Enhanced dashboard layout with all UX improvements
interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function EnhancedDashboardLayout({
  children,
  title,
  description,
  actions,
  className,
  loading = false
}: EnhancedDashboardLayoutProps) {
  // Enable keyboard shortcuts
  useKeyboardShortcuts({ enabled: true });

  return (
    <PageTransition>
      <div className={cn("space-y-6", className)}>
        <ScreenReaderOnly>
          <h1>Dashboard - {title || "Main"}</h1>
        </ScreenReaderOnly>

        {(title || description || actions) && (
          <AnimatedContainer variant="fadeInUp">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </AnimatedContainer>
        )}

        <ProgressiveLoader loading={loading} delay={100}>
          <div id="main-content" role="main">
            {children}
          </div>
        </ProgressiveLoader>
      </div>
    </PageTransition>
  );
}

// Enhanced card component with micro-interactions
interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export function EnhancedCard({
  children,
  title,
  description,
  interactive = false,
  onClick,
  className,
  loading = false
}: EnhancedCardProps) {
  const CardWrapper = interactive ? HoverCard : "div";

  return (
    <ProgressiveLoader loading={loading}>
      <CardWrapper
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          interactive && "cursor-pointer transition-all duration-200",
          className
        )}
        onClick={onClick}
        scaleOnHover={interactive}
        shadowOnHover={interactive}
      >
        <div className="p-6">
          {(title || description) && (
            <AnimatedContainer variant="fadeInUp" delay={0.1}>
              <div className="space-y-1.5 mb-4">
                {title && (
                  <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </AnimatedContainer>
          )}

          <AnimatedContainer variant="fadeInUp" delay={0.2}>
            {children}
          </AnimatedContainer>
        </div>
      </CardWrapper>
    </ProgressiveLoader>
  );
}

// Enhanced list component with staggered animations
interface EnhancedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  virtual?: boolean;
  itemHeight?: number;
}

export function EnhancedList<T>({
  items,
  renderItem,
  className,
  emptyMessage = "No items found",
  loading = false,
  virtual = false,
  itemHeight = 60
}: EnhancedListProps<T>) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <AnimatedContainer variant="fadeIn" className={className}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </AnimatedContainer>
    );
  }

  if (virtual && items.length > 100) {
    // Use virtual scrolling for large lists
    const VirtualList = require("@/components/ui/performance-optimizations").VirtualList;
    return (
      <VirtualList
        items={items}
        height={400}
        itemHeight={itemHeight}
        renderItem={(item: T, index: number, style: React.CSSProperties) => (
          <div style={style}>{renderItem(item, index)}</div>
        )}
        className={className}
      />
    );
  }

  return (
    <AnimatedList className={cn("space-y-3", className)} staggerDelay={0.05}>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </AnimatedList>
  );
}

// Enhanced image gallery with lazy loading
interface EnhancedImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    placeholder?: string;
  }>;
  className?: string;
  columns?: number;
}

export function EnhancedImageGallery({
  images,
  className,
  columns = 3
}: EnhancedImageGalleryProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        {
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
          "grid-cols-1 md:grid-cols-2": columns === 2,
          "grid-cols-1": columns === 1
        },
        className
      )}
    >
      {images.map((image, index) => (
        <LazyContainer
          key={index}
          className="aspect-square rounded-lg overflow-hidden"
          rootMargin="100px"
        >
          <HoverCard>
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              placeholder={image.placeholder}
              className="w-full h-full object-cover"
            />
          </HoverCard>
        </LazyContainer>
      ))}
    </div>
  );
}

// Enhanced form with accessibility improvements
interface EnhancedFormProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function EnhancedForm({
  children,
  title,
  description,
  onSubmit,
  className
}: EnhancedFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)} noValidate>
      {(title || description) && (
        <AnimatedContainer variant="fadeInUp">
          <div className="space-y-2">
            {title && (
              <h2 className="text-xl font-semibold">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </AnimatedContainer>
      )}

      <AnimatedContainer variant="fadeInUp" delay={0.1}>
        {children}
      </AnimatedContainer>
    </form>
  );
}