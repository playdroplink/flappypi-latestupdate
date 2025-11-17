import React, { useState } from 'react';

const SimplePaymentTest = () => {
  const [result, setResult] = useState('');

  const testPayment = async () => {
    try {
      setResult('🔄 Testing payment...');
      
      if (typeof window === 'undefined' || !window.Pi) {
        setResult('❌ Pi SDK not available');
        return;
      }
      
      window.Pi.createPayment({
        amount: 0.01,
        memo: 'Flappy Pi Testnet: Simple Test',
        metadata: { test: true, testnet: true }
      }, {
        onReadyForServerApproval: (paymentId: string) => setResult('✅ Ready for approval: ' + paymentId),
        onReadyForServerCompletion: (paymentId: string, txid: string) => setResult('✅ Completed: ' + paymentId + ' txid: ' + txid),
        onCancel: (paymentId: string) => setResult('❌ Cancelled: ' + paymentId),
        onError: (error: any) => setResult('❌ Error: ' + (error?.message || 'Payment error'))
      });
    } catch (error) {
      setResult('❌ Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '10px', margin: '20px' }}>
      <h2>🧪 Simple Payment Test</h2>
      <button 
        onClick={testPayment}
        style={{ 
          padding: '10px 20px', 
          background: 'blue', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Payment (0.01 TEST_PI)
      </button>
      <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
        {result}
      </div>
    </div>
  );
};

export default SimplePaymentTest;