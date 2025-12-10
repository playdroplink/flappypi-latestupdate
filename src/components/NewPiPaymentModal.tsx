import React, { useState, useEffect } from 'react';
import RewardModal from './RewardModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getIncompletePayments, cancelPayment, cancelAllIncompletePayments } from '@/services/piA2UPaymentService';

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
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingPaymentDetected, setPendingPaymentDetected] = useState(false);
  const [resolvingPending, setResolvingPending] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    const autoResolvePending = async () => {
      setPendingPaymentDetected(false);
      if (isOpen && item) {
        setPaymentStep('confirm');
        setError(null);
        setIsProcessing(false);
        checkPiAuthentication();
        // Auto-check for stuck payments
        try {
          const resp = await getIncompletePayments();
          if (resp.success && Array.isArray(resp.data) && resp.data.length > 0) {
            // Cancel all incomplete payments
            for (const pending of resp.data) {
              await cancelPayment(pending.identifier);
            }
            setPendingPaymentDetected(true);
            setError('Previous stuck payment was auto-cancelled. Please try again.');
          }
        } catch (e) {
          // If error, just continue
        }
      }
    };
    autoResolvePending();
  }, [isOpen, item]);

  // Check Pi authentication status and required scopes
  const checkPiAuthentication = () => {
    try {
      if (typeof window === 'undefined' || !window.Pi) {
        setIsAuthenticated(false);
        return;
      }
      const storedUser = localStorage.getItem('flappypi-pi-user');
      const accessToken = localStorage.getItem('pi_access_token');
      let hasPaymentsScope = false;
      if (accessToken) {
        // Try to decode JWT and check scopes
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          if (payload.scope && (Array.isArray(payload.scope) ? payload.scope.includes('payments') : payload.scope.indexOf('payments') !== -1)) {
            hasPaymentsScope = true;
          }
        } catch {}
      }
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setPiUser(user);
        setIsAuthenticated(hasPaymentsScope);
        if (!hasPaymentsScope) {
          setError('You must re-authenticate and grant the "payments" scope to make payments.');
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
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
    if (!item) return;
    // Check for payments scope before proceeding
    const accessToken = localStorage.getItem('pi_access_token');
    let hasPaymentsScope = false;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload.scope && (Array.isArray(payload.scope) ? payload.scope.includes('payments') : payload.scope.indexOf('payments') !== -1)) {
          hasPaymentsScope = true;
        }
      } catch {}
    }
    if (!hasPaymentsScope) {
      setError('You must re-authenticate and grant the "payments" scope to make payments.');
      setIsAuthenticated(false);
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);

    try {
      // ...existing code for payment creation and callbacks...
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

      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          return true;
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          setPaymentStep('success');
          setIsProcessing(false);
          toast({
            title: "Payment Successful! 🎉",
            description: `${item.name} has been purchased successfully.`
          });
          setShowRewardModal(true);
          onPaymentSuccess(item);
        },
        onCancel: (paymentId: string) => {
          setPaymentStep('error');
          setError('Payment was cancelled');
          setIsProcessing(false);
        },
        onError: async (error: any, payment?: any) => {
          let handled = false;
          const errorMsg = error?.message || String(error);
          
          // Detect pending payment error (Pi's exact error message)
          if (errorMsg.includes('already have a pending payment') || 
              errorMsg.includes('needs an action from the developer')) {
            setPendingPaymentDetected(true);
            setPaymentStep('error');
            setError('⚠️ You have a stuck pending payment. Click "Resolve Pending Payment" below to fix it.');
            setIsProcessing(false);
            toast({
              title: "Pending Payment Detected",
              description: "A previous payment is stuck. Use the button below to resolve it.",
              variant: "destructive"
            });
            onPaymentError('Pending payment detected. Please resolve it using the button.');
            handled = true;
          }
          
          if (!handled) {
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
        }
      });
    } catch (error: any) {
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


  // Prepare reward for modal (single item as array)
  const rewardItems = item ? [{
    id: item.id,
    name: item.name,
    type: item.type as 'skin' | 'powerup' | 'subscription' | 'mystery-box' | 'bundle',
    quantity: item.quantity || 1,
    rarity: 'Common' as 'Common', // Default, can be improved if item has rarity
    image: item.image,
    description: ''
  }] : [];

  if (!item) return null;

  return (
    <>
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
                      disabled={resolvingPending}
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
                  {pendingPaymentDetected && (
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-800 font-semibold mb-1">
                          🚨 Stuck Payment Detected
                        </p>
                        <p className="text-xs text-yellow-700">
                          A previous payment is blocking new purchases. Click below to auto-cancel it.
                        </p>
                      </div>
                      <Button
                        onClick={async () => {
                          setResolvingPending(true);
                          setError('🔄 Resolving pending payment... Please wait.');
                          try {
                            // Use the new service function to cancel all incomplete payments
                            const result = await cancelAllIncompletePayments();
                            
                            if (result.success) {
                              console.log('✅ Bulk cancel result:', result.data);
                              setError('✅ Pending payment resolved! Please try your purchase again.');
                              setPendingPaymentDetected(false);
                              
                              // Wait for Pi Network to process
                              await new Promise(resolve => setTimeout(resolve, 2000));
                              
                              toast({
                                title: "Pending Payment Resolved! ✅",
                                description: "You can now make a new purchase. Click 'Try Again'.",
                                variant: "default"
                              });
                              setResolvingPending(false);
                              return;
                            }
                            
                            // Fallback to manual list + cancel if bulk failed
                            const resp = await getIncompletePayments();
                            if (resp.success && Array.isArray(resp.data) && resp.data.length > 0) {
                              for (const pending of resp.data) {
                                await cancelPayment(pending.identifier);
                              }
                              setError('✅ Pending payment cancelled! Please try your purchase again.');
                              setPendingPaymentDetected(false);
                              
                              toast({
                                title: "Pending Payment Resolved! ✅",
                                description: "You can now make a new purchase. Click 'Try Again'.",
                                variant: "default"
                              });
                            } else {
                              setError('No pending payment found. You can try your purchase again.');
                              setPendingPaymentDetected(false);
                            }
                          } catch (e: any) {
                            setError(`❌ Failed to resolve: ${e?.message || 'Unknown error'}. Please contact support.`);
                            toast({
                              title: "Resolution Failed",
                              description: "Unable to auto-cancel. Please try again or contact support.",
                              variant: "destructive"
                            });
                          }
                          setResolvingPending(false);
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-lg"
                        disabled={resolvingPending}
                      >
                        {resolvingPending ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resolving...
                          </span>
                        ) : (
                          '🔧 Resolve Pending Payment'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>
      {/* Reward Modal after successful payment */}
      <RewardModal
        open={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewards={rewardItems}
      />
    </>
  );
};

export default NewPiPaymentModal;
