import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Subscription } from '@/types/gameTypes';

export interface SubscriptionData {
  subscription_status: string;
  subscription_start?: string;
  subscription_end?: string;
  subscription_plan?: string;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message?: string;
  error?: string;
  remains_active_until?: string;
}

export interface ActivateSubscriptionResult {
  success: boolean;
  subscription_id?: string;
  end_date?: string;
  error?: string;
  transactionId?: string;
}

class SubscriptionService {
  // Cancel user subscription
  async cancelSubscription(piUserId: string, reason: string = 'user_requested'): Promise<CancelSubscriptionResult> {
    try {
      const { data, error } = await supabase.rpc('cancel_subscription', {
        p_pi_user_id: piUserId,
        p_reason: reason
      });

      if (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, error: error.message };
      }

      return data as unknown as CancelSubscriptionResult;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Activate subscription after Pi payment
  async activateSubscription(
    piUserId: string,
    planId: string,
    planName: string,
    durationDays: number,
    piTransactionId: string,
    amountPi: number = 0
  ): Promise<ActivateSubscriptionResult> {
    try {
      const { data, error } = await supabase.rpc('activate_subscription', {
        p_pi_user_id: piUserId,
        p_plan_id: planId,
        p_plan_name: planName,
        p_duration_days: durationDays,
        p_pi_transaction_id: piTransactionId,
        p_amount_pi: amountPi
      });

      if (error) {
        console.error('Error activating subscription:', error);
        return { success: false, error: error.message };
      }

      const result = data as unknown as ActivateSubscriptionResult;
      return { ...result, transactionId: piTransactionId };
    } catch (error) {
      console.error('Error in activateSubscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get user's subscription history
  async getSubscriptionHistory(piUserId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('pi_user_id', piUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscription history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSubscriptionHistory:', error);
      return [];
    }
  }

  // Check subscription status
  async checkSubscriptionStatus(piUserId: string): Promise<SubscriptionData | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_status, subscription_start, subscription_end, subscription_plan')
        .eq('pi_user_id', piUserId)
        .single();

      if (error) {
        console.error('Error checking subscription status:', error);
        return null;
      }

      return data as SubscriptionData;
    } catch (error) {
      console.error('Error in checkSubscriptionStatus:', error);
      return null;
    }
  }

  // Expire old subscriptions (can be called periodically)
  async expireSubscriptions(): Promise<{ success: boolean; expired_count?: number; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('expire_subscriptions');

      if (error) {
        console.error('Error expiring subscriptions:', error);
        return { success: false, error: error.message };
      }

      return data as unknown as { success: boolean; expired_count?: number };
    } catch (error) {
      console.error('Error in expireSubscriptions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // ========================================
  // CLOUD SYNC & EXPIRY TRACKING METHODS
  // ========================================

  /**
   * Check for expiring subscriptions (within specified days)
   * @param piUserId - Pi Network user ID
   * @param daysThreshold - Days ahead to check (default: 7)
   * @returns Object with expiring subscriptions info
   */
  async checkExpiringSubscriptions(piUserId: string, daysThreshold: number = 7): Promise<{
    expiringToday: any[];
    expiringThisWeek: any[];
    renewalNeeded: boolean;
  }> {
    try {
      // Call the Supabase function we created in migration
      const { data, error } = await supabase.rpc('get_expiring_subscriptions', {
        user_id: piUserId,
        days_threshold: daysThreshold
      });

      if (error) {
        console.error('❌ Error checking expiring subscriptions:', error);
        return { expiringToday: [], expiringThisWeek: [], renewalNeeded: false };
      }

      const expiringSubs = data || [];
      
      // Separate into today vs this week
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const expiringToday = expiringSubs.filter((sub: any) => {
        const expiryDate = new Date(sub.expiry_date);
        return expiryDate <= tomorrow;
      });

      const expiringThisWeek = expiringSubs.filter((sub: any) => {
        const expiryDate = new Date(sub.expiry_date);
        return expiryDate > tomorrow;
      });

      // Save renewal reminders for expiring subscriptions
      if (expiringThisWeek.length > 0) {
        await this.saveRenewalReminders(piUserId, expiringThisWeek);
      }

      return {
        expiringToday,
        expiringThisWeek,
        renewalNeeded: expiringToday.length > 0
      };
    } catch (error) {
      console.error('❌ Error in checkExpiringSubscriptions:', error);
      return { expiringToday: [], expiringThisWeek: [], renewalNeeded: false };
    }
  }

  /**
   * Get exact expiry date for user's active subscription
   * @param piUserId - Pi Network user ID
   * @returns Date object or null if no active subscription
   */
  async getSubscriptionExpiryDate(piUserId: string): Promise<Date | null> {
    try {
      const status = await this.checkSubscriptionStatus(piUserId);
      
      if (!status || status.subscription_status !== 'active' || !status.subscription_end) {
        return null;
      }

      return new Date(status.subscription_end);
    } catch (error) {
      console.error('❌ Error getting subscription expiry date:', error);
      return null;
    }
  }

  /**
   * Save renewal reminders to database
   * @param piUserId - Pi Network user ID
   * @param subscriptions - Array of expiring subscriptions
   */
  private async saveRenewalReminders(piUserId: string, subscriptions: any[]): Promise<void> {
    try {
      // Prepare renewal reminder records
      const reminders = subscriptions.map(sub => ({
        pi_user_id: piUserId,
        subscription_id: sub.subscription_id,
        subscription_plan_id: sub.plan_id,
        subscription_plan_name: sub.plan_name,
        expiry_date: sub.expiry_date,
        reminder_sent: false,
        created_at: new Date().toISOString()
      }));

      // Insert reminders (upsert to avoid duplicates)
      const { error } = await supabase
        .from('renewal_reminders')
        .upsert(reminders, { 
          onConflict: 'pi_user_id,subscription_plan_id,expiry_date',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('❌ Failed to save renewal reminders:', error);
      } else {
        console.log('✅ Saved', reminders.length, 'renewal reminders');
      }
    } catch (error) {
      console.error('❌ Error saving renewal reminders:', error);
    }
  }

  /**
   * Get pending renewal reminders for user
   * @param piUserId - Pi Network user ID
   * @returns Array of pending reminders
   */
  async getPendingRenewalReminders(piUserId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('renewal_reminders')
        .select('*')
        .eq('pi_user_id', piUserId)
        .eq('reminder_sent', false)
        .eq('renewal_completed', false)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching renewal reminders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getPendingRenewalReminders:', error);
      return [];
    }
  }

  /**
   * Mark renewal reminder as sent
   * @param reminderId - Renewal reminder ID
   */
  async markReminderAsSent(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('renewal_reminders')
        .update({ 
          reminder_sent: true, 
          reminder_sent_at: new Date().toISOString() 
        })
        .eq('id', reminderId);

      if (error) {
        console.error('❌ Error marking reminder as sent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error in markReminderAsSent:', error);
      return false;
    }
  }

  /**
   * Mark renewal as completed
   * @param piUserId - Pi Network user ID
   * @param planId - Subscription plan ID
   */
  async markRenewalCompleted(piUserId: string, planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('renewal_reminders')
        .update({ 
          renewal_completed: true, 
          renewal_completed_at: new Date().toISOString() 
        })
        .eq('pi_user_id', piUserId)
        .eq('subscription_plan_id', planId)
        .eq('renewal_completed', false);

      if (error) {
        console.error('❌ Error marking renewal as completed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error in markRenewalCompleted:', error);
      return false;
    }
  }

  /**
   * Record claimed rewards in database
   * @param piUserId - Pi Network user ID
   * @param planId - Subscription plan ID
   * @param planName - Subscription plan name
   * @param transactionId - Transaction ID
   * @param rewards - Array of rewards
   * @returns Claim ID or null
   */
  async recordClaimedRewards(
    piUserId: string,
    planId: string,
    planName: string,
    transactionId: string,
    rewards: any[]
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_claimed_rewards', {
        user_id: piUserId,
        plan_id: planId,
        plan_name: planName,
        transaction_id: transactionId,
        rewards: rewards
      });

      if (error) {
        console.error('❌ Error recording claimed rewards:', error);
        return null;
      }

      console.log('✅ Recorded claimed rewards:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in recordClaimedRewards:', error);
      return null;
    }
  }

  /**
   * Get claimed rewards history for user
   * @param piUserId - Pi Network user ID
   * @returns Array of claimed rewards
   */
  async getClaimedRewardsHistory(piUserId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('claimed_rewards')
        .select('*')
        .eq('pi_user_id', piUserId)
        .order('claimed_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching claimed rewards history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getClaimedRewardsHistory:', error);
      return [];
    }
  }

  /**
   * Get subscription days remaining
   * @param piUserId - Pi Network user ID
   * @returns Days remaining or null
   */
  async getSubscriptionDaysRemaining(piUserId: string): Promise<number | null> {
    try {
      const expiryDate = await this.getSubscriptionExpiryDate(piUserId);
      
      if (!expiryDate) {
        return null;
      }

      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

      return daysRemaining > 0 ? daysRemaining : 0;
    } catch (error) {
      console.error('❌ Error calculating days remaining:', error);
      return null;
    }
  }
}

export const subscriptionService = new SubscriptionService();
