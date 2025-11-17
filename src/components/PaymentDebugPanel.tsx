import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, User, Shield } from 'lucide-react';

const PaymentDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshDebugInfo = () => {
    setRefreshKey(prev => prev + 1);
    
    const info = {
      timestamp: new Date().toISOString(),
      localStorage: {
        flappypiPiUser: localStorage.getItem('flappypi-pi-user'),
        flappypiPiAuth: localStorage.getItem('flappypi-pi-auth'),
        flappypiUsername: localStorage.getItem('flappypi-username'),
        piUser: localStorage.getItem('pi_user'),
        piAccessToken: localStorage.getItem('pi_access_token')
      },
      windowPi: {
        exists: typeof window !== 'undefined' && !!window.Pi,
        currentUserType: typeof window !== 'undefined' && window.Pi ? typeof window.Pi.currentUser : 'undefined',
        userExists: typeof window !== 'undefined' && window.Pi ? !!window.Pi.user : false,
        createPaymentExists: typeof window !== 'undefined' && window.Pi ? typeof window.Pi.createPayment === 'function' : false
      },
      environment: {
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
        isSandbox: typeof window !== 'undefined' ? window.location.hostname.includes('sandbox.minepi.com') : false,
        isPiNet: typeof window !== 'undefined' ? window.location.hostname.includes('pinet.com') : false
      }
    };
    
    setDebugInfo(info);
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [refreshKey]);

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    return status ? <Badge className="bg-green-100 text-green-800">Available</Badge> : <Badge className="bg-red-100 text-red-800">Not Available</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Payment Debug Panel
          <Button
            onClick={refreshDebugInfo}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Hostname:</span>
                <span className="font-medium">{debugInfo?.environment?.hostname || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Sandbox:</span>
                {getStatusIcon(debugInfo?.environment?.isSandbox || false)}
                <span>{debugInfo?.environment?.isSandbox ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>PiNet:</span>
                {getStatusIcon(debugInfo?.environment?.isPiNet || false)}
                <span>{debugInfo?.environment?.isPiNet ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pi SDK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span>window.Pi:</span>
                {getStatusIcon(debugInfo?.windowPi?.exists || false)}
                <span>{debugInfo?.windowPi?.exists ? 'Available' : 'Not Available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>createPayment:</span>
                {getStatusIcon(debugInfo?.windowPi?.createPaymentExists || false)}
                <span>{debugInfo?.windowPi?.createPaymentExists ? 'Available' : 'Not Available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>currentUser:</span>
                <span className="font-medium">{debugInfo?.windowPi?.currentUserType || 'Unknown'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* localStorage Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">localStorage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <span>flappypi-pi-user:</span>
                {getStatusBadge(!!debugInfo?.localStorage?.flappypiPiUser)}
              </div>
              <div className="flex items-center justify-between">
                <span>flappypi-pi-auth:</span>
                {getStatusBadge(!!debugInfo?.localStorage?.flappypiPiAuth)}
              </div>
              <div className="flex items-center justify-between">
                <span>flappypi-username:</span>
                {getStatusBadge(!!debugInfo?.localStorage?.flappypiUsername)}
              </div>
              <div className="flex items-center justify-between">
                <span>pi_user:</span>
                {getStatusBadge(!!debugInfo?.localStorage?.piUser)}
              </div>
              <div className="flex items-center justify-between">
                <span>pi_access_token:</span>
                {getStatusBadge(!!debugInfo?.localStorage?.piAccessToken)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Raw Debug Data */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDebugPanel;
