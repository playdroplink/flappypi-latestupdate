// Payment Mode Switcher
// Utility to switch between sandbox and mainnet payment modes

import { PI_CONFIG } from '../config/piConfig';

export interface PaymentModeInfo {
  mode: 'sandbox' | 'mainnet' | 'testnet';
  isSandbox: boolean;
  isMainnet: boolean;
  isTestnet: boolean;
  apiUrl: string;
  walletAddress: string;
  description: string;
  features: string[];
}

export class PaymentModeSwitcher {
  /**
   * Get current payment mode information
   */
  static getCurrentMode(): PaymentModeInfo {
    const isSandbox = PI_CONFIG.isSandbox();
    const isMainnet = PI_CONFIG.isMainnet();
    const isTestnet = PI_CONFIG.isTestnet();
    
    let mode: 'sandbox' | 'mainnet' | 'testnet';
    let apiUrl: string;
    let walletAddress: string;
    let description: string;
    let features: string[];

    if (isSandbox) {
      mode = 'sandbox';
      apiUrl = 'https://api.sandbox.minepi.com';
      walletAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7J';
      description = 'Sandbox Mode - Development & Testing';
      features = [
        'No real Pi transactions',
        'Works in any browser',
        'Auto-approved payments',
        'Perfect for development',
        'Simulated transactions'
      ];
    } else if (isMainnet) {
      mode = 'mainnet';
      apiUrl = 'https://api.mainnet.minepi.com';
      walletAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7J';
      description = 'Mainnet Mode - Production';
      features = [
        'Real Pi transactions',
        'Requires Pi Browser',
        'Real wallet verification',
        'Production ready',
        'Actual blockchain transactions'
      ];
    } else {
      mode = 'testnet';
      apiUrl = 'https://api.testnet.minepi.com';
      walletAddress = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7J';
      description = 'Testnet Mode - Testing';
      features = [
        'Test Pi transactions',
        'Requires Pi Browser',
        'Test wallet verification',
        'Testing environment',
        'Test blockchain transactions'
      ];
    }

    return {
      mode,
      isSandbox,
      isMainnet,
      isTestnet,
      apiUrl,
      walletAddress,
      description,
      features
    };
  }

  /**
   * Get payment service to use based on current mode
   */
  static getPaymentService() {
    const modeInfo = this.getCurrentMode();
    
    if (modeInfo.isSandbox) {
      return {
        service: 'sandboxPiPaymentService',
        description: 'Sandbox Payment Service',
        features: ['Auto-approval', 'No real transactions', 'Development friendly']
      };
    } else if (modeInfo.isMainnet) {
      return {
        service: 'piMainnetPaymentService',
        description: 'Mainnet Payment Service',
        features: ['Real transactions', 'Wallet verification', 'Production ready']
      };
    } else {
      return {
        service: 'piTestnetPaymentService',
        description: 'Testnet Payment Service',
        features: ['Test transactions', 'Test wallet verification', 'Testing environment']
      };
    }
  }

  /**
   * Get wallet status information
   */
  static async getWalletStatus(): Promise<{
    success: boolean;
    balance?: number;
    address?: string;
    apiUrl?: string;
    error?: string;
  }> {
    const modeInfo = this.getCurrentMode();
    
    try {
      const response = await fetch(`${modeInfo.apiUrl}/accounts/${modeInfo.walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Wallet API error: ${response.status} ${response.statusText}`);
      }
      
      const accountData = await response.json();
      const balance = parseFloat(accountData.balances[0]?.balance || '0');
      
      return {
        success: true,
        balance,
        address: modeInfo.walletAddress,
        apiUrl: modeInfo.apiUrl
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch wallet status'
      };
    }
  }

  /**
   * Get payment mode recommendations
   */
  static getRecommendations(): {
    development: string;
    testing: string;
    production: string;
  } {
    return {
      development: 'Use sandbox mode for development. No real Pi required, works in any browser.',
      testing: 'Use testnet mode for testing. Requires Pi Browser but uses test Pi.',
      production: 'Use mainnet mode for production. Real Pi transactions with actual wallet.'
    };
  }

  /**
   * Get mode switching instructions
   */
  static getSwitchingInstructions(): {
    toSandbox: string[];
    toMainnet: string[];
    toTestnet: string[];
  } {
    return {
      toSandbox: [
        '1. Update src/config/piConfig.ts',
        '2. Set SANDBOX_MODE: true',
        '3. Set MAINNET_MODE: false',
        '4. Set PRODUCTION_MODE: false',
        '5. Update index.html sandbox: true',
        '6. Restart development server'
      ],
      toMainnet: [
        '1. Update src/config/piConfig.ts',
        '2. Set SANDBOX_MODE: false',
        '3. Set MAINNET_MODE: true',
        '4. Set PRODUCTION_MODE: true',
        '5. Update index.html sandbox: false',
        '6. Restart development server'
      ],
      toTestnet: [
        '1. Update src/config/piConfig.ts',
        '2. Set SANDBOX_MODE: false',
        '3. Set MAINNET_MODE: false',
        '4. Set TESTNET_MODE: true',
        '5. Update index.html sandbox: false',
        '6. Restart development server'
      ]
    };
  }
}

export const paymentModeSwitcher = PaymentModeSwitcher;
