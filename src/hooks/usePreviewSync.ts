
import { useEffect } from 'react';
import { usePreview } from '@/contexts/PreviewContext';
import { setPreviewMode } from '@/lib/api';

export function usePreviewSync() {
  const { isInPreview, previewRole } = usePreview();

  useEffect(() => {
    setPreviewMode(isInPreview, previewRole || undefined);
  }, [isInPreview, previewRole]);
}
