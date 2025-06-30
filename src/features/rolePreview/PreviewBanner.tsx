
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreview } from '@/features/rolePreview/contexts/PreviewContext';
import { ROLE_LABELS } from '@/shared/types/roles';

export function PreviewBanner() {
  const { previewRole, exitPreview, isInPreview } = usePreview();

  if (!isInPreview || !previewRole) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <span className="text-amber-800 font-medium">
          📣 Previewing as <strong>{ROLE_LABELS[previewRole]}</strong> (read-only mode)
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={exitPreview}
        className="text-amber-800 hover:bg-amber-200"
      >
        <X className="w-4 h-4 mr-1" />
        Exit Preview
      </Button>
    </div>
  );
}
