import PiNetwork from 'pi-backend';
import dotenv from 'dotenv';
import DatabaseService from './databaseService.js';

dotenv.config();

class PiService {
  constructor() {
    // Initialize Pi Network SDK with mainnet configuration
    this.apiKey = process.env.PI_API_KEY || process.env.VITE_PI_SERVER_API_KEY;
    this.walletPrivateSeed = process.env.PI_WALLET_PRIVATE_SEED;
    
    if (!this.apiKey || !this.walletPrivateSeed) {
      throw new Error('Pi Network API key and wallet private seed are required');
    }
    
    this.pi = new PiNetwork(this.apiKey, this.walletPrivateSeed);
    this.db = new DatabaseService();
  }

  /**
   * Create an A2U (App-to-User) payment
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.amount - Amount of Pi to pay
   * @param {string} paymentData.memo - Payment description
   * @param {Object} paymentData.metadata - Additional metadata
   * @param {string} paymentData.uid - User ID
   * @returns {Promise<string>} Payment ID
   */
  async createPayment(paymentData) {
    try {
      const { amount, memo, metadata, user_id } = paymentData;
      // Validate required fields
      if (!amount || !memo || !user_id) {
        throw new Error('Amount, memo, and user_id are required');
      }

      const paymentId = await this.pi.createPayment({
        amount,
        memo,
        metadata: metadata || {},
        user_id
      });

      // Store payment in database
      try {
        await this.db.storePayment({
          paymentId,
          user_id,
          amount,
          memo,
          metadata: metadata || {}
        });
        console.log(`Payment ${paymentId} stored in database`);
      } catch (dbError) {
        console.warn('Failed to store payment in database:', dbError.message);
        // Don't throw error - payment was created successfully
      }

      return paymentId;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Submit payment to Pi Blockchain
   * @param {string} paymentId - Payment ID
   * @returns {Promise<string>} Transaction ID
   */
  async submitPayment(paymentId) {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const txid = await this.pi.submitPayment(paymentId);
      
      // Update payment in database with transaction ID
      try {
        await this.db.updatePayment(paymentId, txid, 'submitted');
        console.log(`Payment ${paymentId} updated with txid ${txid}`);
      } catch (dbError) {
        console.warn('Failed to update payment in database:', dbError.message);
        // Don't throw error - payment was submitted successfully
      }

      return txid;
    } catch (error) {
      console.error('Error submitting payment:', error);
      throw new Error(`Failed to submit payment: ${error.message}`);
    }
  }

  /**
   * Complete payment
   * @param {string} paymentId - Payment ID
   * @param {string} txid - Transaction ID
   * @returns {Promise<Object>} Completed payment object
   */
  async completePayment(paymentId, txid) {
    try {
      if (!paymentId || !txid) {
        throw new Error('Payment ID and transaction ID are required');
      }

      const completedPayment = await this.pi.completePayment(paymentId, txid);
      
      // Update payment status to completed in database
      try {
        await this.db.updatePayment(paymentId, txid, 'completed');
        console.log(`Payment ${paymentId} marked as completed`);
      } catch (dbError) {
        console.warn('Failed to update payment status in database:', dbError.message);
        // Don't throw error - payment was completed successfully
      }

      return completedPayment;
    } catch (error) {
      console.error('Error completing payment:', error);
      throw new Error(`Failed to complete payment: ${error.message}`);
    }
  }

  /**
   * Get payment details
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment object
   */
  async getPayment(paymentId) {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const payment = await this.pi.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  /**
   * Cancel payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Cancelled payment object
   */
  async cancelPayment(paymentId) {
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const cancelledPayment = await this.pi.cancelPayment(paymentId);
      return cancelledPayment;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }

  /**
   * Get incomplete server payments
   * @returns {Promise<Array>} Array of incomplete payments
   */
  async getIncompleteServerPayments() {
    try {
      const payments = await this.pi.getIncompleteServerPayments();
      return payments;
    } catch (error) {
      console.error('Error getting incomplete payments:', error);
      throw new Error(`Failed to get incomplete payments: ${error.message}`);
    }
  }

  /**
   * Process complete A2U payment flow
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Complete payment result
   */
  async processA2UPayment(paymentData) {
    try {
      // Step 1: Create payment
      const paymentId = await this.createPayment(paymentData);
      
      // Step 2: Submit payment to blockchain
      const txid = await this.submitPayment(paymentId);
      
      // Step 3: Complete payment
      const completedPayment = await this.completePayment(paymentId, txid);
      
      return {
        success: true,
        paymentId,
        txid,
        payment: completedPayment
      };
    } catch (error) {
      console.error('Error processing A2U payment:', error);
      throw error;
    }
  }
}

export default PiService;
