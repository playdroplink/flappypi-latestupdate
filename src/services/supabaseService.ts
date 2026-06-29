import { supabase } from '../utils/supabase/client'

export interface UserProfile {
  id: string
  username: string
  pi_uid: string
  created_at: string
  updated_at: string
  is_connected: boolean
  is_reserved: boolean
  reserve_date?: string
  connect_date?: string
}

export interface GameState {
  id: string
  user_id: string
  high_score: number
  total_games: number
  total_coins: number
  current_streak: number
  last_played: string
}

export interface ReserveData {
  user_id: string
  username: string
  pi_uid: string
  reserve_date: string
  is_active: boolean
}

export interface ConnectData {
  user_id: string
  username: string
  pi_uid: string
  connect_date: string
  connection_status: 'pending' | 'active' | 'inactive'
}

class SupabaseService {
  private static instance: SupabaseService

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  // Reserve username functionality
  async reserveUsername(username: string, piUid: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Reserving username:', username, 'for PI user:', piUid)

      // Check if username is already reserved
      const { data: existingReserve } = await supabase
        .from('user_reserves')
        .select('*')
        .eq('username', username)
        .single()

      if (existingReserve) {
        return { success: false, error: 'Username already reserved' }
      }

      // Create reservation
      const { error } = await supabase
        .from('user_reserves')
        .insert({
          username,
          pi_uid: piUid,
          reserve_date: new Date().toISOString(),
          is_active: true
        })

      if (error) {
        console.error('❌ Error reserving username:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Username reserved successfully:', username)
      return { success: true }
    } catch (error) {
      console.error('❌ Reserve username error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Connect Flappy functionality
  async connectFlappy(username: string, piUid: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Connecting Flappy for user:', username, 'PI user:', piUid)

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('pi_uid', piUid)
        .single()

      if (existingUser) {
        // Update existing user connection
        const { error } = await supabase
          .from('user_profiles')
          .update({
            is_connected: true,
            connect_date: new Date().toISOString(),
            connection_status: 'active'
          })
          .eq('pi_uid', piUid)

        if (error) {
          console.error('❌ Error updating connection:', error)
          return { success: false, error: error.message }
        }
      } else {
        // Create new user profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            username,
            pi_uid: piUid,
            is_connected: true,
            connect_date: new Date().toISOString(),
            connection_status: 'active',
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('❌ Error creating user profile:', error)
          return { success: false, error: error.message }
        }
      }

      console.log('✅ Flappy connected successfully for:', username)
      return { success: true }
    } catch (error) {
      console.error('❌ Connect Flappy error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get user profile
  async getUserProfile(piUid: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('pi_uid', piUid)
        .single()

      if (error || !data) {
        console.error('❌ Error fetching user profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('❌ Get user profile error:', error)
      return null
    }
  }

  // Get user game state
  async getUserGameState(userId: string): Promise<GameState | null> {
    try {
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        // Create initial game state if not exists
        const { data: newState, error: createError } = await supabase
          .from('game_states')
          .insert({
            user_id: userId,
            high_score: 0,
            total_games: 0,
            total_coins: 0,
            current_streak: 0,
            last_played: new Date().toISOString()
          })
          .select()
          .single()

        if (createError || !newState) {
          console.error('❌ Error creating game state:', createError)
          return null
        }

        return newState as GameState
      }

      return data as GameState
    } catch (error) {
      console.error('❌ Get game state error:', error)
      return null
    }
  }

  // Update game state
  async updateGameState(userId: string, updates: Partial<GameState>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_states')
        .update({
          ...updates,
          last_played: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error updating game state:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Update game state error:', error)
      return false
    }
  }

  // Check if username is reserved
  async isUsernameReserved(username: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_reserves')
        .select('id')
        .eq('username', username)
        .single()

      return !!data
    } catch (error) {
      console.error('❌ Error checking username reservation:', error)
      return false
    }
  }

  // Get user reserves
  async getUserReserves(piUid: string): Promise<ReserveData[]> {
    try {
      const { data, error } = await supabase
        .from('user_reserves')
        .select('*')
        .eq('pi_uid', piUid)

      if (error) {
        console.error('❌ Error fetching user reserves:', error)
        return []
      }

      return data as ReserveData[]
    } catch (error) {
      console.error('❌ Get user reserves error:', error)
      return []
    }
  }

  // Get user connections
  async getUserConnections(piUid: string): Promise<ConnectData[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('pi_uid', piUid)

      if (error) {
        console.error('❌ Error fetching user connections:', error)
        return []
      }

      return data as ConnectData[]
    } catch (error) {
      console.error('❌ Get user connections error:', error)
      return []
    }
  }
}

export const supabaseService = SupabaseService.getInstance()