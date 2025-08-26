
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

import { StatusIndicator } from "@/components/ui/status-indicator";

export function StatCard({ title, value, description, icon: Icon, iconColor, loading = false }: StatCardProps) {
  // Determine semantic variant from iconColor
  const getVariant = (color?: string) => {
    if (!color) return 'neutral';
    if (color.includes('green')) return 'success';
    if (color.includes('blue')) return 'info';
    if (color.includes('purple')) return 'primary';
    if (color.includes('orange')) return 'warning';
    if (color.includes('red')) return 'error';
    return 'neutral';
  };

  const variant = getVariant(iconColor);

  return (
    <Card className="touch-manipulation">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
        <CardTitle className="text-label truncate flex-1 min-w-0 pr-2">{title}</CardTitle>
        <StatusIndicator variant={variant} showIcon={true} className="flex-shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </StatusIndicator>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-heading-md sm:text-heading-lg font-bold break-all">{value}</div>
        )}
        {description && (
          loading ? (
            <Skeleton className="h-3 w-24" />
          ) : (
            <p className="text-caption text-muted-foreground mt-1 truncate">{description}</p>
          )
        )}
      </CardContent>
    </Card>
  );
}
