import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PaymentItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  type: string;
  quantity?: number;
}

interface NewPiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItem | null;
  onPaymentSuccess: (item: PaymentItem) => void;
  onPaymentError: (error: string) => void;
}

const NewPiPaymentModal: React.FC<NewPiPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [error, setError] = useState<string | null>(null);
  const [piUser, setPiUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setPaymentStep('confirm');
      setError(null);
      setIsProcessing(false);
      checkPiAuthentication();
    }
  }, [isOpen, item]);

  // Check Pi authentication status
  const checkPiAuthentication = () => {
    try {
      // Check if Pi SDK is available
      if (typeof window === 'undefined' || !window.Pi) {
        console.log('❌ Pi SDK not available');
        setIsAuthenticated(false);
        return;
      }

      // Check if user is already authenticated
      const storedUser = localStorage.getItem('flappypi-pi-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setPiUser(user);
        setIsAuthenticated(true);
        console.log('✅ Pi user authenticated:', user.username);
      } else {
        setIsAuthenticated(false);
        console.log('❌ No Pi user found');
      }
    } catch (error) {
      console.error('❌ Error checking Pi authentication:', error);
      setIsAuthenticated(false);
    }
  };

  // Handle Pi authentication
  const handlePiSignIn = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      toast({
        title: "Pi SDK Not Available",
        description: "Please use Pi Browser to sign in with Pi Network.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔐 Starting Pi authentication...');
      
      // Use Pi SDK to authenticate
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, (incompletePayment) => {
        console.log("💰 Incomplete payment found:", incompletePayment);
        return Promise.resolve();
      });

      if (authResult && authResult.user && authResult.accessToken) {
        // Store user data
        localStorage.setItem('flappypi-pi-user', JSON.stringify(authResult.user));
        localStorage.setItem('flappypi-pi-auth', 'true');
        localStorage.setItem('pi_user', JSON.stringify(authResult.user));
        localStorage.setItem('pi_access_token', authResult.accessToken);

        // Update state
        setPiUser(authResult.user);
        setIsAuthenticated(true);

        toast({
          title: "Signed in successfully! 🎉",
          description: `Welcome, ${authResult.user.username || 'Pi User'}!`
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('❌ Pi authentication error:', error);
      toast({
        title: "Sign-in Failed",
        description: error.message || "Failed to sign in with Pi Network. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!item || !isAuthenticated) return;

    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);

    try {
      console.log('💰 Processing payment for:', item);

      // Create payment data
      const paymentData = {
        amount: item.price,
        memo: `Purchase ${item.name}`,
        metadata: {
          type: item.type,
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity || 1,
          timestamp: Date.now()
        }
      };

      console.log('🚀 Creating Pi payment:', paymentData);

      // Create payment using Pi SDK (callback-based)
      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log("✅ Payment ready for server approval:", paymentId);
          // For testnet/sandbox, approve immediately
          return true;
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log("✅ Payment completed:", paymentId, txid);
          setPaymentStep('success');
          setIsProcessing(false);
          
          toast({
            title: "Payment Successful! 🎉",
            description: `${item.name} has been purchased successfully.`
          });

          // Call success handler
          onPaymentSuccess(item);
        },
        onCancel: (paymentId: string) => {
          console.log("❌ Payment cancelled:", paymentId);
          setPaymentStep('error');
          setError('Payment was cancelled');
          setIsProcessing(false);
        },
        onError: (error: any, payment?: any) => {
          console.log("❌ Payment error:", error);
          setPaymentStep('error');
          setError(error.message || 'Payment failed');
          setIsProcessing(false);
          
          toast({
            title: "Payment Failed",
            description: error.message || "An error occurred while processing your payment.",
            variant: "destructive"
          });

          onPaymentError(error.message || 'Payment failed');
        }
      });

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setPaymentStep('error');
      setError(error.message || 'Payment failed');
      setIsProcessing(false);
      
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred while processing your payment.",
        variant: "destructive"
      });

      onPaymentError(error.message || 'Payment failed');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-purple-600">
            Pi Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Details */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <img 
                src={item.image || '/flappycoins.png'} 
                alt={item.name}
                className="w-12 h-12 object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-2xl font-bold text-purple-600">
              {item.price.toFixed(2)} Pi
            </p>
            {item.quantity && item.quantity > 1 && (
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            )}
          </div>

          {/* Authentication Status */}
          {!isAuthenticated ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">
                  Please sign in with Pi Network to make payments
                </p>
              </div>
              <Button
                onClick={handlePiSignIn}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isProcessing}
              >
                <img src="/pi-logo.png" alt="Pi" className="w-5 h-5 mr-2" />
                Sign in with Pi Network
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800">
                  Signed in as <strong>{piUser?.username || 'Pi User'}</strong>
                </p>
              </div>

              {/* Payment Button */}
              {paymentStep === 'confirm' && (
                <Button
                  onClick={handlePayment}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isProcessing}
                >
                  <img src="/pi-logo.png" alt="Pi" className="w-5 h-5 mr-2" />
                  Pay {item.price.toFixed(2)} Pi
                </Button>
              )}

              {/* Processing State */}
              {paymentStep === 'processing' && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-purple-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-600">Processing payment...</p>
                  <p className="text-xs text-gray-500">Please wait while we process your payment</p>
                </div>
              )}

              {/* Success State */}
              {paymentStep === 'success' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-sm text-green-800 font-semibold">Payment Successful!</p>
                  <Button
                    onClick={handleClose}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              )}

              {/* Error State */}
              {paymentStep === 'error' && (
                <div className="text-center space-y-4">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto" />
                  <p className="text-sm text-red-800 font-semibold">Payment Failed</p>
                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setPaymentStep('confirm')}
                      variant="outline"
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPiPaymentModal;
