import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { piNetworkSDK, type Scope, type PaymentData, type PaymentCallbacks, type PaymentDTO, type AdType } from '@/services/piNetworkSDK';
import { 
  User, 
  CreditCard, 
  Play, 
  Share2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Coins,
  Heart
} from 'lucide-react';

/**
 * Comprehensive Pi Network SDK Example Component
 * Demonstrates all SDK features according to official documentation
 */
export const PiNetworkSDKExample: React.FC = () => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [nativeFeatures, setNativeFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sdkStatus, setSdkStatus] = useState<any>(null);

  // Initialize SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Pi Network SDK for mainnet
        await piNetworkSDK.init({
          version: "2.0",
          sandbox: false // Mainnet mode
        });
        
        setIsInitialized(true);
        
        // Get SDK status
        const status = piNetworkSDK.getStatus();
        setSdkStatus(status);
        
        // Get native features
        try {
          const features = await piNetworkSDK.nativeFeaturesList();
          setNativeFeatures(features);
        } catch (error) {
          console.warn('Could not get native features:', error);
        }
        
        toast({
          title: "SDK Initialized",
          description: "Pi Network SDK initialized successfully for mainnet",
        });
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
        toast({
          title: "SDK Initialization Failed",
          description: "Please ensure you are using Pi Browser",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, [toast]);

  // Check authentication status
  useEffect(() => {
    if (isInitialized) {
      const checkAuth = () => {
        const authenticated = piNetworkSDK.isAuthenticated();
        const user = piNetworkSDK.currentUser();
        
        setIsAuthenticated(authenticated);
        setCurrentUser(user);
      };

      checkAuth();
      
      // Check periodically
      const interval = setInterval(checkAuth, 5000);
      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  // Handle incomplete payment found
  const handleIncompletePayment = (payment: PaymentDTO) => {
    console.log('💰 Found incomplete payment:', payment);
    
    toast({
      title: "Incomplete Payment Found",
      description: `Payment of ${payment.amount} Pi needs to be completed`,
      variant: "destructive",
    });
    
    // Here you would typically send the payment to your server for completion
    // For this example, we'll just show a message
  };

  // Authenticate user
  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      
      const scopes: Scope[] = ['username', 'payments', 'wallet_address'];
      const auth = await piNetworkSDK.authenticate(scopes, handleIncompletePayment);
      
      setCurrentUser(auth.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Authentication Successful",
        description: `Welcome, ${auth.user.username}!`,
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create payment
  const handleCreatePayment = () => {
    const paymentData: PaymentData = {
      amount: 1.0,
      memo: "Flappy Pi Premium Upgrade",
      metadata: {
        itemId: "premium_upgrade",
        gameMode: "classic"
      }
    };

    const callbacks: PaymentCallbacks = {
      onReadyForServerApproval: (paymentId: string) => {
        console.log('💰 Payment ready for server approval:', paymentId);
        toast({
          title: "Payment Created",
          description: "Payment is ready for server approval",
        });
        
        // Here you would send paymentId to your server for approval
      },
      
      onReadyForServerCompletion: (paymentId: string, txid: string) => {
        console.log('✅ Payment ready for server completion:', paymentId, txid);
        toast({
          title: "Payment Submitted",
          description: "Payment has been submitted to blockchain",
        });
        
        // Here you would send paymentId and txid to your server for completion
      },
      
      onCancel: (paymentId: string) => {
        console.log('❌ Payment cancelled:', paymentId);
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled by user",
          variant: "destructive",
        });
      },
      
      onError: (error: Error, payment?: PaymentDTO) => {
        console.error('❌ Payment error:', error, payment);
        toast({
          title: "Payment Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    try {
      piNetworkSDK.createPayment(paymentData, callbacks);
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast({
        title: "Payment Creation Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Show rewarded ad
  const handleShowRewardedAd = async () => {
    try {
      setIsLoading(true);
      
      const result = await piNetworkSDK.Ads.showAd('rewarded');
      
      if (result.type === 'rewarded') {
        if (result.result === 'AD_REWARDED') {
          toast({
            title: "Ad Rewarded!",
            description: `You earned a reward! Ad ID: ${result.adId}`,
          });
          
          // Here you would grant the reward to the user
          // You should verify the adId with Pi Platform API
        } else {
          toast({
            title: "Ad Not Rewarded",
            description: `Ad result: ${result.result}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      toast({
        title: "Ad Error",
        description: "Failed to show ad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show interstitial ad
  const handleShowInterstitialAd = async () => {
    try {
      setIsLoading(true);
      
      const result = await piNetworkSDK.Ads.showAd('interstitial');
      
      if (result.type === 'interstitial') {
        if (result.result === 'AD_CLOSED') {
          toast({
            title: "Ad Displayed",
            description: "Interstitial ad was shown successfully",
          });
        } else {
          toast({
            title: "Ad Error",
            description: `Ad result: ${result.result}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      toast({
        title: "Ad Error",
        description: "Failed to show ad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if ad is ready
  const handleCheckAdReady = async (adType: AdType) => {
    try {
      const result = await piNetworkSDK.Ads.isAdReady(adType);
      toast({
        title: `${adType.charAt(0).toUpperCase() + adType.slice(1)} Ad Status`,
        description: result.ready ? "Ad is ready" : "Ad is not ready",
      });
    } catch (error) {
      console.error('Failed to check ad ready status:', error);
    }
  };

  // Request ad
  const handleRequestAd = async (adType: AdType) => {
    try {
      setIsLoading(true);
      
      const result = await piNetworkSDK.Ads.requestAd(adType);
      
      toast({
        title: `${adType.charAt(0).toUpperCase() + adType.slice(1)} Ad Request`,
        description: `Result: ${result.result}`,
      });
    } catch (error) {
      console.error('Failed to request ad:', error);
      toast({
        title: "Ad Request Failed",
        description: "Failed to request ad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Share dialog
  const handleShare = () => {
    try {
      piNetworkSDK.openShareDialog(
        "Flappy Pi - Amazing Game!",
        "Check out this awesome Flappy Pi game on Pi Network! 🎮"
      );
    } catch (error) {
      console.error('Failed to open share dialog:', error);
      toast({
        title: "Share Failed",
        description: "Failed to open share dialog",
        variant: "destructive",
      });
    }
  };

  // Open URL in system browser
  const handleOpenUrl = async () => {
    try {
      await piNetworkSDK.openUrlInSystemBrowser('https://minepi.com');
      toast({
        title: "URL Opened",
        description: "URL opened in system browser",
      });
    } catch (error) {
      console.error('Failed to open URL:', error);
      toast({
        title: "URL Open Failed",
        description: "Failed to open URL in system browser",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing Pi Network SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pi Network SDK Example
          </CardTitle>
          <CardDescription>
            Comprehensive demonstration of all Pi Network SDK features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SDK Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isInitialized ? "default" : "secondary"}>
                {isInitialized ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                SDK Initialized
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Authenticated
              </Badge>
            </div>
          </div>

          {/* Current User */}
          {currentUser && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                Logged in as: <strong>{currentUser.username}</strong> (UID: {currentUser.uid})
              </AlertDescription>
            </Alert>
          )}

          {/* Native Features */}
          {nativeFeatures.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Available Native Features:</h3>
              <div className="flex flex-wrap gap-2">
                {nativeFeatures.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Authenticate with Pi Network</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAuthenticate} 
            disabled={!isInitialized || isAuthenticated || isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <User className="h-4 w-4 mr-2" />}
            {isAuthenticated ? "Already Authenticated" : "Authenticate with Pi"}
          </Button>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments
          </CardTitle>
          <CardDescription>Create Pi cryptocurrency payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreatePayment} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
            Create Payment (1 Pi)
          </Button>
        </CardContent>
      </Card>

      {/* Ads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ads
          </CardTitle>
          <CardDescription>Display rewarded and interstitial ads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleShowRewardedAd} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              Rewarded Ad
            </Button>
            <Button 
              onClick={handleShowInterstitialAd} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Interstitial Ad
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => handleCheckAdReady('rewarded')} 
              variant="secondary"
              size="sm"
            >
              Check Rewarded Ad
            </Button>
            <Button 
              onClick={() => handleCheckAdReady('interstitial')} 
              variant="secondary"
              size="sm"
            >
              Check Interstitial Ad
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => handleRequestAd('rewarded')} 
              variant="secondary"
              size="sm"
            >
              Request Rewarded Ad
            </Button>
            <Button 
              onClick={() => handleRequestAd('interstitial')} 
              variant="secondary"
              size="sm"
            >
              Request Interstitial Ad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Native Features */}
      <Card>
        <CardHeader>
          <CardTitle>Native Features</CardTitle>
          <CardDescription>Use Pi Browser native features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleShare} 
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Dialog
            </Button>
            <Button 
              onClick={handleOpenUrl} 
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open URL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SDK Status Details */}
      {sdkStatus && (
        <Card>
          <CardHeader>
            <CardTitle>SDK Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sdkStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PiNetworkSDKExample;
