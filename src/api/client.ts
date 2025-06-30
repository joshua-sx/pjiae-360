
import { toast } from '@/hooks/use-toast';

// Global flag to track preview mode for API calls
let isPreviewMode = false;
let currentPreviewRole: string | null = null;

export function setPreviewMode(enabled: boolean, role?: string) {
  isPreviewMode = enabled;
  currentPreviewRole = enabled ? role || null : null;
}

// HTTP interceptor for fetch requests
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const headers = new Headers(init?.headers);
  
  if (isPreviewMode) {
    headers.set('X-Preview-Mode', 'true');
    if (currentPreviewRole) {
      headers.set('X-Preview-Role', currentPreviewRole);
    }
  }

  const response = await originalFetch(input, {
    ...init,
    headers,
  });

  // Handle preview mode errors
  if (!response.ok && isPreviewMode) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const errorData = await response.clone().json();
        if (errorData.code === 'PREVIEW_READ_ONLY') {
          toast({
            title: "Action Blocked",
            description: "Cannot modify data in preview mode",
            variant: "destructive",
          });
          throw new Error('Preview mode: read-only operation blocked');
        }
      } catch (parseError) {
        // Continue with normal error handling if JSON parsing fails
      }
    }
  }

  return response;
};

export { originalFetch };
