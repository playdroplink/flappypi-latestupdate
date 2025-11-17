import React, { useState } from 'react';
import { usePiNetwork } from '../hooks/usePiNetwork';

export const PiNetworkExample: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    signOut,
    createPayment,
    completePayment,
    clearError,
  } = usePiNetwork();

  const [paymentAmount, setPaymentAmount] = useState('1');
  const [paymentMemo, setPaymentMemo] = useState('Test payment');

  const handleAuthenticate = async () => {
    try {
      await authenticate();
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const payment = await createPayment(
        parseFloat(paymentAmount),
        paymentMemo,
        { game: 'flappy-pi' }
      );
      console.log('Payment created:', payment);
      
      // In a real app, you would handle the payment completion
      // This is just for demonstration
      alert(`Payment created with ID: ${payment.identifier}`);
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Pi Network Integration</h2>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Authentication Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Authentication</h3>
        
        {!isAuthenticated ? (
          <button
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Authenticating...' : 'Sign in with Pi'}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <p><strong>Authenticated!</strong></p>
              <p>Username: {user?.username}</p>
              <p>UID: {user?.uid}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Section */}
      {isAuthenticated && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Create Payment</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (π)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memo
              </label>
              <input
                type="text"
                value={paymentMemo}
                onChange={(e) => setPaymentMemo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleCreatePayment}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? 'Creating Payment...' : 'Create Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Status Section */}
      <div className="text-sm text-gray-600">
        <p><strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Sandbox Mode:</strong> Disabled (Mainnet)</p>
      </div>
    </div>
  );
}; 