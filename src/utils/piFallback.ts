// Pi Network API Typing Fallback
// This file provides fallback types for the missing @pinetwork-js/api-typing dependency

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: any;
  to_address: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

export interface PiAuthResult {
  user: PiUser;
  accessToken: string;
}

export interface PiAdResponse {
  result: string;
  ready?: boolean;
  adId?: string;
}

export interface PiNativeFeatures {
  features: string[];
}

// Export empty objects as fallbacks for any other missing types
export const PiNetworkTypes = {
  // Add any other types that might be needed
};

export default PiNetworkTypes; 