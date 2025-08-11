-- Create indexes for security audit log table for better performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_organization_id ON public.security_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_success ON public.security_audit_log(success);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_org_event_time 
ON public.security_audit_log(organization_id, event_type, created_at DESC);

-- Create function to get security event statistics
CREATE OR REPLACE FUNCTION public.get_security_event_stats(
  org_id UUID DEFAULT NULL,
  hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
  event_type TEXT,
  total_count BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  last_occurrence TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    sal.event_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE sal.success = true) as success_count,
    COUNT(*) FILTER (WHERE sal.success = false) as failure_count,
    MAX(sal.created_at) as last_occurrence
  FROM public.security_audit_log sal
  WHERE 
    (org_id IS NULL OR sal.organization_id = org_id)
    AND sal.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY sal.event_type
  ORDER BY total_count DESC;
$$;

-- Create function to detect suspicious activity patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(
  org_id UUID DEFAULT NULL,
  hours_back INTEGER DEFAULT 1
)
RETURNS TABLE(
  user_id UUID,
  ip_address INET,
  failed_attempts BIGINT,
  event_types TEXT[],
  first_attempt TIMESTAMP WITH TIME ZONE,
  last_attempt TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    sal.user_id,
    sal.ip_address,
    COUNT(*) FILTER (WHERE sal.success = false) as failed_attempts,
    ARRAY_AGG(DISTINCT sal.event_type) as event_types,
    MIN(sal.created_at) as first_attempt,
    MAX(sal.created_at) as last_attempt
  FROM public.security_audit_log sal
  WHERE 
    (org_id IS NULL OR sal.organization_id = org_id)
    AND sal.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
    AND sal.success = false
  GROUP BY sal.user_id, sal.ip_address
  HAVING COUNT(*) FILTER (WHERE sal.success = false) >= 3
  ORDER BY failed_attempts DESC;
$$;