
export interface EnhancedAuditLogEntry {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type: string;
  event_details: any;
  ip_address: unknown;
  user_agent: unknown;
  success: boolean;
  created_at: string;
  
  // Enhanced snapshot fields
  actor_name: string | null;
  actor_email: string | null;
  actor_role_name: string | null;
  actor_division_name: string | null;
  actor_department_name: string | null;
  object_type: string | null;
  object_id: string | null;
  object_name: string | null;
  action_code: string | null;
  outcome: string | null;
  metadata: any;
  occurred_at: string;
}

export interface AuditFiltersState {
  search: string;
  roles: string[];
  divisions: string[];
  departments: string[];
  actions: string[];
  dateFrom: string;
  dateTo: string;
  outcome: string;
}
