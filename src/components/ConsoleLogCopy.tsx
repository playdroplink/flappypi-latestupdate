import React, { useState } from 'react';

const ConsoleLogCopy: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapturing = () => {
    setIsCapturing(true);
    setLogs([]);
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      setLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalError(...args);
    };
    
    console.warn = (...args) => {
      setLogs(prev => [...prev, `WARN: ${args.join(' ')}`]);
      originalWarn(...args);
    };
    
    // Test payment to generate logs
    testPayment();
  };

  const testPayment = async () => {
    try {
      console.log('🧪 Starting payment test...');
      
      if (typeof window === 'undefined') {
        console.error('❌ Window not available');
        return;
      }
      
      if (!window.Pi) {
        console.error('❌ Pi SDK not available');
        console.log('💡 Make sure you are in Pi Browser mobile');
        return;
      }
      
      console.log('✅ Pi SDK is available');
      console.log('🔄 Creating test payment...');
      
      window.Pi.createPayment({
        amount: 0.01,
        memo: 'Flappy Pi Testnet: Console Test',
        metadata: {
          test: true,
          testnet: true,
          timestamp: Date.now()
        }
      }, {
        onReadyForServerApproval: (paymentId: string) => console.log('Ready for server approval:', paymentId),
        onReadyForServerCompletion: (paymentId: string, txid: string) => console.log('Payment completed:', paymentId, txid),
        onCancel: (paymentId: string) => console.warn('Payment cancelled:', paymentId),
        onError: (error: any) => console.error('Payment error:', error)
      });
      
      console.log('✅ Payment initiation invoked');
      
    } catch (error: any) {
      console.error('❌ Payment test failed:', error.message);
      console.error('Full error:', error);
    }
  };

  const copyLogs = () => {
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = logText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Logs copied to clipboard!');
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'white', 
      borderRadius: '10px', 
      margin: '20px',
      border: '2px solid #007bff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>
        🧪 Console Log Capture & Copy
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={startCapturing}
          disabled={isCapturing}
          style={{
            padding: '10px 20px',
            background: isCapturing ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isCapturing ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isCapturing ? '🔄 Capturing...' : '🚀 Start Test & Capture Logs'}
        </button>
        
        <button
          onClick={copyLogs}
          disabled={logs.length === 0}
          style={{
            padding: '10px 20px',
            background: logs.length === 0 ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          📋 Copy Logs
        </button>
        
        <button
          onClick={clearLogs}
          disabled={logs.length === 0}
          style={{
            padding: '10px 20px',
            background: logs.length === 0 ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: logs.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px', 
        padding: '15px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
            No logs captured yet. Click "Start Test" to begin.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              color: log.includes('ERROR') ? '#dc3545' : 
                     log.includes('WARN') ? '#ffc107' : 
                     log.includes('✅') ? '#28a745' : '#212529'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
        💡 <strong>Instructions:</strong>
        <br />1. Click "Start Test" to capture console logs
        <br />2. The test will try to create a payment
        <br />3. Click "Copy Logs" to copy all logs to clipboard
        <br />4. Paste the logs somewhere to see what's happening
      </div>
    </div>
  );
};

export default ConsoleLogCopy;
