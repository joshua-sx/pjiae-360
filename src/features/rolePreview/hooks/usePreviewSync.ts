
import { useEffect } from 'react';
import { usePreview } from '@/features/rolePreview/contexts/PreviewContext';
import { setPreviewMode } from '@/api/client';

export function usePreviewSync() {
  const { isInPreview, previewRole } = usePreview();

  useEffect(() => {
    setPreviewMode(isInPreview, previewRole || undefined);
  }, [isInPreview, previewRole]);
}
