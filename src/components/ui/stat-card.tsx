
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, description, icon: Icon, iconColor = "text-muted-foreground" }: StatCardProps) {
  return (
    <Card className="touch-manipulation">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
        <CardTitle className="text-sm sm:text-sm font-medium truncate flex-1 min-w-0 pr-2">{title}</CardTitle>
        <Icon className={`h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 ${iconColor}`} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl sm:text-2xl font-bold break-all">{value}</div>
        {description && (
          <p className="text-xs sm:text-xs text-muted-foreground mt-1 truncate">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
