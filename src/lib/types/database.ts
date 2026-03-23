// Gerado via: supabase gen types typescript --local > src/lib/types/database.ts
// Regenerar após alterações no schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          email: string
          plan_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          email: string
          plan_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          email?: string
          plan_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          name: string
          slug: string
          created_by: string
          deck_type: string
          custom_deck: Json | null
          settings: Json
          status: string
          jira_sprint_id: string | null
          jira_board_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_by: string
          deck_type?: string
          custom_deck?: Json | null
          settings?: Json
          status?: string
          jira_sprint_id?: string | null
          jira_board_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          deck_type?: string
          custom_deck?: Json | null
          settings?: Json
          status?: string
          jira_sprint_id?: string | null
          jira_board_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      issues: {
        Row: {
          id: string
          room_id: string
          title: string
          description: string | null
          jira_issue_key: string | null
          jira_issue_id: string | null
          position: number
          status: string
          final_estimate: number | null
          estimate_unit: string
          round_count: number
          jira_status: string | null
          issue_type: string | null
          classification: string | null
          criticality: string | null
          assignee_name: string | null
          reporter_name: string | null
          deadline: string | null
          spent_hours: number | null
          impedimento: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          title: string
          description?: string | null
          jira_issue_key?: string | null
          jira_issue_id?: string | null
          position?: number
          status?: string
          final_estimate?: number | null
          estimate_unit?: string
          round_count?: number
          jira_status?: string | null
          issue_type?: string | null
          classification?: string | null
          criticality?: string | null
          assignee_name?: string | null
          reporter_name?: string | null
          deadline?: string | null
          spent_hours?: number | null
          impedimento?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          position?: number
          status?: string
          final_estimate?: number | null
          round_count?: number
          jira_status?: string | null
          issue_type?: string | null
          classification?: string | null
          criticality?: string | null
          assignee_name?: string | null
          reporter_name?: string | null
          deadline?: string | null
          spent_hours?: number | null
          impedimento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          value: number | null
          round: number
          voted_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          value?: number | null
          round?: number
          voted_at?: string
        }
        Update: {
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      jira_connections: {
        Row: {
          id: string
          user_id: string
          cloud_id: string
          site_name: string
          access_token: string
          refresh_token: string
          token_expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cloud_id: string
          site_name: string
          access_token: string
          refresh_token: string
          token_expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          refresh_token?: string
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jira_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      session_history: {
        Row: {
          id: string
          room_id: string
          completed_at: string
          total_issues: number | null
          total_estimated: number | null
          average_rounds: number | null
          total_hours_estimated: number | null
          summary: Json | null
          participants_count: number | null
          deck_type: string | null
          vote_analytics: Json | null
        }
        Insert: {
          id?: string
          room_id: string
          completed_at?: string
          total_issues?: number | null
          total_estimated?: number | null
          average_rounds?: number | null
          total_hours_estimated?: number | null
          summary?: Json | null
          participants_count?: number | null
          deck_type?: string | null
          vote_analytics?: Json | null
        }
        Update: {
          total_issues?: number | null
          total_estimated?: number | null
          average_rounds?: number | null
          total_hours_estimated?: number | null
          summary?: Json | null
          participants_count?: number | null
          deck_type?: string | null
          vote_analytics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "session_history_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      plans: {
        Row: {
          id: string
          name: string
          price_monthly_brl: number | null
          price_annual_brl: number | null
          max_history_sessions: number | null
          history_retention_days: number | null
          features: Json
          created_at: string
        }
        Insert: {
          id: string
          name: string
          price_monthly_brl?: number | null
          price_annual_brl?: number | null
          max_history_sessions?: number | null
          history_retention_days?: number | null
          features?: Json
          created_at?: string
        }
        Update: {
          name?: string
          price_monthly_brl?: number | null
          price_annual_brl?: number | null
          max_history_sessions?: number | null
          history_retention_days?: number | null
          features?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          billing_period: string | null
          current_period_end: string | null
          payment_method: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string
          status?: string
          billing_period?: string | null
          current_period_end?: string | null
          payment_method?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          plan_id?: string
          status?: string
          billing_period?: string | null
          current_period_end?: string | null
          payment_method?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
