import React, { useState } from 'react';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

export default function PiTestPage() {
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [authStatus, setAuthStatus] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sdkStatus, setSdkStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [nativeFeatures, setNativeFeatures] = useState<string[]>([]);

  // Test Pi SDK status
  const handleCheckSDK = () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      setSdkStatus('✅ Pi SDK loaded');
    } else {
      setSdkStatus('❌ Pi SDK not loaded');
    }
  };

  // Test Pi Auth
  const handlePiAuth = async () => {
    setAuthStatus('Connecting...');
    try {
      const Pi = (window as any).Pi;
      if (!Pi || typeof Pi.authenticate !== 'function') {
        setAuthStatus('❌ Pi SDK not available or authenticate not a function');
        return;
      }
      const auth = await Pi.authenticate(['payments'], (payment: any) => {
        console.log('Incomplete payment found:', payment);
      });
      setAuthStatus('✅ Authenticated!');
      setUserInfo(auth.user);
    } catch (err: any) {
      setAuthStatus('❌ Auth failed: ' + (err?.message || err));
    }
  };

  // Test Pi Payment (testnet)
  const handleTestPayment = async () => {
    setPaymentStatus('Processing...');
    try {
      const Pi = (window as any).Pi;
      if (!Pi || typeof Pi.createPayment !== 'function') {
        setPaymentStatus('❌ Pi SDK not available or createPayment not a function');
        return;
      }
      Pi.createPayment({
        amount: 0.01,
        memo: 'Testnet payment',
        metadata: { type: 'test', timestamp: Date.now() }
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          setPaymentStatus('Ready for server approval: ' + paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          setPaymentStatus('Ready for server completion: ' + paymentId + ', txid: ' + txid);
        },
        onCancel: (paymentId: string) => {
          setPaymentStatus('❌ Payment cancelled: ' + paymentId);
        },
        onError: (error: any, payment: any) => {
          setPaymentStatus('❌ Payment error: ' + (error?.message || error));
        }
      });
    } catch (err: any) {
      setPaymentStatus('❌ Payment failed: ' + (err?.message || err));
    }
  };

  // Test Pi native features
  const handleCheckNativeFeatures = async () => {
    try {
      const Pi = (window as any).Pi;
      if (!Pi || typeof Pi.nativeFeaturesList !== 'function') {
        setNativeFeatures(['❌ Pi SDK not available or nativeFeaturesList not a function']);
        return;
      }
      const features = await Pi.nativeFeaturesList();
      setNativeFeatures(features);
    } catch (err: any) {
      setNativeFeatures(['❌ Error: ' + (err?.message || err)]);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Pi Testnet Payment Page</h2>
      <div style={{ margin: '16px 0' }}>
        <button onClick={handleCheckSDK}>Check Pi SDK Status</button>
        <span style={{ marginLeft: 12 }}>{sdkStatus}</span>
      </div>
      <div style={{ margin: '16px 0' }}>
        <button onClick={handlePiAuth}>Test Pi Auth (Login)</button>
        <span style={{ marginLeft: 12 }}>{authStatus}</span>
      </div>
      {userInfo && (
        <div style={{ margin: '8px 0', padding: 8, background: '#eef', borderRadius: 4 }}>
          <strong>Current Pi User:</strong>
          <pre style={{ margin: 0 }}>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
      <div style={{ margin: '16px 0' }}>
        <button onClick={handleTestPayment}>Test Pi Payment (Testnet)</button>
        <span style={{ marginLeft: 12 }}>{paymentStatus}</span>
      </div>
      <div style={{ margin: '16px 0' }}>
        <button onClick={handleCheckNativeFeatures}>Check Pi Native Features</button>
        {nativeFeatures.length > 0 && (
          <ul style={{ marginTop: 8 }}>
            {nativeFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
} 