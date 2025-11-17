import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, User, Shield, CreditCard } from 'lucide-react';

interface PaymentTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentTestModal: React.FC<PaymentTestModalProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runPaymentTests = async () => {
    setIsRunning(true);
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hostname: window.location.hostname,
        isSandbox: window.location.hostname.includes('sandbox.minepi.com'),
        isPiNet: window.location.hostname.includes('pinet.com'),
        isPiBrowser: !!window.Pi
      },
      authentication: {
        flappypiPiUser: !!localStorage.getItem('flappypi-pi-user'),
        flappypiPiAuth: localStorage.getItem('flappypi-pi-auth') === 'true',
        piUser: !!localStorage.getItem('pi_user'),
        piAccessToken: !!localStorage.getItem('pi_access_token')
      },
      piSDK: {
        exists: !!window.Pi,
        createPayment: typeof window.Pi?.createPayment === 'function',
        authenticate: typeof window.Pi?.authenticate === 'function',
        currentUser: typeof window.Pi?.currentUser === 'function'
      },
      userData: {
        flappypiUser: localStorage.getItem('flappypi-pi-user'),
        piSDKUser: localStorage.getItem('pi_user')
      }
    };
    
    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    return status ? <Badge className="bg-green-100 text-green-800">Available</Badge> : <Badge className="bg-red-100 text-red-800">Not Available</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Payment System Test
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runPaymentTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Run Payment Tests
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {testResults && (
            <div className="space-y-4">
              {/* Environment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Environment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Hostname:</span>
                    <span className="font-medium">{testResults.environment.hostname}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sandbox:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults.environment.isSandbox)}
                      {getStatusBadge(testResults.environment.isSandbox)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pi Browser:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults.environment.isPiBrowser)}
                      {getStatusBadge(testResults.environment.isPiBrowser)}
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

              {/* Pi SDK Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pi SDK</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>window.Pi:</span>
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

              {/* Raw Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw Test Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentTestModal;
