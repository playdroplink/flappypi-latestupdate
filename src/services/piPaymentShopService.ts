// Pi Network Payment Shop Service
// Based on official Pi SDK documentation: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Payments
// Handles multiple product types: game lives, premium skins, subscriptions, and in-game currency

import { piNetworkConfig } from '../config/piNetworkConfig';

export type ProductType = 'game_lives' | 'premium_skins' | 'subscription' | 'coins';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  amount: number;
  currency: string;
  memo: string;
  metadata: Record<string, any>;
}

export interface PaymentRequest {
  product: Product;
  user: {
    uid: string;
    username: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
  product?: Product;
}

export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => Promise<void>;
  onReadyForServerCompletion: (paymentId: string, txid: string) => Promise<void>;
  onCancel: (paymentId: string) => Promise<void>;
  onError: (error: Error, payment?: any) => Promise<void>;
}

// Product catalog
export const PRODUCT_CATALOG: Record<string, Product> = {
  // Game Lives/Revives
  'single_revive': {
    id: 'single_revive',
    type: 'game_lives',
    name: 'Single Revive',
    description: 'Continue playing after losing',
    amount: 0.1,
    currency: 'Pi',
    memo: 'Flappy Pi - Single Game Revive',
    metadata: { product_type: 'game_lives', lives: 1 }
  },
  'triple_revive': {
    id: 'triple_revive',
    type: 'game_lives',
    name: 'Triple Revive Pack',
    description: '3 revives for continued gameplay',
    amount: 0.25,
    currency: 'Pi',
    memo: 'Flappy Pi - Triple Revive Pack',
    metadata: { product_type: 'game_lives', lives: 3 }
  },
  
  // Premium Skins/Themes
  'golden_bird_skin': {
    id: 'golden_bird_skin',
    type: 'premium_skins',
    name: 'Golden Bird Skin',
    description: 'Exclusive golden bird character skin',
    amount: 1.0,
    currency: 'Pi',
    memo: 'Flappy Pi - Golden Bird Skin',
    metadata: { product_type: 'premium_skins', skin_id: 'golden_bird', rarity: 'legendary' }
  },
  'neon_theme': {
    id: 'neon_theme',
    type: 'premium_skins',
    name: 'Neon Theme Pack',
    description: 'Cyberpunk neon game theme',
    amount: 0.5,
    currency: 'Pi',
    memo: 'Flappy Pi - Neon Theme Pack',
    metadata: { product_type: 'premium_skins', theme_id: 'neon', rarity: 'rare' }
  },
  
  // Subscription Plans
  'monthly_premium': {
    id: 'monthly_premium',
    type: 'subscription',
    name: 'Monthly Premium',
    description: 'Premium features for 30 days',
    amount: 2.0,
    currency: 'Pi',
    memo: 'Flappy Pi - Monthly Premium Subscription',
    metadata: { product_type: 'subscription', plan: 'monthly', duration_days: 30 }
  },
  'yearly_premium': {
    id: 'yearly_premium',
    type: 'subscription',
    name: 'Yearly Premium',
    description: 'Premium features for 365 days (20% savings)',
    amount: 19.2,
    currency: 'Pi',
    memo: 'Flappy Pi - Yearly Premium Subscription',
    metadata: { product_type: 'subscription', plan: 'yearly', duration_days: 365 }
  },
  
  // In-Game Currency/Coins
  'coin_pack_small': {
    id: 'coin_pack_small',
    type: 'coins',
    name: 'Small Coin Pack',
    description: '100 Flappy Pi coins',
    amount: 0.5,
    currency: 'Pi',
    memo: 'Flappy Pi - Small Coin Pack',
    metadata: { product_type: 'coins', coins: 100 }
  },
  'coin_pack_medium': {
    id: 'coin_pack_medium',
    type: 'coins',
    name: 'Medium Coin Pack',
    description: '500 Flappy Pi coins',
    amount: 2.0,
    currency: 'Pi',
    memo: 'Flappy Pi - Medium Coin Pack',
    metadata: { product_type: 'coins', coins: 500 }
  },
  'coin_pack_large': {
    id: 'coin_pack_large',
    type: 'coins',
    name: 'Large Coin Pack',
    description: '1000 Flappy Pi coins',
    amount: 3.5,
    currency: 'Pi',
    memo: 'Flappy Pi - Large Coin Pack',
    metadata: { product_type: 'coins', coins: 1000 }
  }
};

class PiPaymentShopService {
  private static instance: PiPaymentShopService;
  private pendingPayments: Map<string, Product> = new Map();
  private isInitialized = false;

  static getInstance(): PiPaymentShopService {
    if (!PiPaymentShopService.instance) {
      PiPaymentShopService.instance = new PiPaymentShopService();
    }
    return PiPaymentShopService.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    try {
      // Ensure Pi SDK is initialized
      if (window.Pi && window.Pi.init) {
        await window.Pi.init({
          version: "2.0",
          sandbox: piNetworkConfig.pi.sandbox
        });
        console.log('✅ Pi Payment Shop Service: SDK initialized');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Pi Payment Shop Service initialization error:', error);
      this.isInitialized = true; // Continue anyway
    }
  }

  // Get product by ID
  getProduct(productId: string): Product | undefined {
    return PRODUCT_CATALOG[productId];
  }

  // Get all products by type
  getProductsByType(type: ProductType): Product[] {
    return Object.values(PRODUCT_CATALOG).filter(p => p.type === type);
  }

  // Get all products
  getAllProducts(): Product[] {
    return Object.values(PRODUCT_CATALOG);
  }

  // Handle incomplete payment found callback
  private onIncompletePaymentFound = async (payment: any) => {
    console.log('🔄 Incomplete payment found:', payment);
    
    try {
      // Complete the in-flight payment via backend
      const paymentId = payment.identifier || payment.payment_id || payment.id;
      if (paymentId) {
        await this.completeIncompletePayment(paymentId);
      }
    } catch (error) {
      console.error('❌ Error handling incomplete payment:', error);
    }
  };

  // Complete incomplete payment via backend
  private async completeIncompletePayment(paymentId: string): Promise<void> {
    try {
      const response = await fetch('/api/payments/complete-incomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) {
        throw new Error(`Failed to complete incomplete payment: ${response.statusText}`);
      }

      console.log('✅ Incomplete payment completed:', paymentId);
    } catch (error) {
      console.error('❌ Error completing incomplete payment:', error);
      throw error;
    }
  };

  // Server approval callback
  private async handleServerApproval(paymentId: string): Promise<void> {
    console.log('🔄 Payment ready for server approval:', paymentId);
    
    try {
      const product = this.pendingPayments.get(paymentId);
      if (!product) {
        throw new Error('Product not found for payment');
      }

      const response = await fetch('/api/payments/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          product: product
        })
      });

      if (!response.ok) {
        throw new Error(`Server approval failed: ${response.statusText}`);
      }

      console.log('✅ Payment approved by server:', paymentId);
    } catch (error) {
      console.error('❌ Server approval error:', error);
      throw error;
    }
  };

  // Server completion callback
  private async handleServerCompletion(paymentId: string, txid: string): Promise<void> {
    console.log('🔄 Payment ready for server completion:', paymentId, txid);
    
    try {
      const product = this.pendingPayments.get(paymentId);
      if (!product) {
        throw new Error('Product not found for payment');
      }

      const response = await fetch('/api/payments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          txid,
          product: product
        })
      });

      if (!response.ok) {
        throw new Error(`Server completion failed: ${response.statusText}`);
      }

      console.log('✅ Payment completed by server:', paymentId);
      
      // Remove from pending payments
      this.pendingPayments.delete(paymentId);
    } catch (error) {
      console.error('❌ Server completion error:', error);
      throw error;
    }
  };

  // Payment cancel callback
  private async handlePaymentCancel(paymentId: string): Promise<void> {
    console.log('❌ Payment cancelled by user:', paymentId);
    this.pendingPayments.delete(paymentId);
  };

  // Payment error callback
  private async handlePaymentError(error: Error, payment?: any): Promise<void> {
    console.error('❌ Payment error:', error, payment);
    
    if (payment) {
      const paymentId = payment.identifier || payment.payment_id || payment.id;
      if (paymentId) {
        this.pendingPayments.delete(paymentId);
      }
    }
  };

  // Create payment for a product
  async createPayment(productId: string, user: { uid: string; username: string }): Promise<PaymentResult> {
    await this.initialize();

    try {
      const product = this.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      console.log('💰 Creating payment for product:', product.name);

      // Check if Pi SDK is available
      if (!window.Pi) {
        throw new Error('Pi SDK is not available. Please ensure you are using Pi Browser.');
      }

      // Ensure Pi SDK is initialized
      if (window.Pi.init) {
        await window.Pi.init({
          version: "2.0",
          sandbox: piNetworkConfig.pi.sandbox
        });
      }

      // Store product for callbacks
      const paymentId = `pending_${Date.now()}_${user.uid}`;
      this.pendingPayments.set(paymentId, product);

      // Create payment with callbacks
      const callbacks: PaymentCallbacks = {
        onReadyForServerApproval: this.handleServerApproval.bind(this),
        onReadyForServerCompletion: this.handleServerCompletion.bind(this),
        onCancel: this.handlePaymentCancel.bind(this),
        onError: this.handlePaymentError.bind(this)
      };

      // Call Pi.createPayment
      const paymentData = {
        amount: product.amount,
        memo: product.memo,
        metadata: {
          ...product.metadata,
          product_id: product.id,
          user_id: user.uid,
          username: user.username,
          timestamp: Date.now()
        }
      };

      const result = await new Promise<PaymentResult>((resolve) => {
        try {
          window.Pi.createPayment(paymentData, {
            onReadyForServerApproval: async (id: string) => {
              try {
                await callbacks.onReadyForServerApproval(id);
                resolve({ success: true, paymentId: id, product });
              } catch (error) {
                resolve({ success: false, error: error instanceof Error ? error.message : 'Approval failed' });
              }
            },
            onReadyForServerCompletion: async (id: string, txid: string) => {
              try {
                await callbacks.onReadyForServerCompletion(id, txid);
                resolve({ success: true, paymentId: id, txid, product });
              } catch (error) {
                resolve({ success: false, error: error instanceof Error ? error.message : 'Completion failed' });
              }
            },
            onCancel: async (id: string) => {
              await callbacks.onCancel(id);
              resolve({ success: false, error: 'Payment cancelled by user' });
            },
            onError: async (error: Error, payment?: any) => {
              await callbacks.onError(error, payment);
              resolve({ success: false, error: error.message });
            }
          });
        } catch (error) {
          resolve({ success: false, error: error instanceof Error ? error.message : 'Payment creation failed' });
        }
      });

      console.log('💰 Payment result:', result);
      return result;

    } catch (error) {
      console.error('❌ Payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  // Get pending payments
  getPendingPayments(): Map<string, Product> {
    return this.pendingPayments;
  }
}

export const piPaymentShopService = PiPaymentShopService.getInstance();