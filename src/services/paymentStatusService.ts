
import { supabase } from '@/integrations/supabase/client';
import { paymentHistoryService } from './paymentHistoryService';

// Service for real-time payment status monitoring
class PaymentStatusService {
  private statusPollingInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, (status: string) => void> = new Map();

  startPaymentStatusMonitoring(paymentId: string, callback: (status: string) => void): void {
    this.listeners.set(paymentId, callback);
    
    // Poll every 5 seconds for payment status updates
    this.statusPollingInterval = setInterval(async () => {
      try {
        const history = await paymentHistoryService.getUserPaymentHistory(10);
        const payment = history.find(p => p.pi_transaction_id === paymentId);
        
        if (payment && this.listeners.has(paymentId)) {
          const callback = this.listeners.get(paymentId);
          if (callback) {
            callback(payment.payment_status);
          }
          
          // Stop monitoring if payment is complete
          if (['completed', 'failed', 'cancelled'].includes(payment.payment_status)) {
            this.stopPaymentStatusMonitoring(paymentId);
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000);
  }

  stopPaymentStatusMonitoring(paymentId: string): void {
    this.listeners.delete(paymentId);
    
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  stopAllMonitoring(): void {
    this.listeners.clear();
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }
}

export const paymentStatusService = new PaymentStatusService();
