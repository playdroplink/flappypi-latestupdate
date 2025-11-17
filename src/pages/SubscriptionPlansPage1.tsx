import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Heart, Coins, ArrowLeft, Eye, Package, Sun, Moon } from 'lucide-react';
import PiPaymentModal from '@/components/PiPaymentModalV2';
import UnifiedPiPaymentModal from '@/components/UnifiedPiPaymentModal';
import { useUnifiedPiPayment, createSubscriptionPaymentItem } from '@/hooks/useUnifiedPiPaymentFixed';
import SubscriptionNPC from '@/components/SubscriptionNPC';
import { getPlanRewards, SubscriptionReward } from '@/constants/subscriptionRewards';
import ImageWithFallback from '@/components/ImageWithFallback';
import { shopItems } from '@/constants/shopItems';
import { powerUpItems } from '@/constants/powerUpItems';
import { mysteryBoxItems } from '@/constants/mysteryBoxItems';
import EnhancedRewardModal from '@/components/EnhancedRewardModal';
import EnhancedFooter from '@/components/EnhancedFooter';
import FooterNPC from '@/components/FooterNPC';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { realPiPaymentService } from '@/services/realPiPaymentService';
import { directPaymentService } from '@/services/directPaymentService';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useToast } from '@/hooks/use-toast';

const getAutoTheme = () => {
  const hour = new Date().getHours();
  return (hour >= 19 || hour < 7) ? 'night' : 'light';
};

const SubscriptionPlansPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = React.useState<any | null>(null);
  const [showPiModal, setShowPiModal] = React.useState(false);
  const [showRewardPreview, setShowRewardPreview] = useState(false);
  const [previewRewards, setPreviewRewards] = useState<SubscriptionReward[]>([]);
  const [previewPlanName, setPreviewPlanName] = useState('');
  const { settings, updateSettings } = useSettings();

  const theme = settings.theme === 'night' ? 'night' : 'light';
  const handleThemeChange = (newTheme: 'light' | 'night') => {
    updateSettings({ theme: newTheme });
  };

  // Background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Unified Pi Payment Hook
  const { 
    showPaymentModal, 
    isModalOpen, 
    currentItem, 
    closeModal,
    onPaymentSuccess,
    onPaymentError,
    handlePaymentSuccess,
    handlePaymentError
  } = useUnifiedPiPayment();

  // Set up payment success handler for subscriptions
  useEffect(() => {
    onPaymentSuccess((item) => {
      console.log('Payment successful for subscription:', item);
      
      // Handle subscription purchase
      if (item.type === 'subscription') {
        // Process subscription activation
        console.log('Subscription activated:', item);
        
        // Show success message
        // toast({
        //   title: "Subscription Activated! 🎉",
        //   description: `${item.name} subscription is now active.`
        // });
      }
    });
  }, [onPaymentSuccess]);

  // Set up payment error handler
  useEffect(() => {
    onPaymentError((error) => {
      console.error('Payment error:', error);
      // toast({
      //   title: "Payment Failed",
      //   description: error,
      //   variant: "destructive"
      // });
    });
  }, [onPaymentError]);



  const handleBack = () => {
    window.history.back();
  };

  const handlePreviewRewards = (planId: string, planName: string) => {
    const planRewards = getPlanRewards(planId);
    setPreviewRewards(planRewards);
    setPreviewPlanName(planName);
    setShowRewardPreview(true);
  };

  // Calculate total value of a subscription plan
  const calculatePlanValue = (planId: string) => {
    const rewards = getPlanRewards(planId);
    let totalValue = 0;
    let totalPiValue = 0;
    let breakdown: { item: string; quantity: number; individualPrice: number; totalPrice: number; type: string }[] = [];

    rewards.forEach(reward => {
      let individualPrice = 0;
      let itemName = reward.name;

      switch (reward.type) {
        case 'coins':
          // Calculate coin value based on shop coin packages
          // Assuming 1 Pi = 1000 coins (based on shop prices)
          individualPrice = reward.quantity / 1000;
          breakdown.push({
            item: itemName,
            quantity: reward.quantity,
            individualPrice: individualPrice,
            totalPrice: individualPrice,
            type: 'coins'
          });
          totalPiValue += individualPrice;
          break;

        case 'powerup':
          const powerUp = powerUpItems.find(p => p.id === reward.id || p.name.toLowerCase().includes(reward.name.toLowerCase()));
          if (powerUp) {
            individualPrice = powerUp.piPrice;
            breakdown.push({
              item: itemName,
              quantity: reward.quantity,
              individualPrice: individualPrice,
              totalPrice: individualPrice * reward.quantity,
              type: 'powerup'
            });
            totalPiValue += individualPrice * reward.quantity;
          }
          break;

        case 'mystery-box':
          const mysteryBox = mysteryBoxItems.find(m => m.id.includes(reward.id) || m.name.toLowerCase().includes(reward.name.toLowerCase()));
          if (mysteryBox) {
            individualPrice = mysteryBox.piPrice;
            breakdown.push({
              item: itemName,
              quantity: reward.quantity,
              individualPrice: individualPrice,
              totalPrice: individualPrice * reward.quantity,
              type: 'mystery-box'
            });
            totalPiValue += individualPrice * reward.quantity;
          }
          break;

        case 'skin':
          const skin = shopItems.find(s => s.id === reward.id || s.name.toLowerCase().includes(reward.name.toLowerCase()));
          if (skin) {
            individualPrice = skin.piPrice;
            breakdown.push({
              item: itemName,
              quantity: reward.quantity,
              individualPrice: individualPrice,
              totalPrice: individualPrice * reward.quantity,
              type: 'skin'
            });
            totalPiValue += individualPrice * reward.quantity;
          } else if (reward.id === 'inferno_phoenix') {
            // Fire Phoenix is exclusive to Ultimate Pack
            individualPrice = 30; // Exclusive value
            breakdown.push({
              item: itemName,
              quantity: reward.quantity,
              individualPrice: individualPrice,
              totalPrice: individualPrice * reward.quantity,
              type: 'skin'
            });
            totalPiValue += individualPrice * reward.quantity;
          }
          break;

        case 'bundle':
          // Bundle value estimation
          individualPrice = 10; // Estimated bundle value
          breakdown.push({
            item: itemName,
            quantity: reward.quantity,
            individualPrice: individualPrice,
            totalPrice: individualPrice * reward.quantity,
            type: 'bundle'
          });
          totalPiValue += individualPrice * reward.quantity;
          break;
      }
    });

    return {
      totalPiValue: Math.round(totalPiValue * 100) / 100,
      breakdown,
      savings: Math.round((totalPiValue - getPlanPrice(planId)) * 100) / 100
    };
  };

  const getPlanPrice = (planId: string) => {
    // Define plans locally for this function
    const localPlans = [
      { id: 'starter', price: '5 Pi' },
      { id: 'premium', price: '15 Pi' },
      { id: 'ultimate', price: '30 Pi' }
    ];
    const plan = localPlans.find(p => p.id === planId);
    return plan ? parseInt(plan.price.split(' ')[0]) : 0;
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: '5 Pi',
      period: '7 days',
      description: 'Ad-free experience for 7 days',
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'No ad network in revive (7 days)',
        'Ad-free gameplay (7 days)',
        '1 Basic Mystery Box',
        '1 of each of 5 power-ups',
        '3,000 Flappy Coins',
        '💎 +500 Flappy Coins daily reward',
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      price: '15 Pi',
      period: '15 days',
      description: 'Ad-free experience for 15 days',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        'No ad network in revive (15 days)',
        'Ad-free gameplay (15 days)',
        'Priority support',
        '1 Rare Mystery Box',
        '5 of each of 5 power-ups',
        '15,000 Flappy Coins',
        '💎 +1,000 Flappy Coins daily reward',
      ],
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      price: '30 Pi',
      period: '30 days',
      description: 'Ad-free experience for 30 days',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      features: [
        'No ad network in revive (30 days)',
        'Ad-free gameplay (30 days)',
        'Priority support',
        '1 Legendary Mystery Box',
        '1 random bundle (any bundle)',
        '7 of each of 5 power-ups',
        '30,000 Flappy Coins',
        '💎 +2,000 Flappy Coins daily reward',
      ],
      popular: false
    }
  ];

  const handleBuyWithPi = async (plan: any) => {
    try {
      console.log('🔍 [DEBUG] Starting direct payment for plan:', plan);
      
      // Set toast function for the service
      directPaymentService.setToast(toast);
      
      // Process direct payment
      const result = await directPaymentService.processSubscriptionPayment(plan);
      
      if (result.success) {
        console.log('✅ [DEBUG] Direct payment successful:', result);
        
        // Handle successful payment
        handlePiPaymentSuccess();
        
        toast({
          title: "Subscription Activated! 🎉",
          description: `${plan.name} subscription is now active.`
        });
      } else {
        console.error('❌ [DEBUG] Direct payment failed:', result.error);
        toast({
          title: "Payment Failed",
          description: result.error || "Payment was not completed.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ [DEBUG] Direct payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment failed",
        variant: "destructive"
      });
    }
  };

  const handlePiPaymentSuccess = () => {
    setShowPiModal(false);
    setSelectedPlan(null);
    // Optionally: show a toast or refresh user profile
  };

  const subscriptionDialogs = [
    "Welcome to Pi Premium Packs! Unlock exclusive rewards and ad-free gameplay.",
    "Choose a plan that fits your play style!",
    "Each plan comes with unique bonuses and coins.",
    "Upgrade anytime for more perks!",
    "Your support helps us build Flappy Pi for everyone!",
    "Questions? Contact support@flappypi.fun."
  ];
  const [dialogIndex, setDialogIndex] = useState(0);

  return (
    <div className={theme === 'night' ? 'relative min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black transition-colors duration-500' : 'relative min-h-screen bg-gradient-to-b from-yellow-100 via-blue-100 to-blue-200 transition-colors duration-500'}>
      {/* Night mode visuals */}
      {theme === 'night' && (
        <>
          {/* Starfield */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-80 animate-twinkle"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            {/* Moon */}
            <div className="absolute right-12 top-12 w-24 h-24 bg-gradient-to-br from-yellow-200 via-yellow-100 to-white rounded-full shadow-2xl border-4 border-yellow-100 opacity-90 animate-moon-glow" />
          </div>
          <style>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 0.2; }
            }
            .animate-twinkle {
              animation: twinkle 2.5s infinite;
            }
            @keyframes moon-glow {
              0%, 100% { box-shadow: 0 0 32px 8px #fef9c3, 0 0 0 0 #fff0; }
              50% { box-shadow: 0 0 64px 24px #fde68a, 0 0 0 0 #fff0; }
            }
            .animate-moon-glow {
              animation: moon-glow 3s infinite;
            }
          `}</style>
        </>
      )}
      
      {/* Main content area - natural page scroll */}
      <div className="w-full flex flex-col items-center justify-start pt-20 sm:pt-24 pb-24 sm:pb-32">
        {/* Top Bar with Back Button and Theme Toggle */}
        <div className="w-full max-w-6xl mb-4 flex justify-between items-center px-4 sm:px-0">
          {/* Back Button */}
          <Button
            onClick={handleBack}
            variant="ghost"
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-200 ${
              theme === 'night' 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Button>

          {/* Theme Toggle Icon */}
          <Button
            onClick={() => handleThemeChange(theme === 'night' ? 'light' : 'night')}
            variant="ghost"
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-200 ${
              theme === 'night' 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {theme === 'night' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      
      <div className="flex justify-center mb-4 mt-4">
        {/* Subscription Plan NPC with dialog bubble */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}} onClick={()=>setDialogIndex((prev)=>(prev+1)%subscriptionDialogs.length)}>
          <div style={{
            background: theme === 'night' ? '#1f2937' : '#fff',
            borderRadius:16,
            padding:'10px 18px',
            boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
            fontWeight:500,
            fontSize:16,
            color: theme === 'night' ? '#f3f4f6' : '#333',
            textAlign:'center',
            maxWidth:320,
            marginBottom:8,
            border:`2px solid ${theme === 'night' ? '#7c3aed' : '#a78bfa'}`,
            userSelect:'none',
            display:'inline-block'
          }}>
            {subscriptionDialogs[dialogIndex]}
          </div>
          <img src="/npc gif/subscriptionplanbutton.gif.gif" alt="Subscription Plan NPC" className="mx-auto mb-4 w-32 h-32 animate-bounce" />
          <div style={{
            fontSize:15,
            color: theme === 'night' ? '#9ca3af' : '#888',
            fontWeight:500,
            textAlign:'center',
            marginTop:4
          }}>Subscription NPC</div>
        </div>
      </div>

      <h1 className={`text-center text-3xl sm:text-4xl font-bold mb-2 flex items-center justify-center space-x-2 ${
        theme === 'night' ? 'text-white' : 'text-gray-800'
      }`}>
        <Crown className="h-7 w-7 sm:h-9 sm:w-9 text-yellow-500" />
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Pi Premium Packs</span>
      </h1>
      <p className={`text-center text-base sm:text-lg mb-6 ${
        theme === 'night' ? 'text-gray-300' : 'text-gray-600'
      }`}>One-time purchases to boost your gaming experience</p>

      {/* Marketing Banner */}
      <div className={`mb-6 p-4 border rounded-xl w-full max-w-4xl shadow-lg ${
        theme === 'night' 
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-500 shadow-gray-900/50' 
          : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
      }`}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">💰</span>
            <h3 className={`text-lg font-bold ${
              theme === 'night' ? 'text-green-400' : 'text-green-800'
            }`}>Save Big with Subscription Plans!</h3>
            <span className="text-2xl ml-2">💰</span>
          </div>
          <p className={`text-sm mb-2 ${
            theme === 'night' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Get all the rewards you want at a fraction of the individual price!
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center">
              <span className={`font-bold ${theme === 'night' ? 'text-green-400' : 'text-green-600'}`}>✓</span>
              <span className={`ml-1 ${
                theme === 'night' ? 'text-gray-300' : 'text-gray-600'
              }`}>Exclusive rewards</span>
            </div>
            <div className="flex items-center">
              <span className={`font-bold ${theme === 'night' ? 'text-green-400' : 'text-green-600'}`}>✓</span>
              <span className={`ml-1 ${
                theme === 'night' ? 'text-gray-300' : 'text-gray-600'
              }`}>Huge savings</span>
            </div>
            <div className="flex items-center">
              <span className={`font-bold ${theme === 'night' ? 'text-green-400' : 'text-green-600'}`}>✓</span>
              <span className={`ml-1 ${
                theme === 'night' ? 'text-gray-300' : 'text-gray-600'
              }`}>Instant access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl mb-8 mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-4 sm:p-6 border-2 transition-all duration-300 rounded-xl ${
              plan.popular
                ? 'border-purple-500 shadow-lg shadow-purple-500/25 bg-gradient-to-br from-purple-50 to-pink-50'
                : 'border-gray-200 bg-white shadow-lg'
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 shadow-lg">
                Most Popular
              </Badge>
            )}
            
            <div className="text-center">
              <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4 shadow-lg`}>
                {plan.icon}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">{plan.name}</h3>
              <p className="text-xs sm:text-sm mb-4 text-gray-600">{plan.description}</p>
              
              <div className="mb-4 sm:mb-6">
                <span className="text-2xl sm:text-4xl font-bold text-gray-800">{plan.price}</span>
                <span className="text-xs sm:text-sm ml-2 text-gray-500">{plan.period}</span>
              </div>
              
              {/* Value Marketing Section */}
              {(() => {
                const planValue = calculatePlanValue(plan.id);
                return (
                  <div className={`mb-4 p-3 border rounded-lg shadow-md ${
                    theme === 'night' 
                      ? 'bg-gray-700 border-gray-500 shadow-gray-900/50' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${
                        theme === 'night' ? 'text-green-400' : 'text-green-800'
                      }`}>💰 Total Value:</span>
                      <span className={`text-lg font-bold ${
                        theme === 'night' ? 'text-green-400' : 'text-green-700'
                      }`}>{planValue.totalPiValue} Pi</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${
                        theme === 'night' ? 'text-blue-400' : 'text-blue-800'
                      }`}>💎 You Pay:</span>
                      <span className={`text-lg font-bold ${
                        theme === 'night' ? 'text-blue-400' : 'text-blue-700'
                      }`}>{plan.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${
                        theme === 'night' ? 'text-red-400' : 'text-red-800'
                      }`}>🎉 You Save:</span>
                      <span className={`text-lg font-bold ${
                        theme === 'night' ? 'text-red-400' : 'text-red-700'
                      }`}>{planValue.savings} Pi</span>
                    </div>
                    <div className={`mt-2 text-xs text-center ${
                      theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {planValue.savings > 0 ? (
                        <span className={`font-semibold ${
                          theme === 'night' ? 'text-green-400' : 'text-green-700'
                        }`}>
                          Save {Math.round((planValue.savings / planValue.totalPiValue) * 100)}% by choosing this plan!
                        </span>
                      ) : (
                        <span className={`font-semibold ${
                          theme === 'night' ? 'text-blue-400' : 'text-blue-700'
                        }`}>
                          Get exclusive rewards not available individually!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex space-x-2 mb-4 sm:mb-6">
                <Button
                  onClick={() => handlePreviewRewards(plan.id, plan.name)}
                  variant="outline"
                  className={`flex-1 text-xs sm:text-sm py-2 sm:py-3 ${
                    theme === 'night'
                      ? 'bg-gray-700 text-gray-200 border-gray-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 shadow-lg'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  onClick={() => handleBuyWithPi(plan)}
                  className={`flex-2 bg-gradient-to-r ${plan.color} text-sm sm:text-base py-2 sm:py-3 shadow-lg`}
                  size="lg"
                >
                  Pay with Pi
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* Reward Preview Section */}
            <div className={`mt-4 p-3 rounded-lg shadow-md ${
              theme === 'night' ? 'bg-gray-700 shadow-gray-900/50' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 flex items-center ${
                theme === 'night' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <Package className="w-4 h-4 mr-1" />
                Rewards Preview
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {getPlanRewards(plan.id).slice(0, 6).map((reward, index) => (
                  <div key={index} className="relative group">
                    <ImageWithFallback
                      src={reward.image}
                      alt={reward.name}
                      className={`w-8 h-8 object-contain rounded border p-1 cursor-pointer hover:scale-110 transition-transform shadow-md ${
                        theme === 'night' 
                          ? 'bg-gray-600 border-gray-500 hover:border-gray-400' 
                          : 'bg-white border-gray-200'
                      }`}
                      fallbackSrc="/icons/icon-128x128.png"
                      lazy={true}
                      retryAttempts={1}
                      retryDelay={300}
                    />
                    <div className="absolute -top-1 -right-1">
                      <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                        {reward.quantity > 9 ? '9+' : reward.quantity}
                      </span>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {reward.name}
                    </div>
                  </div>
                ))}
                {getPlanRewards(plan.id).length > 6 && (
                  <div className={`flex items-center justify-center w-8 h-8 rounded text-xs font-medium shadow-md ${
                    theme === 'night' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    +{getPlanRewards(plan.id).length - 6}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Value Breakdown */}
            <div className={`mt-3 p-3 border rounded-lg shadow-md ${
              theme === 'night' 
                ? 'bg-gray-700 border-gray-500 shadow-gray-900/50' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 flex items-center ${
                theme === 'night' ? 'text-blue-400' : 'text-blue-700'
              }`}>
                <Coins className="w-4 h-4 mr-1" />
                Value Breakdown
              </h4>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {(() => {
                  const planValue = calculatePlanValue(plan.id);
                  return planValue.breakdown.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className={`truncate ${
                        theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{item.item}</span>
                      <span className={`font-medium ${
                        theme === 'night' ? 'text-blue-400' : 'text-blue-700'
                      }`}>{item.totalPrice} Pi</span>
                    </div>
                  ));
                })()}
                {(() => {
                  const planValue = calculatePlanValue(plan.id);
                  return planValue.breakdown.length > 4 && (
                    <div className={`text-xs font-medium text-center ${
                      theme === 'night' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      +{planValue.breakdown.length - 4} more items...
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className={`mt-6 sm:mt-8 p-4 sm:p-6 border rounded-xl w-full max-w-4xl shadow-lg mx-auto ${
        theme === 'night' 
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-500 shadow-gray-900/50' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <img src="/pi-logo.png" alt="Pi Coin" className="w-6 h-6 sm:w-8 sm:h-8" />
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
          </div>
          <div>
            <h4 className={`font-semibold mb-2 text-sm sm:text-base ${
              theme === 'night' ? 'text-white' : 'text-gray-800'
            }`}>Pi Network Integration</h4>
            <p className={`text-xs sm:text-sm mb-4 ${
              theme === 'night' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              All purchases are processed through the Pi Network blockchain.
              Your Pi coins are securely transferred and rewards are instantly applied to your account.
            </p>
            <div className={`rounded-lg p-3 border shadow-md ${
              theme === 'night' 
                ? 'bg-gray-700 border-gray-500 shadow-gray-900/50' 
                : 'bg-white border-gray-200'
            }`}>
              <h5 className={`font-medium mb-1 text-xs sm:text-sm ${
                theme === 'night' ? 'text-white' : 'text-gray-800'
              }`}>Secure & Instant</h5>
              <p className={`text-xs ${
                theme === 'night' ? 'text-gray-300' : 'text-gray-600'
              }`}>Powered by Pi Network's secure payment system</p>
            </div>
          </div>
        </div>
      </div>

      {/* FooterNPC above the footer */}
      <FooterNPC
        npcType="default"
        npcName="Subscription Guide"
        dialogs={[
          "Welcome to Pi Premium Packs! Choose the plan that fits your gaming style.",
          "Each plan comes with exclusive rewards and daily coin bonuses.",
          "The Premium Pack is our most popular choice - great value for serious players!",
          "Ultimate Pack gives you the most rewards and longest ad-free experience.",
          "Starter Pack is perfect for trying out premium features.",
          "All plans include mystery boxes with rare items and power-ups.",
          "Daily rewards increase with higher-tier plans - more coins every day!",
          "Priority support is included with Premium and Ultimate plans.",
          "Ad-free gameplay means uninterrupted gaming sessions.",
          "Pi Network integration ensures secure and instant payments.",
          "Your support helps us build Flappy Pi for everyone!",
          "Questions about plans? Contact support@flappypi.fun",
          "Upgrade anytime - your progress and rewards are always saved.",
          "Exclusive skins and bundles only available in subscription plans.",
          "Join thousands of players enjoying ad-free Flappy Pi!",
          "Special discounts available for longer subscription periods.",
          "All plans include exclusive mystery boxes with rare items.",
          "Daily login rewards increase with subscription tier.",
          "Priority customer support for all subscription members.",
          "Secure Pi Network payments with instant reward delivery.",
          "Ad-free experience means no interruptions during gameplay.",
          "Exclusive power-ups and items only for subscribers.",
          "Premium plans include legendary mystery boxes.",
          "Ultimate plan includes random bundles with rare items.",
          "Starter pack perfect for new premium users.",
          "All plans include daily coin bonuses.",
          "Subscription rewards are instantly applied to your account.",
          "Choose the plan that matches your gaming intensity.",
          "Upgrade or downgrade your plan anytime.",
          "All subscription features work across all game modes."
        ]}
      />

      {/* Footer */}
      <div className="w-full mt-8">
        <EnhancedFooter
          musicEnabled={true}
          setMusicEnabled={() => {}}
          soundEnabled={true}
          setSoundEnabled={() => {}}
          piUser={null}
        />
      </div>


      <EnhancedRewardModal
        open={showRewardPreview}
        onClose={() => setShowRewardPreview(false)}
        rewards={previewRewards}
        planName={previewPlanName}
        planId={previewRewards.length > 0 ? previewRewards[0]?.id?.split('-')[0] : undefined}
        isPreview={true}
      />
    </div>
  );
};

export default SubscriptionPlansPage;
