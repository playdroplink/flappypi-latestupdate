import React, { useState } from 'react';
import { piPaymentShopService, Product, ProductType, PaymentResult } from '../services/piPaymentShopService';
import { useAuth } from '../context/AuthContext';

interface PiPaymentShopProps {
  className?: string;
}

const PiPaymentShop: React.FC<PiPaymentShopProps> = ({ className = "" }) => {
  const { isPiAuth, piUser } = useAuth();
  const [selectedType, setSelectedType] = useState<ProductType>('game_lives');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const products = piPaymentShopService.getProductsByType(selectedType);

  const handlePurchase = async (productId: string) => {
    if (!isPiAuth || !piUser) {
      setPaymentResult({
        success: false,
        error: 'Please sign in with Pi Network to make purchases'
      });
      return;
    }

    setProcessingPayment(productId);
    setPaymentResult(null);

    try {
      const result = await piPaymentShopService.createPayment(productId, {
        uid: piUser.uid,
        username: piUser.username
      });

      setPaymentResult(result);

      if (result.success) {
        console.log('✅ Payment successful:', result);
      } else {
        console.error('❌ Payment failed:', result.error);
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const productTypes: { type: ProductType; label: string; emoji: string }[] = [
    { type: 'game_lives', label: 'Game Lives', emoji: '💖' },
    { type: 'premium_skins', label: 'Premium Skins', emoji: '🎨' },
    { type: 'subscription', label: 'Subscriptions', emoji: '⭐' },
    { type: 'coins', label: 'Coins', emoji: '💰' }
  ];

  if (!isPiAuth) {
    return (
      <div className={`p-6 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="font-semibold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-sm text-yellow-700">
            Please sign in with Pi Network to access the payment shop.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold text-purple-900 mb-4">🛒 Pi Payment Shop</h2>
      
      {/* Product Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {productTypes.map(({ type, label, emoji }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedType === type
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-700 hover:bg-purple-100'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-purple-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-purple-700">
                {product.amount} {product.currency}
              </span>
              <button
                onClick={() => handlePurchase(product.id)}
                disabled={processingPayment === product.id}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {processingPayment === product.id ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Result */}
      {paymentResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          paymentResult.success
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {paymentResult.success ? (
            <p>✅ Payment successful! {paymentResult.product?.name} has been added to your account.</p>
          ) : (
            <p>❌ Payment failed: {paymentResult.error}</p>
          )}
        </div>
      )}

      {/* User Info */}
      <div className="mt-4 p-3 bg-purple-100 rounded-lg">
        <p className="text-sm text-purple-800">
          Signed in as: <span className="font-medium">{piUser?.username}</span>
        </p>
      </div>
    </div>
  );
};

export default PiPaymentShop;