/**
 * Security headers for edge functions
 */

export const securityHeaders = {
  // CORS headers
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  
  // Security headers
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  
  // Cache control
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

export function createResponse(
  body: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...securityHeaders,
        ...additionalHeaders,
      },
    }
  );
}

export function createErrorResponse(
  message: string,
  status: number = 500,
  additionalHeaders: Record<string, string> = {}
): Response {
  return createResponse(
    { error: message, timestamp: new Date().toISOString() },
    status,
    additionalHeaders
  );
}

export function handleOptions(): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}