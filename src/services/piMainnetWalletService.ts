// Pi Network Mainnet Wallet Service
// Handles mainnet wallet operations, payments, and order management

import { PI_CONFIG } from '../config/piConfig';

declare global {
  interface Window {
    Pi: any;
  }
}

export interface PiWalletAccount {
  id: string;
  account_id: string;
  balance: string;
  sequence: string;
  last_modified_time: string;
  balances: Array<{
    balance: string;
    asset_type: string;
    buying_liabilities: string;
    selling_liabilities: string;
  }>;
  signers: Array<{
    weight: number;
    key: string;
    type: string;
  }>;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
}

export interface PaymentOrder {
  orderId: string;
  userId: string;
  itemType: 'subscription' | 'shop_item' | 'powerup' | 'coins';
  itemId: string;
  itemName: string;
  amount: number;
  memo: string;
  metadata: {
    planType?: string;
    duration?: string;
    features?: string[];
    itemCategory?: string;
    quantity?: number;
  };
  status: 'pending' | 'approved' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  paymentId?: string;
  txid?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  category: 'premium' | 'pro' | 'ultimate';
  isPopular?: boolean;
  discount?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'powerup' | 'cosmetic' | 'boost' | 'special';
  quantity?: number;
  isLimited?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

class PiMainnetWalletService {
  private static instance: PiMainnetWalletService;
  private walletAccount: PiWalletAccount | null = null;
  private pendingOrders: Map<string, PaymentOrder> = new Map();
  private readonly MAINNET_WALLET_ADDRESS = 'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI';
  private readonly MAINNET_API_BASE = 'https://api.mainnet.minepi.com';

  private constructor() {}

  static getInstance(): PiMainnetWalletService {
    if (!PiMainnetWalletService.instance) {
      PiMainnetWalletService.instance = new PiMainnetWalletService();
    }
    return PiMainnetWalletService.instance;
  }

  /**
   * Initialize wallet service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('💰 Initializing Pi Mainnet Wallet Service...');
      
      // Load wallet account information
      await this.loadWalletAccount();
      
      // Load pending orders from localStorage
      this.loadPendingOrders();
      
      console.log('✅ Pi Mainnet Wallet Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize wallet service:', error);
      return false;
    }
  }

  /**
   * Load wallet account information from mainnet API
   */
  private async loadWalletAccount(): Promise<void> {
    try {
      const response = await fetch(`${this.MAINNET_API_BASE}/accounts/${this.MAINNET_WALLET_ADDRESS}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load wallet account: ${response.statusText}`);
      }

      this.walletAccount = await response.json();
      console.log('💰 Wallet account loaded:', {
        balance: this.walletAccount?.balances[0]?.balance,
        accountId: this.walletAccount?.account_id
      });
    } catch (error) {
      console.error('❌ Error loading wallet account:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  getWalletBalance(): number {
    if (!this.walletAccount?.balances[0]) {
      return 0;
    }
    return parseFloat(this.walletAccount.balances[0].balance);
  }

  /**
   * Get wallet account information
   */
  getWalletAccount(): PiWalletAccount | null {
    return this.walletAccount;
  }

  /**
   * Create a payment order
   */
  async createPaymentOrder(
    userId: string,
    itemType: PaymentOrder['itemType'],
    itemId: string,
    itemName: string,
    amount: number,
    metadata: PaymentOrder['metadata'] = {}
  ): Promise<PaymentOrder> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order: PaymentOrder = {
      orderId,
      userId,
      itemType,
      itemId,
      itemName,
      amount,
      memo: this.generateMemo(itemType, itemName, metadata),
      metadata,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store order
    this.pendingOrders.set(orderId, order);
    this.savePendingOrders();

    console.log('📝 Payment order created:', order);
    return order;
  }

  /**
   * Generate payment memo based on item type and metadata
   */
  private generateMemo(itemType: string, itemName: string, metadata: any): string {
    switch (itemType) {
      case 'subscription':
        return `Flappy Pi ${metadata.planType || 'Premium'} Subscription - ${itemName}`;
      case 'shop_item':
        return `Flappy Pi Shop - ${itemName} (${metadata.itemCategory || 'Item'})`;
      case 'powerup':
        return `Flappy Pi Powerup - ${itemName}`;
      case 'coins':
        return `Flappy Pi Coins - ${metadata.quantity || 1} ${itemName}`;
      default:
        return `Flappy Pi Purchase - ${itemName}`;
    }
  }

  /**
   * Process payment for an order
   */
  async processPayment(orderId: string): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      const order = this.pendingOrders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending') {
        throw new Error('Order is not in pending status');
      }

      console.log('💳 Processing payment for order:', orderId);

      if (!window.Pi) {
        throw new Error('Pi SDK not available');
      }

      // Create payment using Pi SDK
      const paymentResult = await this.createPiPayment(order);
      
      if (paymentResult.success) {
        // Update order status
        order.status = 'approved';
        order.paymentId = paymentResult.paymentId;
        this.pendingOrders.set(orderId, order);
        this.savePendingOrders();

        return { success: true, paymentId: paymentResult.paymentId };
      } else {
        order.status = 'failed';
        this.pendingOrders.set(orderId, order);
        this.savePendingOrders();

        return { success: false, error: paymentResult.error };
      }
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create Pi payment using SDK
   */
  private async createPiPayment(order: PaymentOrder): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
        resolve({ success: false, error: 'Pi SDK payment not available' });
        return;
      }

      const paymentData = {
        amount: order.amount,
        memo: order.memo,
        metadata: {
          orderId: order.orderId,
          itemType: order.itemType,
          itemId: order.itemId,
          userId: order.userId,
          ...order.metadata
        }
      };

      const paymentCallbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            console.log('🔐 Payment ready for server approval:', paymentId);
            
            // Approve payment on server
            const response = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paymentId, 
                orderId: order.orderId,
                amount: order.amount,
                memo: order.memo,
                metadata: paymentData.metadata
              })
            });

            if (!response.ok) {
              throw new Error('Server approval failed');
            }

            console.log('✅ Payment approved by server');
          } catch (error) {
            console.error('❌ Server approval failed:', error);
            resolve({ success: false, error: 'Server approval failed' });
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            console.log('✅ Payment ready for server completion:', { paymentId, txid });
            
            // Complete payment on server
            const response = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paymentId, 
                txid,
                orderId: order.orderId
              })
            });

            if (!response.ok) {
              throw new Error('Server completion failed');
            }

            // Update order status
            order.status = 'completed';
            order.completedAt = new Date().toISOString();
            order.txid = txid;
            this.pendingOrders.set(order.orderId, order);
            this.savePendingOrders();

            // Deliver items
            await this.deliverOrderItems(order);

            console.log('✅ Payment completed successfully');
            resolve({ success: true, paymentId });
          } catch (error) {
            console.error('❌ Server completion failed:', error);
            resolve({ success: false, error: 'Server completion failed' });
          }
        },

        onCancel: (paymentId: string) => {
          console.log('❌ Payment cancelled:', paymentId);
          order.status = 'cancelled';
          this.pendingOrders.set(order.orderId, order);
          this.savePendingOrders();
          resolve({ success: false, error: 'Payment cancelled by user' });
        },

        onError: (error: Error, payment?: any) => {
          console.error('❌ Payment error:', error, payment);
          order.status = 'failed';
          this.pendingOrders.set(order.orderId, order);
          this.savePendingOrders();
          resolve({ success: false, error: error.message });
        }
      };

      // Create payment
      window.Pi.createPayment(paymentData, paymentCallbacks);
    });
  }

  /**
   * Deliver order items to user
   */
  private async deliverOrderItems(order: PaymentOrder): Promise<void> {
    try {
      console.log('🎁 Delivering order items:', order.orderId);

      // Send delivery request to backend
      const response = await fetch('/api/pi/deliver-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          userId: order.userId,
          itemType: order.itemType,
          itemId: order.itemId,
          metadata: order.metadata
        })
      });

      if (response.ok) {
        console.log('✅ Order items delivered successfully');
      } else {
        console.warn('⚠️ Order delivery failed, but payment was completed');
      }
    } catch (error) {
      console.error('❌ Error delivering order items:', error);
    }
  }

  /**
   * Get subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        description: 'Unlock all premium features for 1 month',
        price: 5.0,
        duration: '1 month',
        features: ['Unlimited revives', 'Premium birds', 'Ad-free experience', 'Priority support'],
        category: 'premium'
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        description: 'Unlock all premium features for 1 year',
        price: 50.0,
        duration: '1 year',
        features: ['Unlimited revives', 'Premium birds', 'Ad-free experience', 'Priority support', 'Exclusive content'],
        category: 'premium',
        isPopular: true,
        discount: 17
      },
      {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        description: 'Professional features for 1 month',
        price: 10.0,
        duration: '1 month',
        features: ['All Premium features', 'Advanced analytics', 'Custom themes', 'API access'],
        category: 'pro'
      },
      {
        id: 'ultimate_monthly',
        name: 'Ultimate Monthly',
        description: 'Ultimate gaming experience for 1 month',
        price: 20.0,
        duration: '1 month',
        features: ['All Pro features', 'Exclusive tournaments', 'Personal coach', 'VIP support'],
        category: 'ultimate'
      }
    ];
  }

  /**
   * Get shop items
   */
  getShopItems(): ShopItem[] {
    return [
      // Powerups
      {
        id: 'revive_pack_5',
        name: 'Revive Pack (5x)',
        description: 'Get 5 revives to continue your game',
        price: 2.0,
        category: 'powerup',
        quantity: 5
      },
      {
        id: 'coin_boost_2x',
        name: '2x Coin Boost',
        description: 'Double coin earnings for 1 hour',
        price: 1.5,
        category: 'boost'
      },
      {
        id: 'score_multiplier',
        name: 'Score Multiplier',
        description: '2x score multiplier for 30 minutes',
        price: 1.0,
        category: 'boost'
      },
      // Cosmetics
      {
        id: 'golden_bird',
        name: 'Golden Bird Skin',
        description: 'Exclusive golden bird skin',
        price: 3.0,
        category: 'cosmetic',
        rarity: 'rare'
      },
      {
        id: 'rainbow_trail',
        name: 'Rainbow Trail',
        description: 'Colorful rainbow trail effect',
        price: 2.5,
        category: 'cosmetic',
        rarity: 'epic'
      },
      // Special Items
      {
        id: 'mystery_box',
        name: 'Mystery Box',
        description: 'Contains random rewards',
        price: 1.0,
        category: 'special',
        rarity: 'common'
      },
      {
        id: 'legendary_box',
        name: 'Legendary Box',
        description: 'Contains legendary rewards',
        price: 5.0,
        category: 'special',
        rarity: 'legendary',
        isLimited: true
      }
    ];
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): PaymentOrder | null {
    return this.pendingOrders.get(orderId) || null;
  }

  /**
   * Get all orders for a user
   */
  getUserOrders(userId: string): PaymentOrder[] {
    return Array.from(this.pendingOrders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get pending orders
   */
  getPendingOrders(): PaymentOrder[] {
    return Array.from(this.pendingOrders.values())
      .filter(order => order.status === 'pending');
  }

  /**
   * Save pending orders to localStorage
   */
  private savePendingOrders(): void {
    try {
      const ordersArray = Array.from(this.pendingOrders.values());
      localStorage.setItem('flappypi-pending-orders', JSON.stringify(ordersArray));
    } catch (error) {
      console.error('❌ Error saving pending orders:', error);
    }
  }

  /**
   * Load pending orders from localStorage
   */
  private loadPendingOrders(): void {
    try {
      const stored = localStorage.getItem('flappypi-pending-orders');
      if (stored) {
        const ordersArray: PaymentOrder[] = JSON.parse(stored);
        this.pendingOrders.clear();
        ordersArray.forEach(order => {
          this.pendingOrders.set(order.orderId, order);
        });
        console.log('📝 Loaded pending orders:', ordersArray.length);
      }
    } catch (error) {
      console.error('❌ Error loading pending orders:', error);
    }
  }

  /**
   * Refresh wallet balance
   */
  async refreshWalletBalance(): Promise<void> {
    try {
      await this.loadWalletAccount();
      console.log('💰 Wallet balance refreshed');
    } catch (error) {
      console.error('❌ Error refreshing wallet balance:', error);
    }
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.MAINNET_API_BASE}/accounts/${this.MAINNET_WALLET_ADDRESS}/transactions?limit=${limit}&order=desc`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();
      return data._embedded?.records || [];
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const piMainnetWalletService = PiMainnetWalletService.getInstance();
export default piMainnetWalletService;
