import React, { useMemo, useState, useCallback } from "react";
import { FixedSizeList as List, VariableSizeList } from "react-window";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Virtual list for large datasets
interface VirtualListProps<T> {
  items: T[];
  height: number;
  width?: number | string;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  className?: string;
  overscan?: number;
  onItemsRendered?: (startIndex: number, endIndex: number) => void;
}

export function VirtualList<T>({
  items,
  height,
  width = 300,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  onItemsRendered
}: VirtualListProps<T>) {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <div style={style}>
        {renderItem(item, index, style)}
      </div>
    );
  }, [items, renderItem]);

  const isVariableHeight = typeof itemHeight === 'function';

  if (isVariableHeight) {
    return (
      <VariableSizeList
        className={className}
        height={height}
        width={width}
        itemCount={items.length}
        itemSize={itemHeight as (index: number) => number}
        overscanCount={overscan}
        onItemsRendered={onItemsRendered ? ({ visibleStartIndex, visibleStopIndex }) => 
          onItemsRendered(visibleStartIndex, visibleStopIndex) : undefined}
      >
        {Row}
      </VariableSizeList>
    );
  }

  return (
    <List
      className={className}
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={itemHeight as number}
      overscanCount={overscan}
      onItemsRendered={onItemsRendered ? ({ visibleStartIndex, visibleStopIndex }) => 
        onItemsRendered(visibleStartIndex, visibleStopIndex) : undefined}
    >
      {Row}
    </List>
  );
}

// Progressive loading component
interface ProgressiveLoaderProps {
  children: React.ReactNode;
  loading?: boolean;
  skeleton?: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ProgressiveLoader({
  children,
  loading = false,
  skeleton,
  delay = 0,
  className
}: ProgressiveLoaderProps) {
  const [showContent, setShowContent] = useState(!loading && delay === 0);

  React.useEffect(() => {
    if (!loading && delay > 0) {
      const timer = setTimeout(() => setShowContent(true), delay);
      return () => clearTimeout(timer);
    } else if (!loading) {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [loading, delay]);

  if (loading || !showContent) {
    return (
      <div className={className}>
        {skeleton || <Skeleton className="h-32 w-full" />}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

// Optimized image component with lazy loading
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blur?: boolean;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  placeholder,
  blur = true,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}>
        Failed to load image
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            blur && "blur-sm"
          )}
        />
      )}
      
      <img
        {...props}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  { threshold = 0, root = null, rootMargin = '0%' }: IntersectionObserverInit = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  React.useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin]);

  return entry;
}

// Lazy loading container
interface LazyContainerProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  rootMargin?: string;
  onVisible?: () => void;
}

export function LazyContainer({
  children,
  placeholder,
  className,
  rootMargin = "100px",
  onVisible
}: LazyContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(ref, { rootMargin });
  const isVisible = !!entry?.isIntersecting;

  React.useEffect(() => {
    if (isVisible && onVisible) {
      onVisible();
    }
  }, [isVisible, onVisible]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (placeholder || <Skeleton className="h-32 w-full" />)}
    </div>
  );
}

// Debounced search hook
export function useDebouncedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  delay: number = 300
): T[] {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), delay);
    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return useMemo(() => {
    if (!debouncedTerm) return items;

    return items.filter(item =>
      searchFields.some(field =>
        String(item[field])
          .toLowerCase()
          .includes(debouncedTerm.toLowerCase())
      )
    );
  }, [items, debouncedTerm, searchFields]);
}

// Performance metrics hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    componentCount: number;
  }>({ renderTime: 0, componentCount: 0 });

  React.useEffect(() => {
    const startTime = performance.now();
    
    const updateMetrics = () => {
      const endTime = performance.now();
      setMetrics(prev => ({
        renderTime: endTime - startTime,
        componentCount: prev.componentCount + 1
      }));
    };

    // Use RAF to measure after render
    requestAnimationFrame(updateMetrics);
  });

  return metrics;
}