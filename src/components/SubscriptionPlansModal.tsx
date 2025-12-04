import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Heart, ShieldCheck, Eye, Package, Gift, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import SubscriptionNPC from './SubscriptionNPC';
import { useWallet } from '@/context/WalletContext';
import { inventoryService } from '@/services/inventoryService';
import EnhancedRewardModal from './EnhancedRewardModal';
import { getPlanRewards, SubscriptionReward } from '@/constants/subscriptionRewards';
import ImageWithFallback from './ImageWithFallback';
import { shopItems } from '@/constants/shopItems';
import { powerUpItems } from '@/constants/powerUpItems';
import { mysteryBoxItems } from '@/constants/mysteryBoxItems';
import { payWithPi } from '@/services/piPayment';
import { PI_CONFIG } from '@/config/piConfig';
import { realPiPaymentService } from '@/services/realPiPaymentService';
import { directPaymentService } from '@/services/directPaymentService';
import NetworkModeSwitcher from '@/components/NetworkModeSwitcher';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (plan: any) => void;
}

const SubscriptionPaymentModal = ({ isOpen, onClose, plan, onSuccess }) => {
  const { toast } = useToast();
  const { addCoins } = useWallet();
  const { profile } = useUserProfile();
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayConfirmModal, setShowPayConfirmModal] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<any | null>(null);
  const [rewards, setRewards] = useState<SubscriptionReward[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showRewardPreview, setShowRewardPreview] = useState(false);
  const [previewRewards, setPreviewRewards] = useState<SubscriptionReward[]>([]);
  const [previewPlanName, setPreviewPlanName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!plan) return null;

  const handlePay = () => {
    setShowPayConfirmModal(true);
  };

  const handleConfirmPay = () => {
    setShowPayConfirmModal(false);
    setPaying(true);
    setTimeout(() => { setPaying(false); setSuccess(true); }, 1200);
  };

  const handleCancelPay = () => {
    setShowPayConfirmModal(false);
  };

  const handleBuyWithPi = async (plan: any) => {
    setIsProcessingPayment(true);
    
    try {
      console.log('🔍 [DEBUG] Starting direct payment for plan:', plan);
      
      // Set toast function for the service
      directPaymentService.setToast(toast);
      
      // Process direct payment
      const result = await directPaymentService.processSubscriptionPayment(plan);
      
      if (result.success) {
        console.log('✅ [DEBUG] Direct payment successful:', result);
        
        // Get rewards for this plan
        const planRewards = getPlanRewards(plan.id);
        setRewards(planRewards);
        
        // Add coins to wallet
        if (plan.coins) {
          addCoins(plan.coins);
        }
        
        // Show success and rewards
        setSuccess(true);
        setShowRewardModal(true);
        onSuccess?.(plan);
        
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
    } finally {
      setIsProcessingPayment(false);
    }
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
      { id: 'ultimate', price: '25 Pi' }
    ];
    const plan = localPlans.find(p => p.id === planId);
    return plan ? parseInt(plan.price.split(' ')[0]) : 0;
  };

  const handleSubscriptionPaymentSuccess = async (billing) => {
    if (!paymentPlan) return;
    // Calculate expiration
    const now = new Date();
    let expiresAt;
    if (paymentPlan.id === 'starter') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (paymentPlan.id === 'premium') {
      expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    } else if (paymentPlan.id === 'ultimate') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (billing === 'yearly') {
      expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    // Add subscription to inventory
    inventoryService.saveToInventory({
      id: paymentPlan.id + '-subscription',
      name: paymentPlan.name,
      type: 'subscription',
      quantity: 1,
      rarity: 'Special',
      description: `${paymentPlan.name} subscription (${billing})`,
      expiresAt: expiresAt.toISOString(),
    });
    // Credit Flappy Coins to wallet atomically
    if (paymentPlan.coinReward && paymentPlan.coinReward > 0) {
      await addCoins(paymentPlan.coinReward, `Subscription Plan Reward: ${paymentPlan.name}`);
    }
    // Get rewards from the new reward system
    const planRewards = getPlanRewards(paymentPlan.id);
    setRewards(planRewards);
    setShowRewardModal(true);
    setShowPayConfirmModal(false);
    // Update subscription status in UI (handled by backend verification)
    console.log('Subscription activated successfully');
    toast({
      title: 'Subscription Activated!',
      description: `Your ${paymentPlan.name} subscription is now active until ${expiresAt.toISOString().slice(0, 10)}. Flappy Coins have been credited to your wallet.`
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-0 overflow-hidden border-0">
          <DialogHeader>
            <DialogTitle>Subscription Payment</DialogTitle>
            <DialogDescription>Complete your payment to activate your subscription plan.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center px-8 py-10">
            <img src="/npc gif/subscriptionplanbutton.gif.gif" alt="Subscription Plan NPC" className="mx-auto mb-4 w-32 h-32 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-purple-700 mb-2 text-center">Complete Your Payment</h2>
            <p className="text-gray-600 text-center mb-4">You're upgrading to the <b>{plan.name}</b> plan</p>
            <div className="w-full bg-blue-100/60 rounded-xl p-4 mb-4">
              <div className="font-bold text-blue-900 mb-1">Plan Details</div>
              <div className="text-sm text-gray-700 mb-1">Plan: <b>{plan.name}</b></div>
              <div className="text-sm text-gray-700 mb-1">Price: <b>{plan.price}</b></div>
              <div className="text-sm text-gray-700 mb-1">Duration: <b>{plan.period}</b></div>
              <div className="text-sm text-gray-700 mb-1">Payment Method: <b>Pi Network</b></div>
              <div className="flex justify-between items-center bg-white/80 rounded-lg p-3 mt-3 border border-blue-200">
                <span className="font-semibold text-blue-700">Access Period</span>
                <span className="text-xs text-gray-600">{plan.period}</span>
              </div>
            </div>
            {success ? (
              <div className="flex flex-col items-center my-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2"><Check className="w-10 h-10 text-green-600" /></div>
                <div className="text-green-700 font-bold text-lg mb-1">Payment Successful!</div>
                <div className="text-gray-600 text-sm mb-2 text-center">Your subscription is now active.</div>
                <Button className="w-full mt-2 bg-purple-600 hover:bg-purple-700" onClick={() => { 
                  onClose(); 
                  if (onSuccess) onSuccess('monthly'); // Pass billing parameter to trigger rewards
                }}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <Button
                  className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-xl shadow-lg text-lg mb-3 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 border-2 border-blue-700"
                  onClick={handlePay}
                  disabled={paying}
                >
                  <ShieldCheck className="w-6 h-6 mr-2 text-white drop-shadow" />
                  {paying ? 'Processing...' : `Pay ${plan.price} with Pi`}
                </Button>
                <Button
                  className="w-full bg-green-500 text-white font-extrabold py-3 rounded-xl shadow-lg text-lg mb-3 flex items-center justify-center gap-2 hover:bg-green-600 active:scale-95 border-2 border-green-700"
                  onClick={() => {
                    // MOCK: Simulate successful Pi payment and trigger reward modal
                    setSuccess(true);
                    setShowRewardModal(true);
                  }}
                >
                  🧪 Mock Pi Payment (Test)
                </Button>
                {/* Pi Network security note */}
                <div className="w-full flex items-center justify-center mt-2 mb-4">
                  <span className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Pi Network integration is <span className="font-bold">safe, secure, and trusted</span>.
                  </span>
                </div>
                <Button
                  className="w-full bg-gray-400 text-white font-bold py-3 rounded-xl mt-1 mb-2 border-2 border-gray-400 hover:bg-gray-500 hover:text-white transition-colors"
                  onClick={onClose}
                  disabled={paying}
                >
                  Back
                </Button>
              </>
            )}
            <div className="text-xs text-gray-400 mt-4 text-center">Need help? <a href="mailto:support@flappypi.fun" className="underline">support@flappypi.fun</a></div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Pay Confirmation Modal */}
      <Dialog open={showPayConfirmModal} onOpenChange={setShowPayConfirmModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Confirm your subscription payment for the selected plan.</DialogDescription>
            <DialogTitle className="text-center text-2xl text-yellow-600 font-extrabold mb-4 flex flex-col items-center">
              <span className="text-4xl mb-2">⚠️</span>
              Are you sure?
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-gray-800 text-lg font-semibold mb-2">
            Do you want to pay <span className="font-bold">{plan.price}</span> for the <span className="font-bold">{plan.name}</span> plan?
          </div>
          <div className="text-center text-gray-500 mb-6">
            This action cannot be undone. Please confirm your payment.
          </div>
          <div className="flex gap-6 justify-center mt-4">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl min-h-[48px] min-w-[120px] text-lg shadow-none border-none px-8 py-3 text-xl"
              onClick={handleConfirmPay}
            >
              Yes
            </Button>
            <Button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-xl min-h-[48px] min-w-[120px] text-lg shadow-none border-none px-8 py-3 text-xl"
              onClick={handleCancelPay}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const { toast } = useToast();
  const { addCoins } = useWallet();
  const { profile } = useUserProfile();
  const [selectedPlan, setSelectedPlan] = React.useState<any | null>(null);
  const [showPiModal, setShowPiModal] = React.useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<{id: string, name: string} | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewards, setRewards] = useState<SubscriptionReward[]>([]);
  const [showRewardPreview, setShowRewardPreview] = useState(false);
  const [previewRewards, setPreviewRewards] = useState<SubscriptionReward[]>([]);
  const [previewPlanName, setPreviewPlanName] = useState('');

  // Force mainnet mode - no testnet allowed
  const isTestEnv = false; // Always mainnet

  // Add test payment handler
  const handleTestPiPayment = async (plan) => {
    try {
      const planPrice = parseInt(plan.price.split(' ')[0]);
      const result = await realPiPaymentService.processSubscriptionPayment({
        id: plan.id,
        name: plan.name,
        price: planPrice.toString()
      });
      if (result.success) {
        toast({ title: `Payment Success`, description: `Payment ID: ${result.paymentId}`, variant: 'default' });
      } else {
        toast({ title: `Payment Failed`, description: result.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: `Payment Error`, description: err.message || String(err), variant: 'destructive' });
    }
  };

  // Calculate sale prices if applicable
  const getActualPrice = (basePrice: string, planId: string) => {
    const numPrice = parseFloat(basePrice.split(' ')[0]);
    // Check if this plan is on sale (you can implement sale logic here)
    const isOnSale = false; // TODO: Implement getSaleState() for subscriptions
    const saleDiscount = 0; // TODO: Get actual discount percentage
    
    if (isOnSale && saleDiscount > 0) {
      const discountedPrice = numPrice * (1 - saleDiscount / 100);
      return `${discountedPrice.toFixed(2)} Pi`;
    }
    return basePrice;
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
        '🔓 Unlock Scream Pi characters',
        '1 Basic Mystery Box',
        '1 of each of 5 power-ups',
        '3,000 Flappy Coins',
        '💎 +500 Flappy Coins daily reward',
      ],
      coinReward: 3000,
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
        '🔓 Unlock Scream Pi characters',
        'Priority support',
        '1 Rare Mystery Box',
        '5 of each of 5 power-ups',
        '15,000 Flappy Coins',
        '💎 +1,000 Flappy Coins daily reward',
      ],
      coinReward: 15000,
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      price: '30 Pi',
      period: '30 days',
      description: 'Ad-free experience for 30 days + EXCLUSIVE Fire Phoenix Skin!',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      features: [
        'No ad network in revive (30 days)',
        'Ad-free gameplay (30 days)',
        '🔓 Unlock Scream Pi characters',
        'Priority support',
        '🔥 EXCLUSIVE Fire Phoenix Skin (ULTIMATE ONLY)',
        '1 Legendary Mystery Box',
        '1 random bundle (any bundle)',
        '7 of each of 5 power-ups',
        '30,000 Flappy Coins',
        '💎 +2,000 Flappy Coins daily reward',
        <div key="bonus" className="mt-3">
          <div className="font-bold text-red-600 flex items-center text-base mb-1">🔥 BONUS EXCLUSIVE:</div>
          <ul className="list-disc ml-6 text-sm text-orange-900">
            <li className="mb-1 font-semibold">🎁 Fire Phoenix Skin</li>
            <li className="mb-1">🔓 Only available in this plan — <span className="font-bold">NOT for sale!</span></li>
            <li className="mb-1">🐦 Legendary firebird skin with <span className="font-bold">glowing effects</span></li>
            <li className="mb-1">🪙 <span className="font-bold">+5% bonus Flappy Coins</span> while equipped</li>
            <li className="mb-1">🎖️ Unlocks <span className="font-bold">Legendary Player Badge</span> in leaderboards</li>
          </ul>
        </div>
      ],
      coinReward: 30000,
      popular: false
    }
  ];

  useEffect(() => {
    const status = inventoryService.getSubscriptionStatus();
    setHasActiveSubscription(status.hasActiveSubscription);
    setSubscriptionType(status.subscriptionType);
    setSubscriptionExpiresAt(status.expiresAt);
  }, [isOpen]);

  const handleBuyWithPi = async (plan: any) => {
    setIsProcessingPayment(true);
    
    try {
      console.log('🔍 [DEBUG] Starting direct payment for plan:', plan);
      
      // Set toast function for the service
      directPaymentService.setToast(toast);
      
      // Calculate actual price to charge (use sale price if on sale, otherwise regular price)
      const actualPrice = parseFloat(plan.price.split(' ')[0]);
      const salePrice = plan.salePrice ? parseFloat(plan.salePrice.split(' ')[0]) : null;
      const priceToCharge = plan.isOnSale && salePrice ? salePrice : actualPrice;
      
      // Create payment plan with correct price
      const paymentPlan = {
        ...plan,
        price: `${priceToCharge} Pi`
      };
      
      console.log(`💰 [DEBUG] Charging price: ${priceToCharge} Pi (Regular: ${actualPrice} Pi, On Sale: ${plan.isOnSale || false})`);
      
      // Process direct payment with actual price
      const result = await directPaymentService.processSubscriptionPayment(paymentPlan);
      
      if (result.success) {
        console.log('✅ [DEBUG] Payment initiated successfully, waiting for completion...');
        
        // Show processing message - actual activation happens in payment completion callback
        toast({
          title: "Payment Processing... ⏳",
          description: "Your subscription will be activated after payment completion.",
          duration: 3000,
        });
        
        // Listen for subscription activation event from payment completion
        const handleSubscriptionActivated = (event: CustomEvent) => {
          console.log('🎉 Subscription activated via payment completion:', event.detail);
          
          // Get rewards for this plan
          const planRewards = getPlanRewards(plan.id);
          setRewards(planRewards);
          
          // Add coins to wallet
          if (plan.coins) {
            addCoins(plan.coins);
          }
          
          // Show success and rewards
          setSuccess(true);
          setShowRewardModal(true);
          onPurchase?.(plan);
          
          // Remove event listener
          window.removeEventListener('subscription-activated', handleSubscriptionActivated as EventListener);
        };
        
        // Add event listener for subscription activation
        window.addEventListener('subscription-activated', handleSubscriptionActivated as EventListener);
        
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
    } finally {
      setIsProcessingPayment(false);
    }
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
    const plan = plans.find(p => p.id === planId);
    return plan ? parseInt(plan.price.split(' ')[0]) : 0;
  };

  const handleCancelSpecificPlan = (subscriptionId: string, subscriptionName: string) => {
    setPendingCancel({ id: subscriptionId, name: subscriptionName });
  };

  const confirmCancelSpecificPlan = () => {
    if (!pendingCancel) return;
    const { id, name } = pendingCancel;
    const success = inventoryService.removeSubscription(id);
    if (success) {
      // Update status after cancellation
      const status = inventoryService.getSubscriptionStatus();
      setHasActiveSubscription(status.hasActiveSubscription);
      setSubscriptionType(status.subscriptionType);
      setSubscriptionExpiresAt(status.expiresAt);
      toast({
        title: 'Plan Cancelled',
        description: `${name} has been cancelled. No refund will be given.`,
        variant: 'destructive',
      });
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId: id, type: 'subscription', action: 'removed' } 
      }));
    } else {
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel the plan. Please try again.',
        variant: 'destructive',
      });
    }
    setPendingCancel(null);
  };

  const handleCancelPlan = () => {
    // Remove ALL subscription-like items from inventory
    let inventory = inventoryService.getInventory();
    const filtered = inventory.filter(item =>
      item.type !== 'subscription' &&
      !(item.id && item.id.toLowerCase().includes('subscription'))
    );
    localStorage.setItem('flappypi-inventory', JSON.stringify(filtered));
    // Immediately re-check subscription status and update state
    const status = inventoryService.getSubscriptionStatus();
    setHasActiveSubscription(status.hasActiveSubscription);
    setSubscriptionType(status.subscriptionType);
    setSubscriptionExpiresAt(status.expiresAt);
    setShowCancelConfirm(false);
    toast({
      title: 'Subscription Canceled',
      description: 'Your premium plan has been canceled. No refund is given.',
      variant: 'destructive',
    });
    window.dispatchEvent(new CustomEvent('inventory-updated', { detail: { action: 'subscription-canceled' } }));
    // Fallback: force reload if still active
    setTimeout(() => {
      if (inventoryService.getSubscriptionStatus().hasActiveSubscription) {
        window.location.reload();
      }
    }, 500);
  };

  const handleSubscriptionPaymentSuccess = async (billing) => {
    if (!paymentPlan) return;
    // Calculate expiration
    const now = new Date();
    let expiresAt;
    if (paymentPlan.id === 'starter') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (paymentPlan.id === 'premium') {
      expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    } else if (paymentPlan.id === 'ultimate') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (billing === 'yearly') {
      expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    // Add subscription to inventory
    inventoryService.saveToInventory({
      id: paymentPlan.id + '-subscription',
      name: paymentPlan.name,
      type: 'subscription',
      quantity: 1,
      rarity: 'Special',
      description: `${paymentPlan.name} subscription (${billing})`,
      expiresAt: expiresAt.toISOString(),
    });
    // Credit Flappy Coins to wallet atomically
    if (paymentPlan.coinReward && paymentPlan.coinReward > 0) {
      await addCoins(paymentPlan.coinReward, `Subscription Plan Reward: ${paymentPlan.name}`);
    }
    // Get rewards from the new reward system and save as unclaimed
    const planRewards = getPlanRewards(paymentPlan.id);
    
    // Save rewards as unclaimed to prevent double redemption
    inventoryService.saveUnclaimedSubscriptionRewards(
      paymentPlan.id, 
      paymentPlan.name, 
      planRewards, 
      expiresAt.toISOString()
    );
    
    setRewards(planRewards);
    setShowRewardModal(true);
    toast({
      title: 'Reward Modal Triggered',
      description: `Rewards modal should now appear for ${paymentPlan.name}.`,
      variant: 'default',
      duration: 3000
    });
    // Payment modal removed - using direct payments
    // Update subscription status in UI
    const status = inventoryService.getSubscriptionStatus();
    setHasActiveSubscription(status.hasActiveSubscription);
    setSubscriptionType(status.subscriptionType);
    setSubscriptionExpiresAt(status.expiresAt);
    toast({
      title: 'Subscription Activated!',
      description: `Your ${paymentPlan.name} subscription is now active until ${expiresAt.toISOString().slice(0, 10)}. Flappy Coins have been credited to your wallet.`
    });
  };

  const handleClaimPlanReward = (planId: string) => {
    if (inventoryService.hasClaimedPlanRewards(planId)) return;
    const claimed = inventoryService.claimSubscriptionRewards(planId);
    if (claimed) {
      toast({ title: 'Reward Claimed!', description: 'You have successfully claimed your subscription plan reward.' });
      setShowRewardModal(true);
      setRewards(claimed);
    } else {
      toast({ title: 'Already Claimed', description: 'You have already claimed this reward.' });
    }
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <div></div> {/* Empty div for spacing */}
              <h2 className="text-3xl font-bold text-gray-800">Choose Your Plan</h2>
            </div>
            <p className="text-gray-600 mb-6">Unlock premium features and exclusive rewards</p>
          </DialogHeader>
          <div className="p-4 sm:p-6">
            <div className="flex justify-center mb-4">
              {/* Subscription Plan NPC with dialog bubble */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}} onClick={()=>setDialogIndex((prev)=>(prev+1)%subscriptionDialogs.length)}>
                <div style={{background:'#fff',borderRadius:16,padding:'10px 18px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',fontWeight:500,fontSize:16,color:'#333',textAlign:'center',maxWidth:320,marginBottom:8,border:'2px solid #a78bfa',userSelect:'none',display:'inline-block'}}>
                  {subscriptionDialogs[dialogIndex]}
                </div>
                <img src="/npc gif/subscriptionplanbutton.gif.gif" alt="Subscription Plan NPC" className="mx-auto mb-4 w-32 h-32 animate-bounce" />
                <div style={{fontSize:15,color:'#888',fontWeight:500,textAlign:'center',marginTop:4}}>Subscription NPC</div>
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl sm:text-3xl text-gray-800 flex items-center justify-center space-x-2 mb-2">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pi Premium Packs
                </span>
              </DialogTitle>
              <p className="text-center text-gray-600 text-sm sm:text-base mb-4">
                One-time purchases to boost your gaming experience
              </p>
              
              {/* Marketing Banner */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">💰</span>
                    <h3 className="text-lg font-bold text-green-800">Save Big with Subscription Plans!</h3>
                    <span className="text-2xl ml-2">💰</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Get all the rewards you want at a fraction of the individual price!
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="ml-1 text-gray-600">Exclusive rewards</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="ml-1 text-gray-600">Huge savings</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="ml-1 text-gray-600">Instant access</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Cancel Plan Button for Active Subscribers */}
            {hasActiveSubscription && (
              <div className="flex flex-col items-center mb-6">
                <div className="text-sm text-gray-700 mb-4 text-center">
                  <span className="font-semibold">Active Plans:</span>
                  {(() => {
                    const status = inventoryService.getSubscriptionStatus();
                    return status.activeSubscriptions.map((sub, index) => (
                      <div key={sub.id} className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">{sub.name}</div>
                        <div className="text-xs text-green-600">
                          Expires: {new Date(sub.expiresAt).toLocaleDateString()} ({sub.daysRemaining} days left)
                        </div>
                        <button
                          className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded"
                          onClick={() => handleCancelSpecificPlan(sub.id, sub.name)}
                        >
                          Cancel This Plan
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Cancel Confirmation Modal */}
            {pendingCancel && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[11000] transition-all duration-300">
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-200 p-10 max-w-sm w-full text-center relative animate-fadeIn">
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-red-100 rounded-full p-4 mb-2 shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                    </div>
                    <h3 className="font-extrabold text-2xl mb-2 text-red-700 tracking-tight">Cancel Subscription?</h3>
                  </div>
                  <p className="text-gray-700 mb-6 text-base font-semibold leading-relaxed">
                    <span className="text-red-600 font-bold">Warning:</span> This will immediately cancel your <span className="text-red-600 font-bold">{pendingCancel.name}</span> subscription.<br/><br/>
                    <span className="text-red-600 font-bold">You will lose:</span><br/>
                    • All premium features from this plan<br/>
                    • Remaining subscription time<br/>
                    • Access to exclusive rewards<br/><br/>
                    <span className="font-bold text-gray-900">No refund will be given. This action cannot be undone.</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                    <button onClick={confirmCancelSpecificPlan} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-6 rounded-xl shadow-none text-lg border-none transition-all duration-200">
                      Yes, Cancel Subscription
                    </button>
                    <button onClick={() => setPendingCancel(null)} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl border-none text-lg transition-all duration-200">
                      No, Keep Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
            {plans.map((plan) => {
              const alreadyClaimed = inventoryService.hasClaimedPlanRewards(plan.id);
              return (
                <Card 
                  key={plan.id}
                    className={`relative p-4 sm:p-6 border-2 transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'border-purple-500 shadow-lg shadow-purple-500/25 bg-gradient-to-br from-purple-50 to-pink-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center">
                    <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}>
                      {plan.icon}
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-4xl font-bold text-gray-800">{plan.price}</span>
                      <span className="text-gray-500 text-xs sm:text-sm ml-2">{plan.period}</span>
                    </div>
                    
                    {/* Value Marketing Section */}
                    {(() => {
                      const planValue = calculatePlanValue(plan.id);
                      return (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-green-800">💰 Total Value:</span>
                            <span className="text-lg font-bold text-green-700">{planValue.totalPiValue} Pi</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-blue-800">💎 You Pay:</span>
                            <span className="text-lg font-bold text-blue-700">{plan.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-red-800">🎉 You Save:</span>
                            <span className="text-lg font-bold text-red-700">{planValue.savings} Pi</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-600 text-center">
                            {planValue.savings > 0 ? (
                              <span className="font-semibold text-green-700">
                                Save {Math.round((planValue.savings / planValue.totalPiValue) * 100)}% by choosing this plan!
                              </span>
                            ) : (
                              <span className="font-semibold text-blue-700">
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
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 text-xs sm:text-sm py-2 sm:py-3"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        onClick={() => handleBuyWithPi(plan)}
                        disabled={isProcessingPayment}
                        className={`flex-2 bg-gradient-to-r ${plan.color} hover:opacity-90 text-sm sm:text-base py-2 sm:py-3`}
                        size="lg"
                      >
                        {isProcessingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          'Pay with Pi'
                        )}
                      </Button>
                      {/* Mock Pi Payment for Subscription */}
                      <button
                        className="ml-2 px-2 py-1 bg-green-500 text-white rounded font-bold text-xs hover:bg-green-600"
                        onClick={() => {
                          // Simulate successful subscription purchase and show reward modal
                          const planRewards = getPlanRewards(plan.id);
                          setRewards(planRewards);
                          setSuccess(true);
                          setShowRewardModal(true);
                          if (plan.coinReward) {
                            addCoins(plan.coinReward);
                          }
                          if (typeof onPurchase === 'function') onPurchase(plan);
                          toast({
                            title: 'Mock Subscription Activated! 🎉',
                            description: `${plan.name} subscription is now active (mock).`
                          });
                        }}
                      >
                        🧪 Mock Pi Payment
                      </button>
                    </div>
                  </div>
                  
                                    <div className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Reward Preview Section */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      Rewards Preview
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {getPlanRewards(plan.id).slice(0, 6).map((reward, index) => (
                        <div key={index} className="relative group">
                          <ImageWithFallback
                            src={reward.image}
                            alt={reward.name}
                            className="w-8 h-8 object-contain bg-white rounded border border-gray-200 p-1 cursor-pointer hover:scale-110 transition-transform"
                            fallbackSrc="/icons/icon-128x128.png"
                            lazy={true}
                            retryAttempts={1}
                            retryDelay={300}
                          />
                          <div className="absolute -top-1 -right-1">
                            <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                              {reward.quantity > 9 ? '9+' : reward.quantity}
                            </span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {reward.name}
                          </div>
                        </div>
                      ))}
                      {getPlanRewards(plan.id).length > 6 && (
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded text-xs text-gray-600 font-medium">
                          +{getPlanRewards(plan.id).length - 6}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Value Breakdown */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                      <Coins className="w-4 h-4 mr-1" />
                      Value Breakdown
                    </h4>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {(() => {
                        const planValue = calculatePlanValue(plan.id);
                        return planValue.breakdown.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-600 truncate">{item.item}</span>
                            <span className="text-blue-700 font-medium">{item.totalPrice} Pi</span>
                          </div>
                        ));
                      })()}
                      {(() => {
                        const planValue = calculatePlanValue(plan.id);
                        return planValue.breakdown.length > 4 && (
                          <div className="text-xs text-blue-600 font-medium text-center">
                            +{planValue.breakdown.length - 4} more items...
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-4">
                    {/* Removed Claim Plan Reward button and claimed state */}
                  </div>
                </Card>
              );
            })}
          </div>

            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <img src="/pi-logo.png" alt="Pi Coin" className="w-6 h-6 sm:w-8 sm:h-8" />
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
              </div>
              <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Pi Network Integration</h4>
                  <p className="text-gray-700 text-xs sm:text-sm mb-4">
                  All purchases are processed through the Pi Network blockchain. 
                  Your Pi coins are securely transferred and rewards are instantly applied to your account.
                </p>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-1 text-xs sm:text-sm">Secure & Instant</h5>
                  <p className="text-xs text-gray-600">Powered by Pi Network's secure payment system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
              <EnhancedRewardModal
          open={showRewardModal}
          onClose={() => setShowRewardModal(false)}
          rewards={rewards}
          planName={paymentPlan?.name}
          planId={paymentPlan?.id}
        />
        {/* Preview Modal */}
        <EnhancedRewardModal
          open={showRewardPreview}
          onClose={() => setShowRewardPreview(false)}
          rewards={previewRewards}
          planName={previewPlanName}
          planId={previewRewards.length > 0 ? previewRewards[0]?.id?.split('-')[0] : undefined}
          isPreview={true}
        />
    </>
  );
};

export default SubscriptionPlansModal;
