import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Skin } from '@/types/gameTypes';
import { useAuth } from '../context/AuthContext';

class UserProfileService {
  // Get user profile by Pi user ID
  async getUserProfile(piUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('pi_user_id', piUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't exist yet
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Create or update user profile
  async upsertUserProfile(profile: UserProfile): Promise<UserProfile | null> {
    // Generate a unique Flappy ID if not present
    if (!profile.flappy_id) {
      profile.flappy_id = await this.generateUniqueFlappyId();
    }
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profile as any, {
          onConflict: 'pi_user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
      return null;
    }
  }

  // Helper to generate the next available Flappy ID (e.g., '002021')
  async generateUniqueFlappyId(): Promise<string> {
    // TODO: Replace with Supabase logic to get the max flappy_id and increment
    // For now, use a random 6-digit number as a placeholder
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    return randomId;
  }
}

export const userProfileService = new UserProfileService();
