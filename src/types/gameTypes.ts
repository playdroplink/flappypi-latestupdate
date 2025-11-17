export interface UserProfile {
  id?: string;
  pi_user_id: string;
  username: string;
  total_coins: number;
  extra_lives: number;
  selected_bird_skin: string;
  music_enabled: boolean;
  owned_skins: string[];
  highest_score: number;
  total_games: number;
  last_played_at: string;
  subscription_status: 'none' | 'active' | 'canceled' | 'expired';
  premium_expires_at: string | null;
  ad_free_permanent: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  subscription_start?: string;
  subscription_end?: string;
  subscription_plan?: string;
  owned_power_ups: { [key: string]: number; } | null;
  pi_balance?: number;
  has_active_subscription?: boolean;
  power_ups_extra_life?: number;
  power_ups_2x_coins?: number;
  power_ups_magnet?: number;
  power_ups_shield?: number;
  power_ups_turbo_start?: number;
  referral_code?: string;
  referral_coins?: number;
  referral_bonus_per_friend?: number;
  flappy_id?: string;
  bio?: string;
  is_private?: boolean;
  twitter?: string;
  discord?: string;
  telegram?: string;
  access_token?: string;
}

export interface GameSession {
  pi_user_id: string;
  game_mode: 'classic' | 'endless' | 'challenge';
  final_score: number;
  level_reached: number;
  coins_earned: number;
  session_duration?: number;
}

export interface PurchaseItem {
  pi_user_id: string;
  item_type: 'bird_skin' | 'power_up' | 'life' | 'coins';
  item_id: string;
  cost_coins: number;
  pi_transaction_id?: string;
}

export interface PurchaseState {
  ownedSkins: string[];
  isPremium: boolean;
  isAdFree: boolean;
  premiumExpiresAt: string | null;
  coins: number;
}

export interface PaymentHistoryItem {
  id: string;
  pi_user_id: string;
  item_id: string;
  item_name: string;
  item_description: string | null;
  amount_coins: number;
  amount_pi: number;
  payment_type: 'coin_purchase' | 'pi_payment' | 'subscription';
  payment_status: 'pending' | 'completed' | 'failed' | 'canceled';
  created_at: string;
  completed_at: string | null;
  pi_transaction_id?: string | null;
}

export interface Subscription {
  id: string;
  pi_user_id: string;
  type: 'premium' | 'ad_free';
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface AdRewardResult {
  success: boolean;
  reward_amount: number;
  description: string;
}
