import React from "react";

import { cn } from "@/lib/utils";

interface ComponentNameProps {
  children?: React.ReactNode;
  className?: string;
}

export const ComponentName = ({ children, className }: ComponentNameProps) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};