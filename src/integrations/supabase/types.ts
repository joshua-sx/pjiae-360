export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      appraisal_appraisers: {
        Row: {
          appraisal_id: string
          appraiser_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          role: string
        }
        Insert: {
          appraisal_id: string
          appraiser_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role?: string
        }
        Update: {
          appraisal_id?: string
          appraiser_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_appraisers_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_appraisers_appraiser_id_fkey"
            columns: ["appraiser_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisal_competencies: {
        Row: {
          appraisal_id: string
          competency_id: string
          created_at: string
          id: string
          score: number | null
        }
        Insert: {
          appraisal_id: string
          competency_id: string
          created_at?: string
          id?: string
          score?: number | null
        }
        Update: {
          appraisal_id?: string
          competency_id?: string
          created_at?: string
          id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_competencies_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisal_cycles: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          organization_id: string
          start_date: string
          status: Database["public"]["Enums"]["cycle_status"]
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          organization_id: string
          start_date: string
          status?: Database["public"]["Enums"]["cycle_status"]
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          organization_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["cycle_status"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisals: {
        Row: {
          created_at: string
          cycle_id: string
          development_goals: string | null
          employee_id: string
          final_rating: number | null
          id: string
          manager_review_completed: boolean
          organization_id: string
          overall_feedback: string | null
          phase: Database["public"]["Enums"]["appraisal_phase"]
          self_assessment_completed: boolean
          status: Database["public"]["Enums"]["appraisal_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          development_goals?: string | null
          employee_id: string
          final_rating?: number | null
          id?: string
          manager_review_completed?: boolean
          organization_id: string
          overall_feedback?: string | null
          phase?: Database["public"]["Enums"]["appraisal_phase"]
          self_assessment_completed?: boolean
          status?: Database["public"]["Enums"]["appraisal_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          development_goals?: string | null
          employee_id?: string
          final_rating?: number | null
          id?: string
          manager_review_completed?: boolean
          organization_id?: string
          overall_feedback?: string | null
          phase?: Database["public"]["Enums"]["appraisal_phase"]
          self_assessment_completed?: boolean
          status?: Database["public"]["Enums"]["appraisal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "appraisal_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          appraisal_id: string
          details: string | null
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          appraisal_id: string
          details?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          appraisal_id?: string
          details?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      competencies: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_phases: {
        Row: {
          created_at: string
          cycle_id: string
          end_date: string
          goal_window_id: string | null
          id: string
          phase: Database["public"]["Enums"]["appraisal_phase"]
          start_date: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          end_date: string
          goal_window_id?: string | null
          id?: string
          phase: Database["public"]["Enums"]["appraisal_phase"]
          start_date: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          end_date?: string
          goal_window_id?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["appraisal_phase"]
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_phases_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "appraisal_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_phases_goal_window_id_fkey"
            columns: ["goal_window_id"]
            isOneToOne: false
            referencedRelation: "goal_setting_windows"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          division_id: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          division_id?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          division_id?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_info: {
        Row: {
          created_at: string
          department_id: string | null
          division_id: string | null
          employee_number: string | null
          hire_date: string | null
          id: string
          job_title: string | null
          manager_id: string | null
          organization_id: string
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          division_id?: string | null
          employee_number?: string | null
          hire_date?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          division_id?: string | null
          employee_number?: string | null
          hire_date?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_info_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_info_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_info_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_info_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          employee_id: string
          goal_id: string
          id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          employee_id: string
          goal_id: string
          id?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          employee_id?: string
          goal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_assignments_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_setting_windows: {
        Row: {
          created_at: string
          cycle_id: string
          end_date: string
          id: string
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          end_date: string
          id?: string
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          assigned_count: number | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          organization_id: string
          priority: string
          progress: number
          start_date: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_count?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          organization_id: string
          priority?: string
          progress?: number
          start_date: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_count?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          organization_id?: string
          priority?: string
          progress?: number
          start_date?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          failed_records: number
          id: string
          organization_id: string
          status: string
          successful_records: number
          total_records: number
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          failed_records?: number
          id?: string
          organization_id: string
          status?: string
          successful_records?: number
          total_records?: number
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          failed_records?: number
          id?: string
          organization_id?: string
          status?: string
          successful_records?: number
          total_records?: number
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
        ]
      }
      import_mappings: {
        Row: {
          batch_id: string
          created_at: string
          csv_column: string
          field_name: string
          id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          csv_column: string
          field_name: string
          id?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          csv_column?: string
          field_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_mappings_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_drafts: {
        Row: {
          created_at: string
          current_step: number
          draft_data: Json
          entry_method: string | null
          expires_at: string
          id: string
          last_saved_at: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          draft_data?: Json
          entry_method?: string | null
          expires_at?: string
          id?: string
          last_saved_at?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          draft_data?: Json
          entry_method?: string | null
          expires_at?: string
          id?: string
          last_saved_at?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          status: Database["public"]["Enums"]["org_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
        }
        Relationships: []
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          organization_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      signatures: {
        Row: {
          appraisal_id: string
          created_at: string | null
          id: string
          role: string
          signature_data: string
          user_id: string
        }
        Insert: {
          appraisal_id: string
          created_at?: string | null
          id?: string
          role: string
          signature_data: string
          user_id: string
        }
        Update: {
          appraisal_id?: string
          created_at?: string | null
          id?: string
          role?: string
          signature_data?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role_secure: {
        Args: {
          _target_user_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _reason?: string
        }
        Returns: Json
      }
      cleanup_expired_drafts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_active_draft: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          current_step: number
          draft_data: Json
          entry_method: string | null
          expires_at: string
          id: string
          last_saved_at: string
          organization_id: string | null
          user_id: string
        }[]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "director" | "manager" | "supervisor" | "employee"
      appraisal_phase: "goal_setting" | "mid_term" | "year_end"
      appraisal_status: "draft" | "in_progress" | "completed" | "approved"
      cycle_status: "draft" | "active" | "completed"
      org_status: "active" | "inactive"
      user_status: "active" | "inactive" | "pending" | "invited"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "director", "manager", "supervisor", "employee"],
      appraisal_phase: ["goal_setting", "mid_term", "year_end"],
      appraisal_status: ["draft", "in_progress", "completed", "approved"],
      cycle_status: ["draft", "active", "completed"],
      org_status: ["active", "inactive"],
      user_status: ["active", "inactive", "pending", "invited"],
    },
  },
} as const
