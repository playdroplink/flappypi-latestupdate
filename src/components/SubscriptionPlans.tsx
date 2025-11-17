// Subscription Plans Component
// Displays all available subscription plans with Pi Network mainnet payments

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown, Check, ArrowRight } from 'lucide-react';
import { piMainnetWalletService, SubscriptionPlan } from '@/services/piMainnetWalletService';
import PiPaymentModal from './PiPaymentModal';

const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const plans = piMainnetWalletService.getSubscriptionPlans();

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (order: any) => {
    console.log('Subscription payment completed:', order);
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  const getPlanIcon = (category: string) => {
    switch (category) {
      case 'premium': return <Star className="w-8 h-8 text-yellow-500" />;
      case 'pro': return <Zap className="w-8 h-8 text-blue-500" />;
      case 'ultimate': return <Crown className="w-8 h-8 text-purple-500" />;
      default: return <Star className="w-8 h-8 text-gray-500" />;
    }
  };

  const getPlanColor = (category: string) => {
    switch (category) {
      case 'premium': return 'border-yellow-200 bg-yellow-50';
      case 'pro': return 'border-blue-200 bg-blue-50';
      case 'ultimate': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unlock premium features and enhance your Flappy Pi experience with our subscription plans.
          All payments are processed securely through Pi Network mainnet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
            } ${getPlanColor(plan.category)}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.category)}
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {plan.name}
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-green-600">
                    {plan.price}
                  </span>
                  <span className="text-lg text-gray-600">π</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {plan.duration}
                </p>
                {plan.discount && (
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    {plan.discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 text-center">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full ${
                  plan.isPopular 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <span>Subscribe Now</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Why Choose Pi Network Payments?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Secure</h4>
            <p>All payments are processed through Pi Network's secure blockchain</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Fast</h4>
            <p>Instant payment processing and immediate access to features</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Transparent</h4>
            <p>All transactions are recorded on the Pi Network blockchain</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PiPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          itemType="subscription"
          itemId={selectedPlan}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default SubscriptionPlans;
