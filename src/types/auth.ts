import type { Database } from '@/integrations/supabase/types';

// Centralized AppRole type - single source of truth
export type AppRole = Database['public']['Enums']['app_role'];

export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}