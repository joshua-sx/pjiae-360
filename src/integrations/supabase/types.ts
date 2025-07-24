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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appraisal_appraisers: {
        Row: {
          appraisal_id: string
          appraiser_id: string
          assigned_by: string
          comments: string | null
          created_at: string
          id: string
          is_primary: boolean
          organization_id: string
          signed_at: string | null
          status: string
        }
        Insert: {
          appraisal_id: string
          appraiser_id: string
          assigned_by: string
          comments?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          organization_id: string
          signed_at?: string | null
          status?: string
        }
        Update: {
          appraisal_id?: string
          appraiser_id?: string
          assigned_by?: string
          comments?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          organization_id?: string
          signed_at?: string | null
          status?: string
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
          {
            foreignKeyName: "appraisal_appraisers_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_appraisers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisals: {
        Row: {
          acknowledged_at: string | null
          comments: string | null
          created_at: string
          cycle_id: string
          deleted_at: string | null
          employee_comments: string | null
          employee_id: string
          id: string
          manager_comments: string | null
          organization_id: string
          overall_score: number | null
          period_id: string
          status: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          comments?: string | null
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          employee_comments?: string | null
          employee_id: string
          id?: string
          manager_comments?: string | null
          organization_id: string
          overall_score?: number | null
          period_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          comments?: string | null
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          employee_comments?: string | null
          employee_id?: string
          id?: string
          manager_comments?: string | null
          organization_id?: string
          overall_score?: number | null
          period_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
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
          {
            foreignKeyName: "appraisals_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          context: Json | null
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          context?: Json | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          context?: Json | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      competencies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
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
      competency_ratings: {
        Row: {
          appraisal_id: string
          appraiser_id: string
          comment: string | null
          competency_id: string
          created_at: string
          id: string
          organization_id: string
          score: number
        }
        Insert: {
          appraisal_id: string
          appraiser_id: string
          comment?: string | null
          competency_id: string
          created_at?: string
          id?: string
          organization_id: string
          score: number
        }
        Update: {
          appraisal_id?: string
          appraiser_id?: string
          comment?: string | null
          competency_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "competency_ratings_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_ratings_appraiser_id_fkey"
            columns: ["appraiser_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_ratings_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string
          created_by: string
          end_date: string
          frequency: string
          id: string
          name: string
          organization_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date: string
          frequency: string
          id?: string
          name: string
          organization_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string
          frequency?: string
          id?: string
          name?: string
          organization_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
        }
        Insert: {
          created_at?: string
          division_id?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          division_id?: string | null
          id?: string
          name?: string
          organization_id?: string
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
      division_goals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          cycle_id: string
          description: string | null
          division_id: string
          id: string
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          cycle_id: string
          description?: string | null
          division_id: string
          id?: string
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          cycle_id?: string
          description?: string | null
          division_id?: string
          id?: string
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "division_goals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "division_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "division_goals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "division_goals_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "division_goals_organization_id_fkey"
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
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
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
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          department_id: string | null
          division_id: string | null
          email: string
          first_name: string | null
          hire_date: string | null
          id: string
          invitation_accepted_at: string | null
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          invitation_token: string | null
          invited_at: string | null
          job_title: string | null
          last_name: string | null
          manager_id: string | null
          name: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          organization_id: string
          role_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          department_id?: string | null
          division_id?: string | null
          email: string
          first_name?: string | null
          hire_date?: string | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          job_title?: string | null
          last_name?: string | null
          manager_id?: string | null
          name?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          organization_id: string
          role_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          department_id?: string | null
          division_id?: string | null
          email?: string
          first_name?: string | null
          hire_date?: string | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          job_title?: string | null
          last_name?: string | null
          manager_id?: string | null
          name?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          organization_id?: string
          role_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_ratings: {
        Row: {
          appraisal_id: string
          appraiser_id: string
          comment: string | null
          created_at: string
          goal_id: string
          id: string
          organization_id: string
          score: number
        }
        Insert: {
          appraisal_id: string
          appraiser_id: string
          comment?: string | null
          created_at?: string
          goal_id: string
          id?: string
          organization_id: string
          score: number
        }
        Update: {
          appraisal_id?: string
          appraiser_id?: string
          comment?: string | null
          created_at?: string
          goal_id?: string
          id?: string
          organization_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_ratings_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_ratings_appraiser_id_fkey"
            columns: ["appraiser_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_ratings_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          cycle_id: string
          deleted_at: string | null
          description: string | null
          division_goal_id: string | null
          due_date: string | null
          employee_id: string
          id: string
          manager_id: string
          organization_id: string
          period_id: string
          progress: number | null
          status: string
          success_criteria: string | null
          supervisor_id: string | null
          title: string
          type: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          cycle_id: string
          deleted_at?: string | null
          description?: string | null
          division_goal_id?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          manager_id: string
          organization_id: string
          period_id: string
          progress?: number | null
          status?: string
          success_criteria?: string | null
          supervisor_id?: string | null
          title: string
          type: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          cycle_id?: string
          deleted_at?: string | null
          description?: string | null
          division_goal_id?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          manager_id?: string
          organization_id?: string
          period_id?: string
          progress?: number | null
          status?: string
          success_criteria?: string | null
          supervisor_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "goals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_division_goal_id_fkey"
            columns: ["division_goal_id"]
            isOneToOne: false
            referencedRelation: "division_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_manager_id_fkey"
            columns: ["manager_id"]
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
          {
            foreignKeyName: "goals_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      periods: {
        Row: {
          created_at: string
          cycle_id: string
          end_date: string
          id: string
          name: string
          organization_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          end_date: string
          id?: string
          name: string
          organization_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          end_date?: string
          id?: string
          name?: string
          organization_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "periods_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          action_type: string
          assigned_by: string | null
          created_at: string | null
          id: string
          new_role: Database["public"]["Enums"]["app_role"] | null
          old_role: Database["public"]["Enums"]["app_role"] | null
          organization_id: string
          profile_id: string
          reason: string | null
        }
        Insert: {
          action_type: string
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          organization_id: string
          profile_id: string
          reason?: string | null
        }
        Update: {
          action_type?: string
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          organization_id?: string
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_audit_log_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "employee_info"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          _profile_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _reason?: string
        }
        Returns: boolean
      }
      determine_role_from_position: {
        Args: { _profile_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_audit_history: {
        Args: { _table_name: string; _record_id: string; _limit?: number }
        Returns: {
          id: string
          action: string
          old_values: Json
          new_values: Json
          user_id: string
          created_at: string
          context: Json
        }[]
      }
      get_current_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_direct_reports: {
        Args: { _profile_id: string }
        Returns: {
          profile_id: string
        }[]
      }
      get_division_employees: {
        Args: { _profile_id: string }
        Returns: {
          profile_id: string
        }[]
      }
      get_recent_audit_activity: {
        Args: { _limit?: number; _table_filter?: string; _user_filter?: string }
        Returns: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_values: Json
          new_values: Json
          user_id: string
          created_at: string
          context: Json
        }[]
      }
      get_role_audit_history: {
        Args: { _profile_id: string; _limit?: number }
        Returns: {
          id: string
          old_role: Database["public"]["Enums"]["app_role"]
          new_role: Database["public"]["Enums"]["app_role"]
          action_type: string
          assigned_by_name: string
          reason: string
          created_at: string
        }[]
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      permanent_delete_old_records: {
        Args: { _table_name: string; _days_old?: number }
        Returns: number
      }
      restore_record: {
        Args: { _table_name: string; _record_id: string }
        Returns: boolean
      }
      soft_delete_record: {
        Args: { _table_name: string; _record_id: string }
        Returns: boolean
      }
      sync_user_roles: {
        Args: { _profile_id: string; _assigned_by?: string }
        Returns: undefined
      }
      validate_role_assignment: {
        Args: {
          _profile_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _assigned_by: string
        }
        Returns: boolean
      }
      validate_role_hierarchy: {
        Args: { _manager_id: string; _employee_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "director" | "manager" | "supervisor" | "employee"
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
    },
  },
} as const
