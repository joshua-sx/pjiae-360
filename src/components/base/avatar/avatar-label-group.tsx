
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarLabelGroupProps {
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  title: string;
  subtitle?: string;
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

export function AvatarLabelGroup({
  size = 'md',
  src,
  title,
  subtitle,
  status,
  className
}: AvatarLabelGroupProps): JSX.Element {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage src={src} alt={title} />
          <AvatarFallback className="text-sm font-medium">
            {title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {status && (
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
            status === 'online' && "bg-green-500",
            status === 'away' && "bg-yellow-500",
            status === 'offline' && "bg-gray-400"
          )} />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <div className={cn("font-medium text-foreground truncate", textSizeClasses[size])}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
