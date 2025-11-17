import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGameState } from '@/hooks/useGameState';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, Crown, Star, CheckCircle, TreePine, Leaf, Egg, ArrowLeft, Clock, Sparkles, Check, Zap, Shield, Heart, Gift } from 'lucide-react';
import { subscriptionPlans, SubscriptionPlan } from '@/constants/subscriptionPlans';
import { usePiBrowserDetection } from '@/hooks/usePiBrowserDetection';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import ImageWithFallback from '@/components/ImageWithFallback';
import EnhancedFooter from '../components/EnhancedFooter';
import { unifiedPiPaymentService } from '@/services/unifiedPiPaymentService';
import { sandboxPiPaymentService } from '@/services/sandboxPiPaymentService';
import { piMainnetPaymentService } from '@/services/piMainnetPaymentService';
import { simplePiPaymentService } from '@/services/simplePiPaymentService';
import { PI_CONFIG } from '@/config/piConfig';
import { PiStorage } from '@/utils/piStorage';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

import RewardModal from '@/components/RewardModal';

// Import Reward interface
interface Reward {
  id: string;
  name: string;
  type: 'skin' | 'powerup' | 'subscription' | 'mystery-box' | 'bundle';
  quantity: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';
  image?: string;
  description?: string;
}

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut, loading: profileLoading } = useUserProfile();
  const { coins: flappyCoins, musicEnabled, setMusicEnabled, setCoins } = useGameState();
  const { toast } = useToast();
  const { isPiBrowser } = usePiBrowserDetection();
  
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPiModal, setShowPiModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBenefits, setShowBenefits] = useState(true);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [storageStatus, setStorageStatus] = useState<'pi' | 'local' | 'unknown'>('unknown');

  const handleBack = () => {
    navigate(-1);
  };

  const handlePiPayment = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPiModal(true);
  };

  const handlePiSuccess = async () => {
    if (!selectedPlan) return;
    
    try {
      // Update user profile for subscription
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month subscription
      await updateProfile({
        has_active_subscription: true,
        subscription_status: 'active',
        subscription_end: subscriptionEndDate.toISOString(),
        subscription_plan: selectedPlan.id,
      });

      toast({
        title: "Subscription Successful! 🎉",
        description: `Welcome to ${selectedPlan.name}! Your forest adventure begins now!`,
      });

      setShowPiModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Subscription activation failed:", error);
      toast({
        title: "Activation Failed",
        description: "Subscription paid but activation failed. Contact support.",
        variant: "destructive"
      });
    }
  };

  const handleCoinPurchase = async (plan: SubscriptionPlan) => {
    if (flappyCoins >= plan.coinPrice) {
      try {
        const newCoinBalance = flappyCoins - plan.coinPrice;
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month subscription

        await updateProfile({
          total_coins: newCoinBalance,
          has_active_subscription: true,
          subscription_status: 'active',
          subscription_end: subscriptionEndDate.toISOString(),
          subscription_plan: plan.id,
        });
        
        // Update local game state
        const gameData = JSON.parse(localStorage.getItem('flappypi-game-data') || '{}');
        localStorage.setItem('flappypi-game-data', JSON.stringify({ ...gameData, coins: newCoinBalance }));
        setCoins(newCoinBalance);

        toast({
          title: "Subscription Successful! 🌲",
          description: `Welcome to ${plan.name}! Your magical forest journey begins!`,
        });
      } catch (error) {
        console.error("Coin subscription purchase failed:", error);
        toast({
          title: "Purchase Failed",
          description: "An error occurred during purchase. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Insufficient Coins",
        description: `You need ${plan.coinPrice - flappyCoins} more Flappy Coins for ${plan.name}.`,
        variant: "destructive"
      });
    }
  };

  const isSubscribed = profile?.has_active_subscription;
  const subscriptionEnds = profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString() : 'N/A';
  const daysRemaining = profile?.subscription_end
    ? Math.max(0, Math.ceil((new Date(profile.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  useEffect(() => {
    // Show benefits animation on load
    const timer = setTimeout(() => setShowBenefits(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load subscription data from Pi storage on component mount
  useEffect(() => {
    const loadSubscriptionFromStorage = async () => {
      if (profile?.pi_user_id) {
        try {
          const piStorage = PiStorage.getInstance({ usePiStorage: true });
          const userData = await piStorage.getUserData(profile.pi_user_id);
          
          // Check for subscription data in userData (type-safe approach)
          const subscriptionData = (userData as any)?.gameData?.subscription;
          if (subscriptionData) {
            console.log('📦 Loaded subscription data from Pi storage:', subscriptionData);
            setStorageStatus('pi');
            
            // Update local state if needed
            if (subscriptionData.status === 'active' && new Date(subscriptionData.endDate) > new Date()) {
              console.log('✅ Active subscription found in Pi storage');
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to load subscription from Pi storage:', error);
          setStorageStatus('local');
          // Try localStorage fallback
          const localData = localStorage.getItem('flappypi-subscription-data');
          if (localData) {
            console.log('📦 Loaded subscription data from localStorage:', JSON.parse(localData));
          }
        }
      }
    };

    loadSubscriptionFromStorage();
  }, [profile?.pi_user_id]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(subscriptionPlans.find(plan => plan.id === planId) || null);
  };

  const handleSubscribeWithPi = async (plan: SubscriptionPlan) => {
    setIsProcessing(true);
    try {
      let result;
      
      // Use sandbox payment service if in sandbox mode
      if (PI_CONFIG.isMainnet()) {
        console.log('🌐 [MAINNET] Using mainnet subscription payment service');
        
        result = await piMainnetPaymentService.processSubscriptionPayment({
          id: plan.id,
          name: plan.name,
          price: plan.piPrice.toString()
        });
        
        if (result.success) {
          // Simulate subscription activation for sandbox
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + plan.durationDays);
          await updateProfile({
            subscription_plan: plan.id,
            subscription_end: expirationDate.toISOString(),
            has_active_subscription: true,
            subscription_status: 'active'
          });
          
          toast({
            title: "Subscription Activated! 🎉",
            description: `${plan.name} subscription is now active!`,
          });
          
          setRewards([{
            id: plan.id,
            name: plan.name,
            type: 'subscription' as const,
            quantity: 1,
            rarity: 'Special' as const,
            description: plan.description
          }]);
          setRewardModalOpen(true);
        } else {
          throw new Error(result.error || 'Subscription failed');
        }
      } else if (PI_CONFIG.isMainnet()) {
        console.log('🌐 [MAINNET] Using simple payment service for mainnet subscription');
        
        result = await simplePiPaymentService.createSubscriptionPayment({
          id: plan.id,
          name: plan.name,
          price: plan.piPrice,
          duration: plan.duration
        });
        
        if (result.success) {
          // Activate subscription for mainnet
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + plan.durationDays);
          await updateProfile({
            subscription_plan: plan.id,
            subscription_end: expirationDate.toISOString(),
            has_active_subscription: true,
            subscription_status: 'active'
          });
          
          toast({
            title: "Subscription Activated! 🎉",
            description: `${plan.name} subscription is now active! Transaction: ${result.txid}`,
          });
          
          setRewards([{
            id: plan.id,
            name: plan.name,
            type: 'subscription' as const,
            quantity: 1,
            rarity: 'Special' as const,
            description: plan.description
          }]);
          setRewardModalOpen(true);
        } else {
          throw new Error(result.error || 'Subscription failed');
        }
      } else {
        // Use regular unified payment service for mainnet
        result = await unifiedPiPaymentService.processPayment({
          id: plan.id,
          name: plan.name,
          type: 'subscription',
          piAmount: plan.piPrice,
          description: plan.description,
          quantity: 1
        });
        if (!result.success) throw new Error(result.error || 'Subscription failed');
        setRewards(result.deliveredItems || []);
        setRewardModalOpen(true);
        
        // Update user profile (simulate subscription activation)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + plan.durationDays);
        await updateProfile({
          subscription_plan: plan.id,
          subscription_end: expirationDate.toISOString(),
          has_active_subscription: true,
          subscription_status: 'active',
        });

        // 3. Store subscription data in Pi storage
        if (profile?.pi_user_id) {
          const piStorage = PiStorage.getInstance({ usePiStorage: true });
          const subscriptionData = {
            planId: plan.id,
            planName: plan.name,
            startDate: new Date().toISOString(),
            endDate: expirationDate.toISOString(),
            status: 'active',
            piPrice: plan.piPrice,
            features: plan.features,
            purchasedAt: new Date().toISOString(),
            transactionId: result.txid || 'unknown'
          };
          
          // Store subscription data in Pi storage
          try {
            await piStorage.storeUserData(profile.pi_user_id, {
              gameData: {
                subscription: subscriptionData,
                lastSubscriptionUpdate: new Date().toISOString()
              }
            } as any);
            
            console.log('✅ Subscription data stored in Pi storage:', subscriptionData);
          } catch (storageError) {
            console.warn('⚠️ Pi storage failed, using localStorage fallback:', storageError);
            // Fallback to localStorage
            localStorage.setItem('flappypi-subscription-data', JSON.stringify(subscriptionData));
          }
        }

        toast({
          title: 'Subscription Successful! 🎉',
          description: `Welcome to ${plan.name}! Your subscription is now active.`,
        });
      }
    } catch (e) {
      toast({ title: 'Subscription Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsProcessing(true);
    
    try {
      if (typeof window.Pi === 'undefined') {
        toast({
          title: "Pi SDK Not Available",
          description: "Cannot initiate Pi payment. Please ensure you are in the Pi Browser.",
          variant: "destructive"
        });
        return;
      }

      console.log(`🎯 Initiating subscription for ${plan.name} - ${plan.piPrice} Pi`);
      
      const amountPi = plan.piPrice;
      
      // Check if Pi SDK is available
      if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
        toast({
          title: "Pi Payment Unavailable",
          description: "Please use Pi Browser to make Pi payments.",
          variant: "destructive",
        });
        return;
      }

      // Use official payment service for subscription
      const { officialPiPaymentService } = await import('@/services/officialPiPaymentService');
      
      const result = await officialPiPaymentService.processSubscriptionPayment({
        id: plan.id,
        name: plan.name,
        amount: amountPi,
        durationDays: plan.durationDays,
        metadata: {
          game: 'flappy_pi',
          timestamp: Date.now()
        }
      });

      if (result.success && result.txid) {
        // Activate subscription after successful payment
        console.log('✅ Subscription payment completed successfully');
        
        // Update user subscription
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + plan.durationDays);
        
        await updateProfile({
          subscription_plan: plan.id,
          subscription_end: expirationDate.toISOString(),
          has_active_subscription: true,
          subscription_status: 'active',
        });

        // Store subscription data in Pi storage
        if (profile?.pi_user_id) {
          try {
            const piStorage = PiStorage.getInstance({ usePiStorage: true });
            const subscriptionData = {
              planId: plan.id,
              planName: plan.name,
              startDate: new Date().toISOString(),
              endDate: expirationDate.toISOString(),
              status: 'active',
              piPrice: plan.piPrice,
              features: plan.features,
              purchasedAt: new Date().toISOString(),
              transactionId: result.txid || 'unknown'
            };
            
            await piStorage.storeUserData(profile.pi_user_id, {
              gameData: {
                subscription: subscriptionData,
                lastSubscriptionUpdate: new Date().toISOString()
              }
            } as any);
            
            console.log('✅ Subscription data stored in Pi storage:', subscriptionData);
          } catch (storageError) {
            console.warn('⚠️ Pi storage failed, using localStorage fallback:', storageError);
            // Fallback to localStorage
            const subscriptionData = {
              planId: plan.id,
              planName: plan.name,
              startDate: new Date().toISOString(),
              endDate: expirationDate.toISOString(),
              status: 'active',
              piPrice: plan.piPrice,
              features: plan.features,
              purchasedAt: new Date().toISOString(),
              transactionId: result.txid || 'unknown'
            };
            localStorage.setItem('flappypi-subscription-data', JSON.stringify(subscriptionData));
          }
        }
        
        // Show success and redirect
        toast({
          title: "Subscription Successful! 🎉",
          description: `Welcome to ${plan.name}! Your subscription is now active.`,
        });
        
        setRewards([{
          id: plan.id,
          name: plan.name,
          type: 'subscription' as const,
          quantity: 1,
          rarity: 'Special' as const,
          description: plan.description
        }]);
        setRewardModalOpen(true);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMandatoryAdInfo = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-800">Tired of Mandatory Ads?</h3>
      </div>
      <p className="text-red-700 text-sm mb-3">
        🚫 Currently showing ads every 3 games • ⏰ 30-second wait times • 📱 Interrupts gameplay flow
      </p>
      <Button
        onClick={() => navigate('/subscription-plans')}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-full transition-all duration-300 shadow-md"
      >
        Upgrade Now for Ad-Free Play!
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
      <BackgroundDecoration />
      <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-none p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback 
          src="/flappy pi gif/flappy-2.gif.gif" 
          alt="Flappy Pi Logo" 
          className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" 
          lazy={true}
          fallbackSrc="/flappy-logo.png"
        />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Flappy Pi Subscriptions</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Enhance your Flappy Pi experience with exclusive benefits!</p>
        
        {/* Storage Status Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            storageStatus === 'pi' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : storageStatus === 'local'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-gray-100 text-gray-800 border border-gray-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              storageStatus === 'pi' ? 'bg-green-500' : storageStatus === 'local' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
            <span>
              {storageStatus === 'pi' ? '📦 Pi Storage Active' : 
               storageStatus === 'local' ? '💾 Local Storage' : 
               '⏳ Checking Storage...'}
            </span>
          </div>
        </div>

        {isSubscribed ? (
          <Card className="w-full mb-6 p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-xl rounded-none border-0 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">You are Subscribed!</h2>
            <p className="text-lg opacity-90 mb-3">Enjoy all your premium features!</p>
            <div className="flex items-center justify-center gap-2 text-sm opacity-80">
              <Clock className="w-4 h-4" />
              <span>Ends: {subscriptionEnds} ({daysRemaining} days remaining)</span>
            </div>
            <Button
              onClick={() => navigate('/subscription-plans')}
              className="mt-4 bg-white text-green-700 hover:bg-gray-100 font-bold py-2 px-5 rounded-none transition-all duration-300 shadow-md"
            >
              Manage Subscription
            </Button>
          </Card>
        ) : (
          <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`transition-all shadow-xl rounded-2xl p-6 flex flex-col items-center bg-gradient-to-br ${plan.color} ${plan.popular ? 'ring-4 ring-yellow-400 scale-105' : ''}`}> 
                <CardHeader className="flex flex-col items-center">
                  <div className="mb-2">{plan.icon}</div>
                  <CardTitle className="text-xl font-bold text-white text-center">{plan.name}</CardTitle>
                  {plan.popular && <span className="bg-yellow-400 text-purple-900 font-bold px-3 py-1 rounded-full mt-2">Most Popular</span>}
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="text-3xl font-extrabold text-white mb-1">{plan.piPrice} Pi</div>
                  <div className="text-sm text-white/80 mb-2">{plan.duration}</div>
                  <div className="text-base text-white text-center mb-4">{plan.description}</div>
                  <ul className="text-white/90 text-sm space-y-1 mb-4 list-disc list-inside">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col items-center w-full">
                  <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold px-6 py-2 rounded-xl shadow-lg mb-2"
                    onClick={() => handleSubscribeWithPi(plan)}
                  >
                    Pay with Pi
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <RewardModal open={rewardModalOpen} onClose={() => { setRewardModalOpen(false); window.location.reload(); }} rewards={rewards} />
      <EnhancedFooter 
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={true}
        setSoundEnabled={() => {}}
      />
    </div>
  );
};

export default SubscriptionPage;