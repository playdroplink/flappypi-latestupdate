import React, { useState, useEffect } from 'react';
import { PI_CONFIG } from '@/config/piConfig';

interface PaymentDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentDebugger: React.FC<PaymentDebuggerProps> = ({ isOpen, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Capture debug information
      const info = {
        networkMode: PI_CONFIG.getNetworkMode(),
        isTestnet: PI_CONFIG.isTestnet(),
        isMainnet: PI_CONFIG.isMainnet(),
        isSandbox: PI_CONFIG.isSandbox(),
        isProduction: PI_CONFIG.isProduction(),
        appId: PI_CONFIG.getAppId(),
        apiUrl: PI_CONFIG.getApiUrl(),
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        piSdkAvailable: typeof window !== 'undefined' && typeof window.Pi !== 'undefined',
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(info);
      
      // Capture console logs
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        setLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
        originalLog(...args);
      };
      
      console.error = (...args) => {
        setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
        originalError(...args);
      };
      
      return () => {
        console.log = originalLog;
        console.error = originalError;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Debugger</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Configuration Info */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Configuration</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Network Mode: <span className="font-mono">{debugInfo?.networkMode}</span></div>
              <div>Is Testnet: <span className="font-mono text-green-600">{debugInfo?.isTestnet ? '✅' : '❌'}</span></div>
              <div>Is Mainnet: <span className="font-mono text-red-600">{debugInfo?.isMainnet ? '✅' : '❌'}</span></div>
              <div>Is Sandbox: <span className="font-mono text-yellow-600">{debugInfo?.isSandbox ? '✅' : '❌'}</span></div>
              <div>App ID: <span className="font-mono">{debugInfo?.appId}</span></div>
              <div>API URL: <span className="font-mono">{debugInfo?.apiUrl}</span></div>
              <div>Pi SDK: <span className="font-mono text-green-600">{debugInfo?.piSdkAvailable ? '✅' : '❌'}</span></div>
              <div>Hostname: <span className="font-mono">{debugInfo?.hostname}</span></div>
            </div>
          </div>
          
          {/* Payment Routing Info */}
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="font-bold mb-2">Payment Routing</h3>
            <div className="text-sm">
              <div className="text-red-700">
                <div>⚠️ Payments will route to: <span className="font-mono">realPiPaymentService</span></div>
                <div>🌐 API: <span className="font-mono">https://api.minepi.com</span></div>
                <div>💰 Currency: <span className="font-mono">PI</span></div>
                <div>🎯 Mode: <span className="font-mono">Mainnet Production</span></div>
              </div>
            </div>
          </div>
          
          {/* Console Logs */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Console Logs</h3>
            <div className="max-h-40 overflow-y-auto text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Test Payment Button */}
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-bold mb-2">Test Payment</h3>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing payment routing...');
                  console.log('🔧 Current mode:', debugInfo?.networkMode);
                  console.log('🔧 Is Sandbox:', debugInfo?.isSandbox);
                  
                  if (typeof window !== 'undefined' && window.Pi) {
                    console.log('✅ Pi SDK is available');
                    
                    // Create payment based on current mode
                    const paymentData = debugInfo?.isSandbox ? {
                      amount: 0.01,
                      currency: 'TEST_PI',
                      memo: 'Flappy Pi Sandbox: Test Payment',
                      metadata: {
                        test: true,
                        sandbox: true,
                        timestamp: Date.now(),
                        mode: 'mainnet'
                      }
                    } : {
                      amount: 0.01,
                      currency: 'TEST_PI',
                      memo: 'Flappy Pi Testnet: Test Payment',
                      metadata: {
                        test: true,
                        testnet: true,
                        timestamp: Date.now(),
                        mode: 'testnet'
                      }
                    };
                    
                    console.log('💰 Creating payment with data:', paymentData);
                    
                    // Test payment creation via callback-based API
                    window.Pi.createPayment(paymentData, {
                      onReadyForServerApproval: (paymentId: string) => console.log('Ready for approval:', paymentId),
                      onReadyForServerCompletion: (paymentId: string, txid: string) => console.log('Payment completed:', paymentId, txid),
                      onCancel: (paymentId: string) => console.warn('Payment cancelled:', paymentId),
                      onError: (error: any) => console.error('Payment error:', error)
                    });
                    console.log('✅ Payment initiation invoked');
                  } else {
                    console.error('❌ Pi SDK not available');
                    console.error('❌ window.Pi:', typeof window !== 'undefined' ? typeof window.Pi : 'window undefined');
                  }
                } catch (error) {
                  console.error('❌ Test payment failed:', error);
                  console.error('❌ Error details:', error.message);
                  console.error('❌ Error stack:', error.stack);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Payment (0.01 TEST_PI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDebugger;
