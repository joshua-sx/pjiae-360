
import { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePreview } from '@/features/rolePreview/contexts/PreviewContext';
import { useRole } from '@/shared/hooks/useRole';
import { UserRole, ROLE_LABELS } from '@/shared/types/roles';

const AVAILABLE_ROLES: UserRole[] = ['manager', 'supervisor', 'employee', 'hr', 'reviewer'];

export function RoleSwitcher() {
  const { previewRole, enterPreview, exitPreview, isInPreview } = usePreview();
  const { canPreview } = useRole();

  if (!canPreview) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isInPreview ? "secondary" : "ghost"}
          size="sm"
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {isInPreview ? `Previewing: ${ROLE_LABELS[previewRole!]}` : 'Preview Role'}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Role Preview</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isInPreview && (
          <>
            <DropdownMenuItem onClick={exitPreview} className="text-amber-600">
              Exit Preview Mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {AVAILABLE_ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => enterPreview(role)}
            className={previewRole === role ? 'bg-accent' : ''}
          >
            {ROLE_LABELS[role]}
            {previewRole === role && <span className="ml-auto">•</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
