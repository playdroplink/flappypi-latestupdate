// Unified Pi Payment Modal Component
// Handles both shop items and subscription plans with the same modal design

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, CreditCard, Star, Zap, Crown, Gift, Shield, Sparkles } from 'lucide-react';
import { ImprovedPaymentSpinner } from '@/components/ui/ImprovedPaymentSpinner';
import { useToast } from '@/hooks/use-toast';
import { walletAddressVerification } from '@/services/walletAddressVerification';
import { PI_CONFIG } from '@/config/piConfig';
import PaymentDebugPanel from './PaymentDebugPanel';

interface PaymentItem {
  id: string;
  name: string;
  description: string;
  piAmount: number;
  image?: string;
  type: 'subscription' | 'shop_item';
  features?: string[];
  savings?: string;
  totalValue?: number;
  originalPrice?: number;
}

interface UnifiedPiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItem | null;
  onPaymentSuccess?: (item: PaymentItem) => void;
  onPaymentError?: (error: string) => void;
  handlePaymentSuccess?: (item: PaymentItem) => void;
  handlePaymentError?: (error: string) => void;
}

const UnifiedPiPaymentModal: React.FC<UnifiedPiPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onPaymentSuccess,
  onPaymentError,
  handlePaymentSuccess,
  handlePaymentError
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [error, setError] = useState<string | null>(null);
  const [piUser, setPiUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentStep('confirm');
      setError(null);
      setIsProcessing(false);
      
      // Get Pi user information with enhanced check
      getPiUserInfo();
      checkAuthentication();
    }
  }, [isOpen]);

  // Handle incomplete payments (following official Pi SDK pattern)
  const onIncompletePaymentFound = (payment: any) => {
    console.log("onIncompletePaymentFound", payment);
    // In a real implementation, you would handle incomplete payments here
    // This could involve showing a modal to complete the payment or storing it for later
    return Promise.resolve();
  };

  // Get Pi user information
  const getPiUserInfo = () => {
    try {
      console.log('🔍 [DEBUG] Getting Pi user information...');
      
      // Check localStorage for Pi user data
      const storedPiUser = localStorage.getItem('flappypi-pi-user');
      const storedPiAuth = localStorage.getItem('flappypi-pi-auth');
      
      console.log('🔍 [DEBUG] localStorage check:', {
        storedPiUser: !!storedPiUser,
        storedPiAuth,
        hasStoredPiUser: !!storedPiUser
      });
      
      if (storedPiAuth === 'true' && storedPiUser) {
        const userData = JSON.parse(storedPiUser);
        // Ensure user has valid data
        if (userData && (userData.username || userData.name || userData.displayName)) {
          setPiUser(userData);
          setIsAuthenticated(true);
          console.log('✅ [DEBUG] Using localStorage Pi user:', userData);
          return;
        } else {
          console.log('⚠️ [DEBUG] localStorage Pi user exists but no valid username:', userData);
        }
      }

      // Check Pi SDK localStorage
      const piSDKUser = localStorage.getItem('pi_user');
      const piSDKToken = localStorage.getItem('pi_access_token');
      
      console.log('🔍 [DEBUG] Pi SDK localStorage check:', {
        piSDKUser: !!piSDKUser,
        piSDKToken: !!piSDKToken
      });
      
      if (piSDKUser && piSDKToken) {
        const userData = JSON.parse(piSDKUser);
        // Ensure user has valid data
        if (userData && (userData.username || userData.name || userData.displayName)) {
          setPiUser(userData);
          setIsAuthenticated(true);
          console.log('✅ [DEBUG] Using Pi SDK localStorage user:', userData);
          return;
        } else {
          console.log('⚠️ [DEBUG] Pi SDK user exists but no valid username:', userData);
        }
      }

      // Check window.Pi for current user
      if (typeof window !== 'undefined' && window.Pi) {
        console.log('🔍 [DEBUG] Checking window.Pi...');
        try {
          if (typeof window.Pi.currentUser === 'function') {
            const currentUser = window.Pi.currentUser();
            if (currentUser && (currentUser.username || currentUser.name || currentUser.displayName)) {
              setPiUser(currentUser);
              setIsAuthenticated(true);
              console.log('✅ [DEBUG] Using window.Pi.currentUser():', currentUser);
              return;
            } else {
              console.log('⚠️ [DEBUG] window.Pi.currentUser() exists but no valid username:', currentUser);
            }
          }
          
          if (window.Pi.currentUser && typeof window.Pi.currentUser === 'object') {
            const currentUser = window.Pi.currentUser;
            if (currentUser && (currentUser.username || currentUser.name || currentUser.displayName)) {
              setPiUser(currentUser);
              setIsAuthenticated(true);
              console.log('✅ [DEBUG] Using window.Pi.currentUser object:', currentUser);
              return;
            } else {
              console.log('⚠️ [DEBUG] window.Pi.currentUser object exists but no valid username:', currentUser);
            }
          }
        } catch (error) {
          console.log('Could not get current user from window.Pi:', error);
        }
      }

      // Default user if no Pi user found
      setPiUser({ username: 'PiUser', uid: 'default' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error getting Pi user info:', error);
      setPiUser({ username: 'PiUser', uid: 'default' });
      setIsAuthenticated(false);
    }
  };

  // Enhanced authentication check
  const checkAuthentication = () => {
    console.log('🔍 [DEBUG] Enhanced authentication check...');
    
    // Check all possible authentication sources
    const authSources = [
      { name: 'flappypi-pi-user', key: 'flappypi-pi-user', authKey: 'flappypi-pi-auth' },
      { name: 'pi_user', key: 'pi_user', authKey: 'pi_access_token' },
      { name: 'flappypi-username', key: 'flappypi-username', authKey: null }
    ];
    
    for (const source of authSources) {
      const userData = localStorage.getItem(source.key);
      const authData = source.authKey ? localStorage.getItem(source.authKey) : null;
      
      console.log(`🔍 [DEBUG] Checking ${source.name}:`, {
        hasUserData: !!userData,
        hasAuthData: !!authData,
        authValue: authData
      });
      
      if (userData && (!source.authKey || authData === 'true' || authData)) {
        try {
          const parsedUser = userData.startsWith('{') ? JSON.parse(userData) : { username: userData };
          if (parsedUser && (parsedUser.username || parsedUser.name || parsedUser.displayName)) {
            console.log(`✅ [DEBUG] Found authenticated user in ${source.name}:`, parsedUser);
            setPiUser(parsedUser);
            setIsAuthenticated(true);
            return;
          } else {
            console.log(`⚠️ [DEBUG] User data exists in ${source.name} but no valid username:`, parsedUser);
          }
        } catch (error) {
          console.warn(`⚠️ [DEBUG] Error parsing ${source.name}:`, error);
        }
      }
    }
    
    // Check window.Pi as final fallback
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        if (typeof window.Pi.currentUser === 'function') {
          const currentUser = window.Pi.currentUser();
          if (currentUser && (currentUser.username || currentUser.name || currentUser.displayName)) {
            console.log('✅ [DEBUG] Found user in window.Pi.currentUser():', currentUser);
            setPiUser(currentUser);
            setIsAuthenticated(true);
            return;
          } else {
            console.log('⚠️ [DEBUG] window.Pi.currentUser() exists but no valid username:', currentUser);
          }
        }
      } catch (error) {
        console.warn('⚠️ [DEBUG] Error checking window.Pi.currentUser():', error);
      }
    }
    
    console.log('❌ [DEBUG] No authentication found');
    setPiUser(null);
    setIsAuthenticated(false);
  };

  // Handle Pi authentication sign-in
  const handlePiSignIn = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      toast({
        title: "Pi SDK Not Available",
        description: "Please use Pi Browser to sign in with Pi Network.",
        variant: "destructive"
      });
      return;
    }

    setIsSigningIn(true);
    
    try {
      console.log('🔍 [DEBUG] Attempting Pi authentication...');
      
      // Try to authenticate with Pi Network
      const authResult = await window.Pi.authenticate(['payments', 'username'], onIncompletePaymentFound);
      
      if (authResult && authResult.user) {
        console.log('✅ [DEBUG] Pi authentication successful:', authResult.user);
        
        // Store user data in localStorage
        localStorage.setItem('flappypi-pi-user', JSON.stringify(authResult.user));
        localStorage.setItem('flappypi-pi-auth', 'true');
        
        // Update state
        setPiUser(authResult.user);
        setIsAuthenticated(true);
        
        toast({
          title: "Authentication Successful",
          description: "Successfully signed in with Pi Network.",
        });
      } else {
        throw new Error('Authentication failed - no user data received');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Pi authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with Pi Network.",
        variant: "destructive"
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    console.log('🔍 [DEBUG] Signing out user...');
    
    // Clear all Pi user data
    localStorage.removeItem('flappypi-pi-user');
    localStorage.removeItem('flappypi-pi-auth');
    localStorage.removeItem('pi_user');
    localStorage.removeItem('pi_access_token');

    // Reset state
    setPiUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ [DEBUG] User signed out successfully');

    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  const handlePayment = async () => {
    console.log('🔍 [DEBUG] handlePayment called with item:', item);
    
    if (!item) {
      console.error('❌ [DEBUG] No item provided to handlePayment');
      return;
    }

    console.log('🔍 [DEBUG] Payment details:', {
      itemName: item.name,
      itemId: item.id,
      piAmount: item.piAmount,
      itemType: item.type,
      isAuthenticated,
      sandboxMode: PI_CONFIG.isSandbox(),
      piUser: piUser?.username || 'No user'
    });

    // In sandbox mode, skip authentication requirement
    if (!isAuthenticated && !PI_CONFIG.isSandbox()) {
      console.error('❌ [DEBUG] User not authenticated and not in sandbox mode');
      toast({
        title: "Authentication Required",
        description: "Please sign in with Pi Network to complete your purchase.",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ [DEBUG] Authentication check passed');

    // Verify wallet configuration before payment
    console.log('🔍 [DEBUG] Starting wallet verification...');
    try {
      const walletVerification = await walletAddressVerification.verifyWalletConfiguration();
      console.log('🔍 [DEBUG] Wallet verification result:', walletVerification);
      
      if (!walletVerification.success) {
        console.error('❌ [DEBUG] Wallet verification failed:', walletVerification.error);
        toast({
          title: "Wallet Configuration Error",
          description: `Wallet verification failed: ${walletVerification.error}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ [DEBUG] Wallet verification successful');
      
      // Log payment attempt with wallet verification
      walletAddressVerification.logPaymentAttempt(item.piAmount, `Flappy Pi: ${item.name}`, {
        type: item.type,
        itemId: item.id,
        itemName: item.name
      });
    } catch (error) {
      console.error('❌ [DEBUG] Wallet verification error:', error);
      toast({
        title: "Wallet Verification Error",
        description: `Failed to verify wallet configuration: ${error}`,
        variant: "destructive"
      });
      return;
    }

    console.log('✅ User authenticated:', {
      isAuthenticated,
      piUser: piUser?.username || 'Unknown',
      hasPiUser: !!piUser
    });

    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);

    try {
      console.log('🔍 [DEBUG] Starting Pi SDK payment creation...');
      
      // Check if Pi SDK is available
      if (typeof window === 'undefined' || !window.Pi) {
        console.error('❌ [DEBUG] Pi SDK not available - window.Pi is undefined');
        throw new Error('Pi SDK not available. Please use Pi Browser to make Pi payments.');
      }

      console.log('✅ [DEBUG] Pi SDK available:', {
        hasPi: !!window.Pi,
        hasCreatePayment: typeof window.Pi.createPayment === 'function',
        hasAuthenticate: typeof window.Pi.authenticate === 'function',
        piKeys: window.Pi ? Object.keys(window.Pi) : []
      });

      if (typeof window.Pi.createPayment !== 'function') {
        console.error('❌ [DEBUG] window.Pi.createPayment is not a function');
        console.error('❌ [DEBUG] Available Pi methods:', window.Pi ? Object.keys(window.Pi) : 'No Pi object');
        throw new Error('Pi Payment Unavailable. Please use Pi Browser to make Pi payments.');
      }

      console.log('✅ [DEBUG] Pi SDK createPayment method is available');

      // Create mainnet payment data
      const paymentData = {
        amount: item.piAmount,
        memo: `Flappy Pi: ${item.name}`,
        recipientAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
        metadata: {
          type: item.type,
          itemId: item.id,
          itemName: item.name,
          game: 'flappy_pi',
          price: item.piAmount,
          timestamp: Date.now(),
          network: 'mainnet',
          walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
          paymentType: 'mainnet_payment'
        }
      };

      console.log('🔍 [DEBUG] Creating Pi payment with data:', paymentData);

      // Define payment callbacks following official Pi SDK pattern
      console.log('🔍 [DEBUG] Setting up payment callbacks...');
      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("🔍 [DEBUG] onReadyForServerApproval called with paymentId:", paymentId);
          
          try {
            // Call backend API for payment approval
            const response = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId,
                amount: item.piAmount,
                memo: `Flappy Pi: ${item.name}`,
                metadata: {
                  type: item.type,
                  itemId: item.id,
                  itemName: item.name,
                  game: 'flappy_pi'
                }
              })
            });

            const result = await response.json();
            
            if (result.success && result.approved) {
              console.log("✅ Payment approved by backend:", result);
              return true;
            } else {
              console.error("❌ Payment not approved by backend:", result);
              throw new Error(result.error || 'Payment not approved');
            }
          } catch (error) {
            console.error("❌ Payment approval failed:", error);
            throw error;
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log("🔍 [DEBUG] onReadyForServerCompletion called with paymentId:", paymentId, "txid:", txid);
          
          try {
            // Call backend API for payment completion
            const response = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId,
                txid,
                amount: item.piAmount,
                itemName: item.name,
                itemType: item.type
              })
            });

            const result = await response.json();
            
            if (result.success) {
              console.log("✅ Payment completed by backend:", result);
              
              // Payment successful
              setPaymentStep('success');
              setIsProcessing(false);
              
              toast({
                title: "Payment Successful! 🎉",
                description: `${item.name} has been purchased successfully.`
              });

              // Use the handler from the hook if available
              if (handlePaymentSuccess) {
                handlePaymentSuccess(item);
              } else {
                onPaymentSuccess?.(item);
              }
            } else {
              console.error("❌ Payment completion failed:", result);
              throw new Error(result.error || 'Payment completion failed');
            }
          } catch (error) {
            console.error("❌ Payment completion error:", error);
            setPaymentStep('error');
            setError(error.message || 'Payment completion failed');
            setIsProcessing(false);
            
            toast({
              title: "Payment Completion Failed",
              description: error.message || "Failed to complete payment.",
              variant: "destructive"
            });
          }
        },
        onCancel: (paymentId: string) => {
          console.log("onCancel", paymentId);
          setPaymentStep('error');
          setError('Payment was cancelled');
          setIsProcessing(false);
        },
        onError: (error: any, payment?: any) => {
          console.log("onError", error);
          if (payment) {
            console.log(payment);
          }
          setPaymentStep('error');
          setError(error.message || 'Payment failed');
          setIsProcessing(false);
          
          toast({
            title: "Payment Failed",
            description: error.message || "An error occurred while processing your payment.",
            variant: "destructive"
          });

          // Use the handler from the hook if available
          if (handlePaymentError) {
            handlePaymentError(error.message || 'Payment failed');
          } else {
            onPaymentError?.(error.message || 'Payment failed');
          }
        }
      };

      // Create Pi payment using official SDK pattern
      console.log('🚀 [DEBUG] Calling window.Pi.createPayment with:', { paymentData, callbacks });
      console.log('🔍 [DEBUG] About to call window.Pi.createPayment...');
      
      try {
        window.Pi.createPayment(paymentData, callbacks);
        console.log('✅ [DEBUG] Payment creation initiated successfully, waiting for user confirmation...');
      } catch (createPaymentError) {
        console.error('❌ [DEBUG] Error calling window.Pi.createPayment:', createPaymentError);
        throw createPaymentError;
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStep('error');
      setError(error.message || 'Payment failed');
      setIsProcessing(false);
      
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred while processing your payment.",
        variant: "destructive"
      });

      // Use the handler from the hook if available
      if (handlePaymentError) {
        handlePaymentError(error.message || 'Payment failed');
      } else {
        onPaymentError?.(error.message || 'Payment failed');
      }
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'shop_item':
        return <Gift className="w-6 h-6 text-blue-500" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-500" />;
    }
  };

  const getItemBadge = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Badge className="bg-yellow-100 text-yellow-800">Subscription</Badge>;
      case 'shop_item':
        return <Badge className="bg-blue-100 text-blue-800">Shop Item</Badge>;
      default:
        return null;
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0">
        {/* Pi Mainnet Banner */}
        <div className="bg-green-500 text-white text-center py-2 font-bold text-sm">
          Pi Mainnet App
        </div>
        
        <div className="p-6">
          {/* User Sign-in Section */}
          <div className="bg-gray-100 flex justify-between items-center px-4 py-3 mb-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Flappy Pi</span>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    @{piUser?.username || piUser?.name || piUser?.displayName || 'PiUser'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-500 text-white border-green-500 hover:bg-green-600"
                    onClick={handlePiSignIn}
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-500 text-white border-gray-500 hover:bg-gray-600"
                    onClick={checkAuthentication}
                    title="Refresh authentication status"
                  >
                    <Loader2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Flappy Pi - App Platform Demo
              <br />
              requests
            </DialogTitle>
          </DialogHeader>

        <div className="space-y-6">
          {/* Pi Mainnet Badge */}
          <div className="flex justify-center">
            <Badge className="bg-white border-green-500 text-green-500 px-3 py-1 rounded-full">
              Pi Mainnet
            </Badge>
          </div>

          {/* Payment Amount */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {item.piAmount}.0 π
            </div>
            <div className="text-sm text-gray-500">
              Transaction Fee: 0.01 π
            </div>
          </div>

          {/* Recipient Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Recipient Address</span>
              <span className="text-sm font-bold text-gray-900">GDSXE...4LJ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Memo</span>
              <span className="text-sm text-gray-500">Order {item.name}</span>
            </div>
          </div>

          {/* Item Details */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getItemIcon(item.type)}
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {getItemBadge(item.type)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              
              {/* Features for subscriptions */}
              {item.type === 'subscription' && item.features && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {item.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Savings display */}
              {item.savings && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      You Save: {item.savings}
                    </span>
                    <Sparkles className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStep === 'processing' && (
            <div className="text-center space-y-4">
              <ImprovedPaymentSpinner 
                variant="processing" 
                size="lg" 
                message="Processing your payment..."
              />
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center space-y-4">
              <ImprovedPaymentSpinner 
                variant="success" 
                size="xl" 
                message="Payment Successful!"
              />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-sm text-gray-600">{item.name} has been purchased.</p>
              </div>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Payment Failed</h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {/* Debug Information - Only show in development and when not authenticated */}
          {process.env.NODE_ENV === 'development' && !isAuthenticated && (
            <div className="mb-4">
              <PaymentDebugPanel />
            </div>
          )}

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Secure payment powered by Pi Network</span>
          </div>

          {/* Action Buttons */}
          {paymentStep === 'confirm' && (
            <div className="space-y-3">
              {isAuthenticated ? (
                <Button
                  onClick={handlePayment}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-medium"
                  disabled={isProcessing}
                >
                  Pay With π
                </Button>
              ) : (
                <Button
                  onClick={handlePiSignIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in to Pay'
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 py-3 text-lg font-medium"
                disabled={isProcessing || isSigningIn}
              >
                Cancel
              </Button>
            </div>
          )}

          {paymentStep === 'success' && (
            <Button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          )}

          {paymentStep === 'error' && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setPaymentStep('confirm');
                  setError(null);
                }}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedPiPaymentModal;
