import React from 'react';
import { Container } from '@/components/ui/Container';
import { useLayoutWidth } from '@/contexts/LayoutWidthContext';
import { LiveRegion } from '@/components/ui/accessibility';
import { cn } from '@/lib/utils';

type ContainerSize = 'narrow' | 'standard' | 'wide' | 'full';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: ContainerSize;
  fullBleedScroll?: boolean;
}

export function PageContainer({ 
  children, 
  className,
  size,
  fullBleedScroll = false
}: PageContainerProps) {
  const { contentWidth, setContentWidth } = useLayoutWidth();
  
  // Use provided size or fall back to context width
  const containerSize = size || contentWidth;
  
  // Update context if size is explicitly provided
  React.useEffect(() => {
    if (size && size !== contentWidth) {
      setContentWidth(size);
    }
  }, [size, contentWidth, setContentWidth]);

  return (
    <Container 
      size={containerSize} 
      className={className}
      fullBleedScroll={fullBleedScroll}
    >
      <LiveRegion politeness="polite" className="sr-only">
        <span></span>
      </LiveRegion>
      {children}
    </Container>
  );
}