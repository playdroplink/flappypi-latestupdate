import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pi, Shield, CreditCard, Users, Zap } from 'lucide-react';
import PiAuthDemo from '@/components/PiAuthDemo';
import PiPaymentDemo from '@/components/PiPaymentDemo';

interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

const PiDemoPage: React.FC = () => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleAuthSuccess = (userData: PiUser) => {
    setUser(userData);
    setAuthError(null);
    console.log('✅ Authentication successful:', userData);
  };

  const handleAuthError = (error: string) => {
    setAuthError(error);
    setUser(null);
    console.error('❌ Authentication failed:', error);
  };

  const handlePaymentSuccess = (result: any) => {
    setPaymentSuccess(result);
    setPaymentError(null);
    console.log('✅ Payment successful:', result);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(null);
    console.error('❌ Payment failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Pi className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pi Network Demo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Following the official Pi demo patterns for authentication and payments in testnet mode.
            This demonstrates how to integrate Pi Auth and Pi Payment features in your application.
          </p>
          
          {/* Status Badges */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Testnet Mode
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Sandbox Enabled
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="auth" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auth" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Authentication Demo */}
              <PiAuthDemo 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />

              {/* Authentication Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Authentication Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Authenticated</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium">User: {user.username}</p>
                        <p className="text-xs text-gray-600">UID: {user.uid}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="font-medium">Not Authenticated</span>
                      </div>
                      {authError && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-red-600">{authError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Demo */}
              <PiPaymentDemo 
                user={user}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentSuccess ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Payment Successful</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium">Status: {paymentSuccess.status}</p>
                        {paymentSuccess.paymentId && (
                          <p className="text-xs text-gray-600">Payment ID: {paymentSuccess.paymentId}</p>
                        )}
                        {paymentSuccess.txid && (
                          <p className="text-xs text-gray-600">Transaction ID: {paymentSuccess.txid}</p>
                        )}
                      </div>
                    </div>
                  ) : paymentError ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium">Payment Failed</span>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-red-600">{paymentError}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="font-medium">No Payment</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Create a test payment to see the status here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">1. Authentication</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use Pi Browser to access this page</li>
                  <li>• Click "Connect with Pi Network"</li>
                  <li>• Complete the authentication flow</li>
                  <li>• You'll see your username and UID</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Payment</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Authenticate first (step 1)</li>
                  <li>• Enter payment amount (Test-Pi)</li>
                  <li>• Click "Pay with Pi"</li>
                  <li>• Complete the payment flow</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This demo uses Test-Pi (no real value) in testnet mode. 
                All payments are for testing purposes only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PiDemoPage;
