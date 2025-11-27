import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  constructor() {
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase configuration not found. Payment tracking will be disabled.');
      this.supabase = null;
      return;
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Store payment in database
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Stored payment record
   */
  async storePayment(paymentData) {
    if (!this.supabase) {
      console.warn('Database not available. Payment not stored.');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('payment_records')
        .insert([{
          payment_id: paymentData.paymentId,
          user_id: paymentData.user_id,
          amount: paymentData.amount,
          memo: paymentData.memo,
          metadata: paymentData.metadata,
          status: 'created',
          direction: 'app_to_user',
          network: 'mainnet'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error storing payment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Database error storing payment:', error);
      throw error;
    }
  }

  /**
   * Update payment with transaction ID
   * @param {string} paymentId - Payment ID
   * @param {string} txid - Transaction ID
   * @param {string} status - Payment status
   * @returns {Promise<Object>} Updated payment record
   */
  async updatePayment(paymentId, txid = null, status = 'submitted') {
    if (!this.supabase) {
      console.warn('Database not available. Payment not updated.');
      return null;
    }

    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (txid) {
        updateData.txid = txid;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('payment_records')
        .update(updateData)
        .eq('payment_id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Database error updating payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment record
   */
  async getPayment(paymentId) {
    if (!this.supabase) {
      console.warn('Database not available.');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single();

      if (error) {
        console.error('Error getting payment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Database error getting payment:', error);
      throw error;
    }
  }

  /**
   * Get payments by user ID
   * @param {string} userUid - User ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} User payments
   */
  async getUserPayments(userUid, limit = 50) {
    if (!this.supabase) {
      console.warn('Database not available.');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('user_uid', userUid)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting user payments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Database error getting user payments:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStats() {
    if (!this.supabase) {
      console.warn('Database not available.');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_payment_stats');

      if (error) {
        console.error('Error getting payment stats:', error);
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Database error getting payment stats:', error);
      throw error;
    }
  }

  /**
   * Check if payment exists
   * @param {string} paymentId - Payment ID
   * @returns {Promise<boolean>} Whether payment exists
   */
  async paymentExists(paymentId) {
    if (!this.supabase) {
      return false;
    }

    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('payment_id')
        .eq('payment_id', paymentId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get incomplete payments
   * @returns {Promise<Array>} Incomplete payments
   */
  async getIncompletePayments() {
    if (!this.supabase) {
      console.warn('Database not available.');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .in('status', ['created', 'submitted'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting incomplete payments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Database error getting incomplete payments:', error);
      throw error;
    }
  }
}

export default DatabaseService;
