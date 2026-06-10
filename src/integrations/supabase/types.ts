export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          payload: Json
          seminar_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          seminar_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          seminar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_seminar_id_fkey"
            columns: ["seminar_id"]
            isOneToOne: false
            referencedRelation: "seminars"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          created_at: string
          email: string | null
          home_airport: string | null
          id: string
          name: string
          phone: string | null
          travel_prefs: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          home_airport?: string | null
          id?: string
          name: string
          phone?: string | null
          travel_prefs?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          home_airport?: string | null
          id?: string
          name?: string
          phone?: string | null
          travel_prefs?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      contract_versions: {
        Row: {
          action: string
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          terms: Json
          version: number
        }
        Insert: {
          action: string
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          terms?: Json
          version: number
        }
        Update: {
          action?: string
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          terms?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          current_version: number
          id: string
          seminar_id: string
          site_id: string
          status: Database["public"]["Enums"]["contract_status"]
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_version?: number
          id?: string
          seminar_id: string
          site_id: string
          status?: Database["public"]["Enums"]["contract_status"]
          total_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_version?: number
          id?: string
          seminar_id?: string
          site_id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_seminar_id_fkey"
            columns: ["seminar_id"]
            isOneToOne: false
            referencedRelation: "seminars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "meeting_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      materials_requests: {
        Row: {
          created_at: string
          handled_by: string | null
          id: string
          items: Json
          requested_by: string | null
          seminar_id: string
          ship_to_address: string
          shipped_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          handled_by?: string | null
          id?: string
          items?: Json
          requested_by?: string | null
          seminar_id: string
          ship_to_address: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          handled_by?: string | null
          id?: string
          items?: Json
          requested_by?: string | null
          seminar_id?: string
          ship_to_address?: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_requests_seminar_id_fkey"
            columns: ["seminar_id"]
            isOneToOne: true
            referencedRelation: "seminars"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_sites: {
        Row: {
          address: string | null
          amenities: Json
          city: string
          cost_per_day: number
          created_at: string
          id: string
          max_capacity: number
          name: string
          sales_manager_id: string | null
          sales_manager_name: string | null
          space_info: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json
          city: string
          cost_per_day?: number
          created_at?: string
          id?: string
          max_capacity?: number
          name: string
          sales_manager_id?: string | null
          sales_manager_name?: string | null
          space_info?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json
          city?: string
          cost_per_day?: number
          created_at?: string
          id?: string
          max_capacity?: number
          name?: string
          sales_manager_id?: string | null
          sales_manager_name?: string | null
          space_info?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          seminar_id: string | null
          target_role: Database["public"]["Enums"]["app_role"] | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          seminar_id?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          seminar_id?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_seminar_id_fkey"
            columns: ["seminar_id"]
            isOneToOne: false
            referencedRelation: "seminars"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      seminar_types: {
        Row: {
          created_at: string
          default_av: Json
          default_rooms: number
          default_seating: string
          description: string | null
          id: string
          materials_template: Json
          name: string
        }
        Insert: {
          created_at?: string
          default_av?: Json
          default_rooms?: number
          default_seating?: string
          description?: string | null
          id?: string
          materials_template?: Json
          name: string
        }
        Update: {
          created_at?: string
          default_av?: Json
          default_rooms?: number
          default_seating?: string
          description?: string | null
          id?: string
          materials_template?: Json
          name?: string
        }
        Relationships: []
      }
      seminars: {
        Row: {
          city: string
          consultant_id: string | null
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          registrant_count: number
          selected_site_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["seminar_status"]
          type_id: string | null
          updated_at: string
        }
        Insert: {
          city: string
          consultant_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          registrant_count?: number
          selected_site_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["seminar_status"]
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          city?: string
          consultant_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          registrant_count?: number
          selected_site_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["seminar_status"]
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seminars_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminars_selected_site_id_fkey"
            columns: ["selected_site_id"]
            isOneToOne: false
            referencedRelation: "meeting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminars_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "seminar_types"
            referencedColumns: ["id"]
          },
        ]
      }
      site_options: {
        Row: {
          available: boolean
          created_at: string
          estimated_cost: number | null
          id: string
          notes: string | null
          selected: boolean
          seminar_id: string
          site_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          selected?: boolean
          seminar_id: string
          site_id: string
        }
        Update: {
          available?: boolean
          created_at?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          selected?: boolean
          seminar_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_options_seminar_id_fkey"
            columns: ["seminar_id"]
            isOneToOne: false
            referencedRelation: "seminars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_options_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "meeting_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_arrangements: {
        Row: {
          airline: string | null
          confirmation_number: string | null
          consultant_id: string | null
          departure_date: string | null
          hotel: string | null
          id: string
          itinerary_sent_at: string | null
          notes: string | null
          outbound_flight: string | null
          return_date: string | null
          return_flight: string | null
          seminar_id: string
          status: string
          travel_agency: string | null
          updated_at: string
        }
        Insert: {
          airline?: string | null
          confirmation_number?: string | null
          consultant_id?: string | null
          departure_date?: string | null
          hotel?: string | null
          id?: string
          itinerary_sent_at?: string | null
          notes?: string | null
          outbound_flight?: string | null
          return_date?: string | null
          return_flight?: string | null
          seminar_id: string
          status?: string
          travel_agency?: string | null
          updated_at?: string
        }
        Update: {
          airline?: string | null
          confirmation_number?: string | null
          consultant_id?: string | null
          departure_date?: string | null
          hotel?: string | null
          id?: string
          itinerary_sent_at?: string | null
          notes?: string | null
          outbound_flight?: string | null
          return_date?: string | null
          return_flight?: string | null
          seminar_id?: string
          status?: string
          travel_agency?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_arrangements_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_arrangements_seminar_id_fkey"
            columns: ["seminar_id"]
            isOneToOne: true
            referencedRelation: "seminars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "coordinator" | "sales_manager" | "consultant" | "materials"
      contract_status:
        | "draft"
        | "pending_coordinator"
        | "pending_sales"
        | "approved"
      seminar_status:
        | "booked"
        | "site_selecting"
        | "contract_negotiating"
        | "contract_approved"
        | "travel_booked"
        | "materials_requested"
        | "materials_shipped"
        | "ready"
        | "completed"
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
      app_role: ["coordinator", "sales_manager", "consultant", "materials"],
      contract_status: [
        "draft",
        "pending_coordinator",
        "pending_sales",
        "approved",
      ],
      seminar_status: [
        "booked",
        "site_selecting",
        "contract_negotiating",
        "contract_approved",
        "travel_booked",
        "materials_requested",
        "materials_shipped",
        "ready",
        "completed",
      ],
    },
  },
} as const
