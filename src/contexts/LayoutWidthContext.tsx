import React, { createContext, useContext, useState } from 'react';

type ContainerSize = 'narrow' | 'standard' | 'wide' | 'full';

interface LayoutWidthContextType {
  contentWidth: ContainerSize;
  setContentWidth: (width: ContainerSize) => void;
}

const LayoutWidthContext = createContext<LayoutWidthContextType | undefined>(undefined);

interface LayoutWidthProviderProps {
  children: React.ReactNode;
  defaultWidth?: ContainerSize;
}

export function LayoutWidthProvider({ 
  children, 
  defaultWidth = 'wide' 
}: LayoutWidthProviderProps) {
  const [contentWidth, setContentWidth] = useState<ContainerSize>(defaultWidth);

  return (
    <LayoutWidthContext.Provider value={{ contentWidth, setContentWidth }}>
      {children}
    </LayoutWidthContext.Provider>
  );
}

export function useLayoutWidth() {
  const context = useContext(LayoutWidthContext);
  if (context === undefined) {
    throw new Error('useLayoutWidth must be used within a LayoutWidthProvider');
  }
  return context;
}