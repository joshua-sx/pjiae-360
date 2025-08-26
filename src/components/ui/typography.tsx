import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Display Text Components
export function DisplayLg({ children, className }: TypographyProps) {
  return <h1 className={cn("text-display-lg", className)}>{children}</h1>;
}

export function DisplayMd({ children, className }: TypographyProps) {
  return <h1 className={cn("text-display-md", className)}>{children}</h1>;
}

export function DisplaySm({ children, className }: TypographyProps) {
  return <h1 className={cn("text-display-sm", className)}>{children}</h1>;
}

// Heading Components
export function HeadingLg({ children, className }: TypographyProps) {
  return <h2 className={cn("text-heading-lg", className)}>{children}</h2>;
}

export function HeadingMd({ children, className }: TypographyProps) {
  return <h3 className={cn("text-heading-md", className)}>{children}</h3>;
}

export function HeadingSm({ children, className }: TypographyProps) {
  return <h4 className={cn("text-heading-sm", className)}>{children}</h4>;
}

// Body Text Components
export function BodyLg({ children, className }: TypographyProps) {
  return <p className={cn("text-body-lg", className)}>{children}</p>;
}

export function Body({ children, className }: TypographyProps) {
  return <p className={cn("text-body", className)}>{children}</p>;
}

export function BodySm({ children, className }: TypographyProps) {
  return <p className={cn("text-body-sm", className)}>{children}</p>;
}

// Utility Text Components
export function Caption({ children, className }: TypographyProps) {
  return <p className={cn("text-caption text-muted-foreground", className)}>{children}</p>;
}

export function Label({ children, className }: TypographyProps) {
  return <span className={cn("text-label", className)}>{children}</span>;
}