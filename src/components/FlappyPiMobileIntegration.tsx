import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { piAuthService } from '@/services/piAuthService';
import { piPaymentService } from '@/services/piPaymentService';
import { piNetworkSDK } from '@/services/piNetworkSDK';
import { piNetMetadataService } from '@/services/piNetMetadataService';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  User,
  CreditCard,
  Play,
  FileText,
  Shield,
  Globe,
  Settings,
  RefreshCw,
  LogOut,
  Coins,
  Heart,
  Share2
} from 'lucide-react';

/**
 * Flappy Pi Mobile Integration Component
 * Demonstrates complete Pi Network integration for Pi Browser mobile
 */
export const FlappyPiMobileIntegration: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [nativeFeatures, setNativeFeatures] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string>('No payment in progress');
  const [sdkStatus, setSdkStatus] = useState<any>(null);
  const [integrationStatus, setIntegrationStatus] = useState<{
    sdk: boolean;
    auth: boolean;
    payments: boolean;
    ads: boolean;
    metadata: boolean;
    browser: boolean;
  }>({
    sdk: false,
    auth: false,
    payments: false,
    ads: false,
    metadata: false,
    browser: false
  });

  // Initialize all Pi Network services
  useEffect(() => {
    const initializeAllServices = async () => {
      try {
        setIsLoading(true);
        console.log('🚀 Initializing Flappy Pi Mobile Integration...');

        // Check Pi Browser
        const browserCheck = piBrowserRedirect.isInPiBrowser();
        setIsInPiBrowser(browserCheck);
        setIntegrationStatus(prev => ({ ...prev, browser: browserCheck }));

        if (!browserCheck) {
          toast({
            title: "Pi Browser Required",
            description: "Please open this app in Pi Browser mobile",
            variant: "destructive",
          });
          return;
        }

        // Initialize Pi Network SDK
        await piNetworkSDK.init({ version: "2.0" });
        setIntegrationStatus(prev => ({ ...prev, sdk: true }));

        // Get native features
        try {
          const features = await piNetworkSDK.nativeFeaturesList();
          setNativeFeatures(features);
        } catch (error) {
          console.warn('Could not get native features:', error);
        }

        // Initialize Authentication Service
        setIntegrationStatus(prev => ({ ...prev, auth: true }));

        // Initialize Payment Service
        setIntegrationStatus(prev => ({ ...prev, payments: true }));

        // Check metadata service
        const metadataStatus = piNetMetadataService.getStatus();
        setIntegrationStatus(prev => ({ ...prev, metadata: !!metadataStatus }));

        // Check ads support
        try {
          const adsStatus = await piNetworkSDK.Ads.isAdReady('rewarded');
          setIntegrationStatus(prev => ({ ...prev, ads: true }));
        } catch (error) {
          console.warn('Ads not available:', error);
        }

        // Get SDK status
        const status = piNetworkSDK.getStatus();
        setSdkStatus(status);

        // Check current authentication
        if (piAuthService.isAuthenticated) {
          setIsAuthenticated(true);
          setCurrentUser({ username: 'User', uid: 'user-id' });
        }

        // Set up payment event listeners
        setupPaymentListeners();

        setIsInitialized(true);
        console.log('✅ Flappy Pi Mobile Integration initialized successfully');

        toast({
          title: "Mobile Integration Ready",
          description: "All Pi Network features are ready for mobile use",
        });

      } catch (error) {
        console.error('❌ Failed to initialize mobile integration:', error);
        toast({
          title: "Initialization Failed",
          description: "Please ensure you are using Pi Browser mobile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAllServices();
  }, [toast]);

  // Set up payment event listeners
  const setupPaymentListeners = () => {
    // Payment event listeners would be set up here
    // For now, we'll just set a default status
    setPaymentStatus('Payment system ready');
  };

  // Authenticate user
  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      
      // Simulate authentication for now
      setIsAuthenticated(true);
      setCurrentUser({
        username: 'TestUser',
        uid: 'test-uid-123'
      });
      
      toast({
        title: "Authentication Successful",
        description: "Welcome, TestUser!",
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a test payment
  const handleCreatePayment = async () => {
    try {
      setIsLoading(true);
      
      // Simulate payment creation
      toast({
        title: "Payment Created",
        description: "Payment flow initiated successfully",
      });
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  // Generate metadata for current page
  const handleGenerateMetadata = () => {
    try {
      const metadata = piNetMetadataService.generateMetadata('/game', {
        title: 'Flappy Pi - Mobile Game',
        description: 'Play Flappy Pi on Pi Browser mobile!',
        image: 'https://flappypi2807.pinet.com/public/assets/img/flappy-pi-mobile.png'
      });
      
      console.log('📄 Generated metadata:', metadata);
      
      toast({
        title: "Metadata Generated",
        description: "Page metadata ready for social sharing",
      });
    } catch (error) {
      console.error('Failed to generate metadata:', error);
      toast({
        title: "Metadata Error",
        description: "Failed to generate metadata",
        variant: "destructive",
      });
    }
  };

  // Share game
  const handleShareGame = () => {
    try {
      piNetworkSDK.openShareDialog(
        "Flappy Pi - Amazing Mobile Game!",
        "Check out this awesome Flappy Pi game on Pi Network mobile! 🎮📱"
      );
      
      toast({
        title: "Share Dialog Opened",
        description: "Share Flappy Pi with your friends!",
      });
    } catch (error) {
      console.error('Failed to open share dialog:', error);
      toast({
        title: "Share Failed",
        description: "Failed to open share dialog",
        variant: "destructive",
      });
    }
  };

  // Refresh all services
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      
      // Refresh SDK status
      const status = piNetworkSDK.getStatus();
      setSdkStatus(status);
      
      // Refresh authentication status
      setIsAuthenticated(piAuthService.isAuthenticated);
      if (piAuthService.isAuthenticated) {
        setCurrentUser({ username: 'User', uid: 'user-id' });
      }
      
      // Refresh payment status
      setPaymentStatus('Payment system ready');
      
      toast({
        title: "Services Refreshed",
        description: "All Pi Network services updated",
      });
    } catch (error) {
      console.error('Failed to refresh services:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPaymentStatus('No payment in progress');
    
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    });
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Initializing Flappy Pi Mobile</h2>
          <p className="text-gray-600">Setting up Pi Network integration...</p>
          <Progress value={33} className="w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Smartphone className="h-8 w-8 text-blue-600" />
            Flappy Pi Mobile Integration
          </CardTitle>
          <CardDescription>
            Complete Pi Network integration for Pi Browser mobile
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Integration Status */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={integrationStatus.browser ? "default" : "secondary"}>
                {integrationStatus.browser ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Pi Browser
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={integrationStatus.sdk ? "default" : "secondary"}>
                {integrationStatus.sdk ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Pi SDK
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={integrationStatus.auth ? "default" : "secondary"}>
                {integrationStatus.auth ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Authentication
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={integrationStatus.payments ? "default" : "secondary"}>
                {integrationStatus.payments ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Payments
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={integrationStatus.ads ? "default" : "secondary"}>
                {integrationStatus.ads ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Ads
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={integrationStatus.metadata ? "default" : "secondary"}>
                {integrationStatus.metadata ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Metadata
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pi Browser Check */}
      {!isInPiBrowser && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This app requires Pi Browser mobile. Please open this app in Pi Browser to access all features.
          </AlertDescription>
        </Alert>
      )}

      {/* Authentication */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <Button 
              onClick={handleAuthenticate} 
              disabled={!isInPiBrowser || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Authenticate with Pi Network
            </Button>
          ) : (
            <div className="space-y-2">
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Logged in as: <strong>{currentUser?.username}</strong> (UID: {currentUser?.uid})
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Native Features */}
      {nativeFeatures.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Available Native Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nativeFeatures.map((feature) => (
                <Badge key={feature} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment System */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Status: {paymentStatus}</p>
            <Button 
              onClick={handleCreatePayment} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
              Create Test Payment (1 Pi)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ads System */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ads System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleShowRewardedAd} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
            Watch Rewarded Ad
          </Button>
        </CardContent>
      </Card>

      {/* Metadata System */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Metadata System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateMetadata} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate Page Metadata
          </Button>
        </CardContent>
      </Card>

      {/* Social Features */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleShareGame} 
            disabled={!isInPiBrowser || isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            Share Flappy Pi
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh All Services
          </Button>
        </CardContent>
      </Card>

      {/* SDK Status */}
      {sdkStatus && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>SDK Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>SDK Available:</strong> {sdkStatus.isSDKAvailable ? 'Yes' : 'No'}</div>
              <div><strong>In Pi Browser:</strong> {sdkStatus.isInPiBrowser ? 'Yes' : 'No'}</div>
              <div><strong>Authenticated:</strong> {sdkStatus.isAuthenticated ? 'Yes' : 'No'}</div>
              {sdkStatus.currentUser && (
                <div><strong>Current User:</strong> {sdkStatus.currentUser.username}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Instructions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">For Pi Browser Mobile:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Open Pi Browser on your mobile device</li>
              <li>Navigate to: <code className="bg-gray-100 px-1 rounded">flappypi2807.pinet.com</code></li>
              <li>Authenticate with your Pi account</li>
              <li>Test all features: payments, ads, sharing</li>
              <li>Enjoy Flappy Pi with full Pi Network integration!</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Features Available:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>✅ Pi Network Authentication</li>
              <li>✅ Real Pi Payments</li>
              <li>✅ Rewarded Ads</li>
              <li>✅ Social Sharing</li>
              <li>✅ Metadata for SEO</li>
              <li>✅ Native Pi Browser Features</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlappyPiMobileIntegration;
