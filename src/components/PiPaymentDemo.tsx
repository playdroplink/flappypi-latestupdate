import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, CreditCard, Coins } from 'lucide-react';

// Following official Pi demo patterns
interface PaymentData {
  amount: number;
  memo: string;
  recipientAddress?: string;
  metadata?: any;
}

interface PaymentResult {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentId?: string;
  txid?: string;
  error?: string;
}

interface PiPaymentDemoProps {
  user?: {
    uid: string;
    username: string;
    accessToken: string;
  };
  onPaymentSuccess?: (result: PaymentResult) => void;
  onPaymentError?: (error: string) => void;
}

const PiPaymentDemo: React.FC<PiPaymentDemoProps> = ({ 
  user, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 1.0,
    memo: 'Flappy Pi Test Payment',
    recipientAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
    metadata: { 
      test: true,
      walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Check if Pi SDK is available
  useEffect(() => {
    const checkPiSDK = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setSdkReady(true);
        console.log('✅ Pi SDK is available for payments');
      } else {
        console.warn('⚠️ Pi SDK not available for payments');
        setSdkReady(false);
      }
    };

    checkPiSDK();
  }, []);

  // Create Pi payment (following official demo pattern)
  const createPiPayment = async () => {
    if (!window.Pi) {
      const errorMsg = 'Pi SDK not available. Please use Pi Browser.';
      onPaymentError?.(errorMsg);
      return;
    }

    if (!user) {
      const errorMsg = 'User not authenticated. Please authenticate first.';
      onPaymentError?.(errorMsg);
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      console.log('💰 Creating Pi payment:', paymentData);

      // Following official demo pattern for payment creation (callback-based)
      window.Pi.createPayment({
        amount: paymentData.amount,
        memo: paymentData.memo,
        recipientAddress: paymentData.recipientAddress,
        metadata: paymentData.metadata
      }, {
        onReadyForServerApproval: async (paymentId) => {
          console.log('🔄 Payment ready for server approval:', paymentId);
          try {
            // Call backend API for payment approval (following official demo pattern)
            const response = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId,
                amount: paymentData.amount,
                memo: paymentData.memo,
                metadata: paymentData.metadata
              })
            });
            
            const result = await response.json();
            console.log('✅ Server approval response:', result);
            return result.approved;
          } catch (error) {
            console.error('❌ Server approval failed:', error);
            return false;
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log('✅ Payment ready for server completion:', paymentId, txid);
          try {
            // Call backend API for payment completion (following official demo pattern)
            const response = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId,
                txid
              })
            });
            
            const result = await response.json();
            console.log('✅ Server completion response:', result);
            return result.completed;
          } catch (error) {
            console.error('❌ Server completion failed:', error);
            return false;
          }
        },
        onCancel: (paymentId) => {
          console.log('❌ Payment cancelled:', paymentId);
          setPaymentResult({
            status: 'cancelled',
            paymentId
          });
        },
        onError: (error, payment) => {
          console.error('❌ Payment error:', error, payment);
          setPaymentResult({
            status: 'failed',
            paymentId: payment?.identifier,
            error: error.message || 'Payment failed'
          });
          onPaymentError?.(error.message || 'Payment failed');
        }
      });
      console.log('✅ Payment initiation invoked');

    } catch (err: any) {
      const errorMsg = err.message || 'Payment creation failed';
      console.error('❌ Payment creation failed:', err);
      setPaymentResult({
        status: 'failed',
        error: errorMsg
      });
      onPaymentError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentResult(null);
    setPaymentData({
      amount: 1.0,
      memo: 'Flappy Pi Test Payment',
      metadata: { test: true }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pi Network Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SDK Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pi SDK Status:</span>
          <Badge variant={sdkReady ? "default" : "destructive"}>
            {sdkReady ? "Ready" : "Not Available"}
          </Badge>
        </div>

        {/* User Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">User Status:</span>
          <Badge variant={user ? "default" : "destructive"}>
            {user ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </div>

        {/* Network Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network Mode:</span>
          <Badge variant="secondary">Testnet (Sandbox)</Badge>
        </div>

        {/* Payment Form */}
        {user ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Test-Pi)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0
                }))}
                placeholder="1.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">Memo</Label>
              <Input
                id="memo"
                value={paymentData.memo}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  memo: e.target.value
                }))}
                placeholder="Payment description"
              />
            </div>

            {/* Payment Result */}
            {paymentResult && (
              <div className={`p-3 rounded-lg ${
                paymentResult.status === 'completed' ? 'bg-green-50' :
                paymentResult.status === 'failed' ? 'bg-red-50' :
                paymentResult.status === 'cancelled' ? 'bg-yellow-50' :
                'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {paymentResult.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {paymentResult.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                  {paymentResult.status === 'cancelled' && <XCircle className="w-4 h-4 text-yellow-600" />}
                  <span className={`font-medium ${
                    paymentResult.status === 'completed' ? 'text-green-600' :
                    paymentResult.status === 'failed' ? 'text-red-600' :
                    paymentResult.status === 'cancelled' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    Payment {paymentResult.status}
                  </span>
                </div>
                {paymentResult.paymentId && (
                  <p className="text-xs text-gray-600 mt-1">
                    Payment ID: {paymentResult.paymentId}
                  </p>
                )}
                {paymentResult.txid && (
                  <p className="text-xs text-gray-600 mt-1">
                    Transaction ID: {paymentResult.txid}
                  </p>
                )}
                {paymentResult.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {paymentResult.error}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={createPiPayment} 
                disabled={!sdkReady || isProcessing || !user}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Pay with Pi
                  </>
                )}
              </Button>
              
              {paymentResult && (
                <Button onClick={resetPayment} variant="outline">
                  Reset
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              This is a test payment using Test-Pi (no real value)
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Please authenticate with Pi Network first
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PiPaymentDemo;
