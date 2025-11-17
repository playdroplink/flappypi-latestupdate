import { supabase } from '@/integrations/supabase/client';

export interface PaymentHistoryItem {
  id: string;
  payment_type: 'pi_payment' | 'coin_purchase';
  item_name: string;
  item_description?: string;
  amount_pi: number;
  amount_coins: number;
  pi_transaction_id?: string;
  payment_status: 'pending' | 'approved' | 'completed' | 'failed' | 'cancelled';
  metadata: any;
  created_at: string;
  completed_at?: string;
}

class PaymentHistoryService {
  async getUserPaymentHistory(limit: number = 50): Promise<PaymentHistoryItem[]> {
    /* Original Supabase logic:
    try {
      const { data, error } = await supabase.rpc('get_user_payment_history', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        limit_count: limit
      });

      if (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }

      // Transform the data to match our interface types
      return (data || []).map((item: any): PaymentHistoryItem => ({
        id: item.id,
        payment_type: item.payment_type as 'pi_payment' | 'coin_purchase',
        item_name: item.item_name,
        item_description: item.item_description,
        amount_pi: item.amount_pi || 0,
        amount_coins: item.amount_coins || 0,
        pi_transaction_id: item.pi_transaction_id,
        payment_status: item.payment_status as 'pending' | 'approved' | 'completed' | 'failed' | 'cancelled',
        metadata: item.metadata,
        created_at: item.created_at,
        completed_at: item.completed_at
      }));
    } catch (error) {
      console.error('Error in getUserPaymentHistory:', error);
      return [];
    }
    */
  }

  async recordPayment(paymentData: {
    payment_type: 'pi_payment' | 'coin_purchase';
    item_name: string;
    item_description?: string;
    amount_pi?: number;
    amount_coins?: number;
    pi_transaction_id?: string;
    payment_status?: string;
    metadata?: any;
  }): Promise<boolean> {
    /* Original Supabase logic:
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return false;

      const { error } = await supabase
        .from('payment_history')
        .insert({
          pi_user_id: user.data.user.id,
          ...paymentData
        });

      if (error) {
        console.error('Error recording payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in recordPayment:', error);
      return false;
    }
    */
  }

  async updatePaymentStatus(paymentId: string, status: string, completedAt?: string): Promise<boolean> {
    /* Original Supabase logic:
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };

      if (completedAt) {
        updateData.completed_at = completedAt;
      }

      const { error } = await supabase
        .from('payment_history')
        .update(updateData)
        .eq('pi_transaction_id', paymentId);

      return !error;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
    */
  }
}

export const paymentHistoryService = new PaymentHistoryService();
