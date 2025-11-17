// Simple Pi Payment Modal - Fixes Loading Issues
// Uses simplified payment service to prevent payment loading problems

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { simplePiPaymentService, SimplePaymentResult } from '@/services/simplePiPaymentService';

interface SimplePiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  quantity?: number;
  onPaymentSuccess: (result: SimplePaymentResult) => void;
  onPaymentError?: (error: string) => void;
}

type PaymentState = 'confirm' | 'processing' | 'success' | 'error';

const SimplePiPaymentModal: React.FC<SimplePiPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  quantity = 1,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentState, setPaymentState] = useState<PaymentState>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<SimplePaymentResult | null>(null);
  const [isPiSDKAvailable, setIsPiSDKAvailable] = useState(false);

  // Check Pi SDK availability when modal opens
  useEffect(() => {
    if (isOpen) {
      const available = simplePiPaymentService.isPiSDKAvailable();
      setIsPiSDKAvailable(available);
      
      if (!available) {
        setError('Pi SDK not available. Please use Pi Browser.');
        setPaymentState('error');
      } else {
        setPaymentState('confirm');
        setError('');
      }
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentState('confirm');
      setIsProcessing(false);
      setError('');
      setPaymentResult(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!isPiSDKAvailable) {
      setError('Pi SDK not available. Please use Pi Browser.');
      setPaymentState('error');
      return;
    }

    setPaymentState('processing');
    setIsProcessing(true);
    setError('');

    try {
      console.log('🚀 Starting simple payment for:', item.name);
      
      const result = await simplePiPaymentService.createShopPayment(item, quantity);
      
      if (result.success) {
        console.log('✅ Payment successful:', result);
        setPaymentResult(result);
        setPaymentState('success');
        onPaymentSuccess(result);
      } else {
        console.error('❌ Payment failed:', result.error);
        setError(result.error || 'Payment failed');
        setPaymentState('error');
        onPaymentError?.(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'Payment failed');
      setPaymentState('error');
      onPaymentError?.(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const totalPrice = item.price * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pi Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Confirmation */}
          {paymentState === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Confirm Payment</h3>
                <p className="text-sm text-muted-foreground">
                  You are about to purchase with Pi Network
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
                {quantity > 1 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Quantity: {quantity}</span>
                    <span>× ${item.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!isPiSDKAvailable && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Pi SDK not available. Please use Pi Browser for payments.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={!isPiSDKAvailable}
                  className="flex-1"
                >
                  Pay with Pi
                </Button>
              </div>
            </div>
          )}

          {/* Payment Processing */}
          {paymentState === 'processing' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Processing Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your payment...
                </p>
              </div>
            </div>
          )}

          {/* Payment Success */}
          {paymentState === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment has been processed successfully.
                </p>
                {paymentResult?.paymentId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment ID: {paymentResult.paymentId}
                  </p>
                )}
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}

          {/* Payment Error */}
          {paymentState === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
                <p className="text-sm text-muted-foreground">
                  {error || 'An error occurred during payment processing.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setPaymentState('confirm')}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplePiPaymentModal;
