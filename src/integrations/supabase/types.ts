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
      ad_watches: {
        Row: {
          ad_type: string
          id: string
          pi_user_id: string
          reward_given: string | null
          watched_at: string | null
        }
        Insert: {
          ad_type: string
          id?: string
          pi_user_id: string
          reward_given?: string | null
          watched_at?: string | null
        }
        Update: {
          ad_type?: string
          id?: string
          pi_user_id?: string
          reward_given?: string | null
          watched_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          client_ip: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          pi_user_id: string | null
          referrer: string | null
          timestamp: string
          url: string | null
          user_agent: string | null
        }
        Insert: {
          client_ip?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          pi_user_id?: string | null
          referrer?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          client_ip?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          pi_user_id?: string | null
          referrer?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          created_at: string | null
          id: string
          last_claimed_date: string | null
          pi_user_id: string
          reward_day: number
          streak_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_claimed_date?: string | null
          pi_user_id: string
          reward_day: number
          streak_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_claimed_date?: string | null
          pi_user_id?: string
          reward_day?: number
          streak_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          coins_earned: number
          created_at: string | null
          final_score: number
          game_mode: Database["public"]["Enums"]["game_mode"]
          id: string
          level_reached: number
          pi_user_id: string
          session_duration: number | null
        }
        Insert: {
          coins_earned?: number
          created_at?: string | null
          final_score?: number
          game_mode: Database["public"]["Enums"]["game_mode"]
          id?: string
          level_reached?: number
          pi_user_id: string
          session_duration?: number | null
        }
        Update: {
          coins_earned?: number
          created_at?: string | null
          final_score?: number
          game_mode?: Database["public"]["Enums"]["game_mode"]
          id?: string
          level_reached?: number
          pi_user_id?: string
          session_duration?: number | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount_coins: number | null
          amount_pi: number | null
          completed_at: string | null
          created_at: string
          id: string
          item_description: string | null
          item_name: string
          metadata: Json | null
          payment_status: string
          payment_type: string
          pi_transaction_id: string | null
          pi_user_id: string
          updated_at: string
        }
        Insert: {
          amount_coins?: number | null
          amount_pi?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          item_description?: string | null
          item_name: string
          metadata?: Json | null
          payment_status?: string
          payment_type: string
          pi_transaction_id?: string | null
          pi_user_id: string
          updated_at?: string
        }
        Update: {
          amount_coins?: number | null
          amount_pi?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          item_description?: string | null
          item_name?: string
          metadata?: Json | null
          payment_status?: string
          payment_type?: string
          pi_transaction_id?: string | null
          pi_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          cost_coins: number
          created_at: string | null
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["item_type"]
          pi_transaction_id: string | null
          pi_user_id: string
        }
        Insert: {
          cost_coins: number
          created_at?: string | null
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["item_type"]
          pi_transaction_id?: string | null
          pi_user_id: string
        }
        Update: {
          cost_coins?: number
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          pi_transaction_id?: string | null
          pi_user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_pi: number | null
          auto_renew: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          end_date: string
          id: string
          pi_transaction_id: string | null
          pi_user_id: string
          plan_id: string
          plan_name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_pi?: number | null
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          end_date: string
          id?: string
          pi_transaction_id?: string | null
          pi_user_id: string
          plan_id: string
          plan_name: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_pi?: number | null
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          end_date?: string
          id?: string
          pi_transaction_id?: string | null
          pi_user_id?: string
          plan_id?: string
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["item_type"]
          pi_user_id: string
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["item_type"]
          pi_user_id: string
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          pi_user_id?: string
          quantity?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ad_free_permanent: boolean | null
          avatar_url: string | null
          created_at: string | null
          id: string
          music_enabled: boolean | null
          owned_skins: Json | null
          pi_user_id: string
          premium_expires_at: string | null
          selected_bird_skin: string | null
          subscription_end: string | null
          subscription_plan: string | null
          subscription_start: string | null
          subscription_status: string | null
          total_coins: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          ad_free_permanent?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          music_enabled?: boolean | null
          owned_skins?: Json | null
          pi_user_id: string
          premium_expires_at?: string | null
          selected_bird_skin?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          total_coins?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          ad_free_permanent?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          music_enabled?: boolean | null
          owned_skins?: Json | null
          pi_user_id?: string
          premium_expires_at?: string | null
          selected_bird_skin?: string | null
          subscription_end?: string | null
          subscription_plan?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          total_coins?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          claimed_at: string | null
          description: string | null
          id: string
          pi_user_id: string
          reward_amount: number
          reward_type: Database["public"]["Enums"]["reward_type"]
        }
        Insert: {
          claimed_at?: string | null
          description?: string | null
          id?: string
          pi_user_id: string
          reward_amount: number
          reward_type: Database["public"]["Enums"]["reward_type"]
        }
        Update: {
          claimed_at?: string | null
          description?: string | null
          id?: string
          pi_user_id?: string
          reward_amount?: number
          reward_type?: Database["public"]["Enums"]["reward_type"]
        }
        Relationships: []
      }
      user_scores: {
        Row: {
          created_at: string
          highest_score: number
          id: string
          pi_user_id: string
          total_games: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          highest_score?: number
          id?: string
          pi_user_id: string
          total_games?: number
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          highest_score?: number
          id?: string
          pi_user_id?: string
          total_games?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_subscription: {
        Args: {
          p_pi_user_id: string
          p_plan_id: string
          p_plan_name: string
          p_duration_days: number
          p_pi_transaction_id: string
          p_amount_pi?: number
        }
        Returns: Json
      }
      cancel_subscription: {
        Args: { p_pi_user_id: string; p_reason?: string }
        Returns: Json
      }
      claim_daily_reward: {
        Args: { p_pi_user_id: string }
        Returns: Json
      }
      complete_game_session: {
        Args:
          | {
              p_game_mode: Database["public"]["Enums"]["game_mode"]
              p_final_score: number
              p_level_reached: number
              p_coins_earned: number
              p_session_duration?: number
            }
          | {
              p_pi_user_id: string
              p_game_mode: Database["public"]["Enums"]["game_mode"]
              p_final_score: number
              p_level_reached: number
              p_coins_earned: number
              p_session_duration?: number
            }
        Returns: Json
      }
      complete_game_session_secure: {
        Args:
          | Record<PropertyKey, never>
          | {
              p_game_mode: Database["public"]["Enums"]["game_mode"]
              p_final_score: number
              p_level_reached: number
              p_coins_earned: number
              p_session_duration?: number
            }
        Returns: Json
      }
      expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_payment_history: {
        Args: { user_id: string; limit_count?: number }
        Returns: {
          id: string
          payment_type: string
          item_name: string
          item_description: string
          amount_pi: number
          amount_coins: number
          pi_transaction_id: string
          payment_status: string
          metadata: Json
          created_at: string
          completed_at: string
        }[]
      }
      make_purchase: {
        Args:
          | {
              p_item_type: Database["public"]["Enums"]["item_type"]
              p_item_id: string
              p_cost_coins: number
              p_pi_transaction_id?: string
            }
          | {
              p_pi_user_id: string
              p_item_type: Database["public"]["Enums"]["item_type"]
              p_item_id: string
              p_cost_coins: number
              p_pi_transaction_id?: string
            }
        Returns: Json
      }
      make_purchase_secure: {
        Args: {
          p_item_type: Database["public"]["Enums"]["item_type"]
          p_item_id: string
          p_cost_coins: number
          p_pi_transaction_id?: string
        }
        Returns: Json
      }
      update_user_score: {
        Args: { p_pi_user_id: string; p_username: string; p_score: number }
        Returns: undefined
      }
      user_has_active_premium: {
        Args: { user_id: string }
        Returns: boolean
      }
      user_owns_skin: {
        Args: { user_id: string; skin_id: string }
        Returns: boolean
      }
      watch_ad_reward: {
        Args: {
          p_pi_user_id: string
          p_ad_type: string
          p_reward_amount?: number
        }
        Returns: Json
      }
    }
    Enums: {
      game_mode: "classic" | "endless" | "challenge"
      item_type: "bird_skin" | "power_up" | "life" | "coins"
      reward_type: "daily" | "weekly_leaderboard" | "ad_watch" | "achievement"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_mode: ["classic", "endless", "challenge"],
      item_type: ["bird_skin", "power_up", "life", "coins"],
      reward_type: ["daily", "weekly_leaderboard", "ad_watch", "achievement"],
    },
  },
} as const
