import React from 'react';
import SimplePaymentTest from '../components/SimplePaymentTest';
import ConsoleLogCopy from '../components/ConsoleLogCopy';

const TestPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '20px' }}>
          🧪 Payment Test Page
        </h1>
        <p style={{ color: 'white', marginBottom: '30px' }}>
          This page will test if payments work
        </p>
        <SimplePaymentTest />
        <ConsoleLogCopy />
      </div>
    </div>
  );
};

export default TestPage;