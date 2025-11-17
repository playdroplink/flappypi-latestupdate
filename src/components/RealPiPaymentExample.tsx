import React, { useState } from 'react';
import { useRealPiPayment } from '../hooks/useRealPiPayment';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, ShoppingCart, Crown, Coins, Package, Zap } from 'lucide-react';

export const RealPiPaymentExample: React.FC = () => {
  const { processShopPayment, processSubscriptionPayment, isPiAvailable, isProcessing } = useRealPiPayment();
  const [lastResult, setLastResult] = useState<any>(null);

  // Sample shop items
  const shopItems = [
    {
      id: 'golden-bird',
      name: 'Golden Bird Skin',
      type: 'skin' as const,
      price: 5,
      description: 'Rare golden bird skin with special effects',
    },
    {
      id: 'coin-pack-1000',
      name: '1000 Flappy Coins',
      type: 'coins' as const,
      price: 2,
      description: 'Get 1000 Flappy Coins instantly',
      quantity: 1000,
    },
    {
      id: 'mystery-box-rare',
      name: 'Rare Mystery Box',
      type: 'mysterybox' as const,
      price: 3,
      description: 'Contains rare items and power-ups',
    },
    {
      id: 'powerup-bundle',
      name: 'Power-up Bundle',
      type: 'powerup' as const,
      price: 4,
      description: '5 of each power-up type',
      quantity: 5,
    },
  ];

  // Sample subscription plans
  const subscriptionPlans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: '5',
      description: '7 days ad-free experience',
      features: ['No ads for 7 days', '1 Mystery Box', '3,000 Coins'],
      coinReward: 3000,
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      price: '15',
      description: '15 days ad-free experience',
      features: ['No ads for 15 days', '1 Rare Mystery Box', '15,000 Coins'],
      coinReward: 15000,
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      price: '30',
      description: '30 days ad-free experience',
      features: ['No ads for 30 days', '1 Legendary Mystery Box', '30,000 Coins'],
      coinReward: 30000,
    },
  ];

  const handleShopPayment = async (item: any) => {
    try {
      const result = await processShopPayment(item);
      setLastResult(result);
      
      if (result.success) {
        console.log('✅ Shop payment successful:', result);
      } else {
        console.error('❌ Shop payment failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Shop payment error:', error);
    }
  };

  const handleSubscriptionPayment = async (plan: any) => {
    try {
      const result = await processSubscriptionPayment(plan);
      setLastResult(result);
      
      if (result.success) {
        console.log('✅ Subscription payment successful:', result);
      } else {
        console.error('❌ Subscription payment failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Subscription payment error:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Real Pi Payment Integration</h2>
        <p className="text-gray-600">
          Test real Pi payments for shop items and subscription plans with automatic reward delivery.
        </p>
        
        {/* Pi SDK Status */}
        <div className="mt-4">
          <Badge variant={isPiAvailable() ? "default" : "destructive"}>
            {isPiAvailable() ? '✅ Pi SDK Available' : '❌ Pi SDK Not Available'}
          </Badge>
        </div>
      </div>

      {/* Shop Items Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Shop Items
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shopItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {item.name}
                  <Badge variant="secondary">{item.price} π</Badge>
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleShopPayment(item)}
                  disabled={isProcessing || !isPiAvailable()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy with Pi
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Subscription Plans
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  <Badge variant="secondary">{plan.price} π</Badge>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscriptionPayment(plan)}
                  disabled={isProcessing || !isPiAvailable()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe with Pi
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Result */}
      {lastResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Last Payment Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={lastResult.success ? "default" : "destructive"}>
                  {lastResult.success ? '✅ Success' : '❌ Failed'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {lastResult.success ? 'Payment completed successfully' : lastResult.error}
                </span>
              </div>
              
              {lastResult.success && lastResult.deliveredItems && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Delivered Items:</h4>
                  <div className="space-y-1">
                    {lastResult.deliveredItems.map((item: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {item.type}: {item.item?.name || item.quantity} {item.type === 'coins' ? 'coins' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {lastResult.paymentId && (
                <div className="mt-2 text-xs text-gray-500">
                  Payment ID: {lastResult.paymentId}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Test</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2 text-sm">
            <p>1. <strong>Pi Browser Required:</strong> Use Pi Browser mobile app for full functionality</p>
            <p>2. <strong>Authentication:</strong> You'll be prompted to authenticate with Pi Network</p>
            <p>3. <strong>Payment Flow:</strong> Complete the payment in Pi Browser</p>
            <p>4. <strong>Reward Delivery:</strong> Items are automatically added to your inventory</p>
            <p>5. <strong>Real Pi:</strong> This uses real Pi payments (not testnet)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 