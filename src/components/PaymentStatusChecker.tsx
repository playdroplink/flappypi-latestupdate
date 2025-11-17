import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { PI_CONFIG } from '@/config/piConfig';
import { realPiPaymentService } from '@/services/realPiPaymentService';

interface PaymentStatus {
  network: string;
  isMainnet: boolean;
  isProduction: boolean;
  sdkAvailable: boolean;
}

const PaymentStatusChecker: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);

  const checkPaymentStatus = () => {
    setLoading(true);
    
    try {
      const status = realPiPaymentService.getPaymentStatus();
      setPaymentStatus(status);
      
      const envInfo = PI_CONFIG.detectEnvironment();
      setEnvironmentInfo(envInfo);
      
      console.log('🔍 Payment Status Check:', status);
      console.log('🌍 Environment Info:', envInfo);
    } catch (error) {
      console.error('❌ Payment status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"} className="ml-2">
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  if (!paymentStatus) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Payment Status Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Button onClick={checkPaymentStatus} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Payment Status Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(paymentStatus.isMainnet)}
            <span className="font-medium">Network Mode</span>
          </div>
          {getStatusBadge(paymentStatus.isMainnet, "Mainnet", "Testnet")}
        </div>

        {/* Production Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(paymentStatus.isProduction)}
            <span className="font-medium">Production Mode</span>
          </div>
          {getStatusBadge(paymentStatus.isProduction, "Production", "Development")}
        </div>

        {/* SDK Availability */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(paymentStatus.sdkAvailable)}
            <span className="font-medium">Pi SDK Available</span>
          </div>
          {getStatusBadge(paymentStatus.sdkAvailable, "Available", "Not Available")}
        </div>

        {/* Environment Info */}
        {environmentInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Environment Details</h4>
            <div className="text-sm space-y-1 text-blue-700">
              <div>Hostname: {environmentInfo.hostname}</div>
              <div>Pi Browser: {environmentInfo.isPiBrowser ? "Yes" : "No"}</div>
              <div>Mobile: {environmentInfo.isMobile ? "Yes" : "No"}</div>
              <div>Development: {environmentInfo.isDevelopment ? "Yes" : "No"}</div>
            </div>
          </div>
        )}

        {/* Configuration Info */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Configuration</h4>
          <div className="text-sm space-y-1 text-green-700">
            <div>App ID: {PI_CONFIG.getAppId()}</div>
            <div>API URL: {PI_CONFIG.getApiUrl()}</div>
            <div>Subdomain: {PI_CONFIG.getSubdomain()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button onClick={checkPaymentStatus} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Status Summary */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Status Summary</span>
          </div>
          <div className="text-sm text-yellow-700">
            {paymentStatus.isMainnet && paymentStatus.isProduction && paymentStatus.sdkAvailable ? (
              <span className="text-green-600 font-medium">✅ All systems ready for real Pi payments!</span>
            ) : (
              <span className="text-red-600 font-medium">⚠️ Some systems need attention for real payments.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusChecker;
