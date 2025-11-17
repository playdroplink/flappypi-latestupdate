import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Zap, Shield } from 'lucide-react';

const PaymentDiagnostic: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        isBrowser: typeof window !== 'undefined',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        isPiBrowser: typeof window !== 'undefined' && !!window.Pi,
        isSandbox: typeof window !== 'undefined' && window.location.hostname.includes('sandbox.minepi.com'),
        isPiNet: typeof window !== 'undefined' && window.location.hostname.includes('pinet.com')
      },
      piSDK: {
        exists: typeof window !== 'undefined' && !!window.Pi,
        createPayment: typeof window !== 'undefined' && window.Pi && typeof window.Pi.createPayment === 'function',
        authenticate: typeof window !== 'undefined' && window.Pi && typeof window.Pi.authenticate === 'function',
        currentUser: typeof window !== 'undefined' && window.Pi && typeof window.Pi.currentUser === 'function',
        getUser: typeof window !== 'undefined' && window.Pi && typeof window.Pi.getUser === 'function'
      },
      authentication: {
        flappypiPiUser: !!localStorage.getItem('flappypi-pi-user'),
        flappypiPiAuth: localStorage.getItem('flappypi-pi-auth') === 'true',
        piUser: !!localStorage.getItem('pi_user'),
        piAccessToken: !!localStorage.getItem('pi_access_token')
      },
      services: {
        directPaymentService: typeof directPaymentService !== 'undefined',
        walletAddressVerification: typeof walletAddressVerification !== 'undefined'
      }
    };
    
    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    return status ? <Badge className="bg-green-100 text-green-800">Working</Badge> : <Badge className="bg-red-100 text-red-800">Not Working</Badge>;
  };

  const getOverallStatus = () => {
    if (!testResults) return 'Unknown';
    
    const criticalChecks = [
      testResults.environment.isBrowser,
      testResults.piSDK.exists,
      testResults.piSDK.createPayment,
      testResults.services.directPaymentService
    ];
    
    const allCritical = criticalChecks.every(check => check);
    return allCritical ? 'Working' : 'Issues Found';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Payment System Diagnostic
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getOverallStatus() === 'Working' ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
            <h3 className="text-xl font-semibold">
              Payment System: {getOverallStatus()}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {getOverallStatus() === 'Working' 
              ? 'All critical components are working correctly'
              : 'Some components need attention'
            }
          </p>
        </div>

        {testResults && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Environment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Environment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Browser:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.environment.isBrowser)}
                    {getStatusBadge(testResults.environment.isBrowser)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pi Browser:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.environment.isPiBrowser)}
                    {getStatusBadge(testResults.environment.isPiBrowser)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sandbox:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.environment.isSandbox)}
                    {getStatusBadge(testResults.environment.isSandbox)}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Hostname: {testResults.environment.hostname}
                </div>
              </CardContent>
            </Card>

            {/* Pi SDK Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pi SDK</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Available:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.piSDK.exists)}
                    {getStatusBadge(testResults.piSDK.exists)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>createPayment:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.piSDK.createPayment)}
                    {getStatusBadge(testResults.piSDK.createPayment)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>authenticate:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.piSDK.authenticate)}
                    {getStatusBadge(testResults.piSDK.authenticate)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>currentUser:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.piSDK.currentUser)}
                    {getStatusBadge(testResults.piSDK.currentUser)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>flappypi-pi-user:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.authentication.flappypiPiUser)}
                    {getStatusBadge(testResults.authentication.flappypiPiUser)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>flappypi-pi-auth:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.authentication.flappypiPiAuth)}
                    {getStatusBadge(testResults.authentication.flappypiPiAuth)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>pi_user:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.authentication.piUser)}
                    {getStatusBadge(testResults.authentication.piUser)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>pi_access_token:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.authentication.piAccessToken)}
                    {getStatusBadge(testResults.authentication.piAccessToken)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>DirectPaymentService:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.services.directPaymentService)}
                    {getStatusBadge(testResults.services.directPaymentService)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>WalletVerification:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.services.walletAddressVerification)}
                    {getStatusBadge(testResults.services.walletAddressVerification)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        {testResults && getOverallStatus() !== 'Working' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-yellow-700">
                {!testResults.environment.isPiBrowser && (
                  <li>• Use Pi Browser to enable Pi Network payments</li>
                )}
                {!testResults.environment.isSandbox && (
                  <li>• Access the app through Pi Network sandbox environment</li>
                )}
                {!testResults.piSDK.createPayment && (
                  <li>• Ensure Pi SDK is properly loaded</li>
                )}
                {!testResults.authentication.flappypiPiAuth && (
                  <li>• Sign in with Pi Network to enable payments</li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDiagnostic;
