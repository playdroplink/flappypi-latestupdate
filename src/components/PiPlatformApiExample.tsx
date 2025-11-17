import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { piPlatformApi, type UserDTO, type PaymentDTO, type RewardedAdStatusDTO } from '@/services/piPlatformApi';
import { piAuthService } from '@/services/piAuthService';
import { 
  User, 
  CreditCard, 
  Play, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Coins,
  RefreshCw,
  Search,
  Eye,
  Key
} from 'lucide-react';

/**
 * Pi Network Platform API Example Component
 * Demonstrates all server-side Platform API features
 */
export const PiPlatformApiExample: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserDTO | null>(null);
  const [paymentId, setPaymentId] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentDTO | null>(null);
  const [adId, setAdId] = useState<string>('');
  const [adStatus, setAdStatus] = useState<RewardedAdStatusDTO | null>(null);
  const [incompletePayments, setIncompletePayments] = useState<PaymentDTO[]>([]);

  // Initialize and get API status
  useEffect(() => {
    const status = piPlatformApi.getApiStatus();
    setApiStatus(status);
  }, []);

  // Get user info using access token
  const handleGetUserInfo = async () => {
    if (!accessToken.trim()) {
      toast({
        title: "Access Token Required",
        description: "Please enter an access token",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const user = await piPlatformApi.getUserInfo(accessToken);
      setUserInfo(user);
      toast({
        title: "User Info Retrieved",
        description: `User: ${user.username || user.uid}`,
      });
    } catch (error) {
      console.error('Failed to get user info:', error);
      toast({
        title: "Failed to Get User Info",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment information
  const handleGetPayment = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Payment ID Required",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const payment = await piPlatformApi.getPayment(paymentId);
      setPaymentInfo(payment);
      toast({
        title: "Payment Retrieved",
        description: `Payment: ${payment.identifier}`,
      });
    } catch (error) {
      console.error('Failed to get payment:', error);
      toast({
        title: "Failed to Get Payment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Approve payment
  const handleApprovePayment = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Payment ID Required",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const payment = await piPlatformApi.approvePayment(paymentId);
      setPaymentInfo(payment);
      toast({
        title: "Payment Approved",
        description: `Payment ${payment.identifier} approved successfully`,
      });
    } catch (error) {
      console.error('Failed to approve payment:', error);
      toast({
        title: "Failed to Approve Payment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Complete payment
  const handleCompletePayment = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Payment ID Required",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll use a sample txid
    const txid = "7a7ed20d3d72c365b9019baf8dc4c4e3cce4c08114d866e47ae157e3a796e9e7";

    try {
      setIsLoading(true);
      const payment = await piPlatformApi.completePayment(paymentId, txid);
      setPaymentInfo(payment);
      toast({
        title: "Payment Completed",
        description: `Payment ${payment.identifier} completed with txid: ${txid}`,
      });
    } catch (error) {
      console.error('Failed to complete payment:', error);
      toast({
        title: "Failed to Complete Payment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel payment
  const handleCancelPayment = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Payment ID Required",
        description: "Please enter a payment ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const payment = await piPlatformApi.cancelPayment(paymentId);
      setPaymentInfo(payment);
      toast({
        title: "Payment Cancelled",
        description: `Payment ${payment.identifier} cancelled successfully`,
      });
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      toast({
        title: "Failed to Cancel Payment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get incomplete server payments
  const handleGetIncompletePayments = async () => {
    try {
      setIsLoading(true);
      const response = await piPlatformApi.getIncompleteServerPayments();
      setIncompletePayments(response.incomplete_server_payments);
      toast({
        title: "Incomplete Payments Retrieved",
        description: `Found ${response.incomplete_server_payments.length} incomplete payments`,
      });
    } catch (error) {
      console.error('Failed to get incomplete payments:', error);
      toast({
        title: "Failed to Get Incomplete Payments",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify rewarded ad
  const handleVerifyAd = async () => {
    if (!adId.trim()) {
      toast({
        title: "Ad ID Required",
        description: "Please enter an ad ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const adStatus = await piPlatformApi.verifyRewardedAd(adId);
      setAdStatus(adStatus);
      toast({
        title: "Ad Status Verified",
        description: `Ad ${adStatus.identifier}: ${adStatus.mediator_ack_status}`,
      });
    } catch (error) {
      console.error('Failed to verify ad:', error);
      toast({
        title: "Failed to Verify Ad",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a test payment (A2U)
  const handleCreateTestPayment = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use a sample user UID
      const testPaymentData = {
        payment: {
          amount: 1.0,
          memo: "Test payment from Flappy Pi",
          metadata: { 
            test: true, 
            game: "Flappy Pi",
            timestamp: new Date().toISOString()
          },
          uid: "a1111111-aaaa-bbbb-2222-ccccccc3333d" // Sample UID
        }
      };

      const payment = await piPlatformApi.createPayment(testPaymentData);
      setPaymentInfo(payment);
      setPaymentId(payment.identifier);
      
      toast({
        title: "Test Payment Created",
        description: `Payment ${payment.identifier} created successfully`,
      });
    } catch (error) {
      console.error('Failed to create test payment:', error);
      toast({
        title: "Failed to Create Test Payment",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pi Network Platform API Example
          </CardTitle>
          <CardDescription>
            Server-side Platform API integration for authentication, payments, and ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Status */}
          {apiStatus && (
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Key className="h-3 w-3" />
                  API Key: {apiStatus.hasServerApiKey ? 'Configured' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <CheckCircle className="h-3 w-3" />
                  Base URL: {apiStatus.baseUrl}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Eye className="h-3 w-3" />
                  Key Length: {apiStatus.serverApiKeyLength}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Verification</CardTitle>
          <CardDescription>Verify user access tokens with Platform API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              placeholder="Enter user access token..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleGetUserInfo} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <User className="h-4 w-4 mr-2" />}
            Get User Info
          </Button>
          
          {userInfo && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>User:</strong> {userInfo.username || userInfo.uid}<br />
                <strong>UID:</strong> {userInfo.uid}<br />
                <strong>Scopes:</strong> {userInfo.credentials.scopes.join(', ')}<br />
                <strong>Valid Until:</strong> {new Date(userInfo.credentials.valid_until.timestamp * 1000).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Management
          </CardTitle>
          <CardDescription>Manage payments using Platform API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleCreateTestPayment} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
              Create Test Payment (A2U)
            </Button>
            
            <Button 
              onClick={handleGetIncompletePayments} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Get Incomplete Payments
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentId">Payment ID</Label>
            <Input
              id="paymentId"
              placeholder="Enter payment ID..."
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={handleGetPayment} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              Get
            </Button>
            
            <Button 
              onClick={handleApprovePayment} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
              Approve
            </Button>
            
            <Button 
              onClick={handleCompletePayment} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
              Complete
            </Button>
            
            <Button 
              onClick={handleCancelPayment} 
              disabled={isLoading}
              size="sm"
              variant="destructive"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              Cancel
            </Button>
          </div>

          {/* Payment Info Display */}
          {paymentInfo && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment ID:</strong> {paymentInfo.identifier}<br />
                <strong>Amount:</strong> {paymentInfo.amount} Pi<br />
                <strong>Memo:</strong> {paymentInfo.memo}<br />
                <strong>Status:</strong> {piPlatformApi.getPaymentStatusSummary(paymentInfo)}<br />
                <strong>Direction:</strong> {paymentInfo.direction}<br />
                <strong>Network:</strong> {paymentInfo.network}
              </AlertDescription>
            </Alert>
          )}

          {/* Incomplete Payments Display */}
          {incompletePayments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Incomplete Server Payments:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {incompletePayments.map((payment) => (
                  <div key={payment.identifier} className="p-2 border rounded text-sm">
                    <strong>{payment.identifier}</strong> - {payment.amount} Pi - {piPlatformApi.getPaymentStatusSummary(payment)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ad Verification
          </CardTitle>
          <CardDescription>Verify rewarded ad status with Platform API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adId">Ad ID</Label>
            <Input
              id="adId"
              placeholder="Enter ad ID from rewarded ad..."
              value={adId}
              onChange={(e) => setAdId(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleVerifyAd} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Verify Ad Status
          </Button>
          
          {adStatus && (
            <Alert>
              <Play className="h-4 w-4" />
              <AlertDescription>
                <strong>Ad ID:</strong> {adStatus.identifier}<br />
                <strong>Status:</strong> {adStatus.mediator_ack_status}<br />
                <strong>Granted:</strong> {piPlatformApi.isRewardedAdGranted(adStatus) ? 'Yes' : 'No'}<br />
                {adStatus.mediator_granted_at && (
                  <><strong>Granted At:</strong> {new Date(adStatus.mediator_granted_at).toLocaleString()}<br /></>
                )}
                {adStatus.mediator_revoked_at && (
                  <><strong>Revoked At:</strong> {new Date(adStatus.mediator_revoked_at).toLocaleString()}</>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Platform API Info */}
      <Card>
        <CardHeader>
          <CardTitle>Platform API Information</CardTitle>
          <CardDescription>Official Pi Network Platform API features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Authentication</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>GET /me</code> - Verify user access tokens</li>
              <li>• Access token authorization for user-specific data</li>
              <li>• Server-side source of truth for user identity</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Payments</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>POST /payments</code> - Create App-to-User payments</li>
              <li>• <code>GET /payments/{'{payment_id}'}</code> - Get payment information</li>
              <li>• <code>POST /payments/{'{payment_id}'}/approve</code> - Approve payments</li>
              <li>• <code>POST /payments/{'{payment_id}'}/complete</code> - Complete payments</li>
              <li>• <code>POST /payments/{'{payment_id}'}/cancel</code> - Cancel payments</li>
              <li>• <code>GET /payments/incomplete_server_payments</code> - Get incomplete payments</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Ads</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>GET /ads_network/status/{'{adId}'}</code> - Verify rewarded ad status</li>
              <li>• Server-side verification of ad rewards</li>
              <li>• Prevents client-side reward manipulation</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Security</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Server API Key authorization for sensitive operations</li>
              <li>• Access token authorization for user data</li>
              <li>• All sensitive operations must be server-side</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiPlatformApiExample;
