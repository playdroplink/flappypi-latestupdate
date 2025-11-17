interface PiPaymentChargeCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: any, payment: any) => void;
}

interface PiPayments {
  charge: (paymentData: { amount: number; memo: string; metadata: any; uid: string }, callbacks: PiPaymentChargeCallbacks) => void;
  cancel: (paymentId: string) => void;
}

interface PiSDK {
  init: (options: { version: string; sandbox?: boolean; validationKey?: string }) => Promise<any>;
  auth: {
    get:
      (options: { scopes: string[]; fingerprint: boolean; }) => Promise<{ accessToken: string; user: PiUser }>;
  };
  payments: {
    create: (payment: PiPayment) => Promise<any>;
    approve: (paymentId: string) => Promise<any>;
    complete: (paymentId: string, txid: string) => Promise<any>;
    cancel: (paymentId: string) => Promise<any>;
    get: (paymentId: string) => Promise<any>;
    onIncompletePaymentFound: (callback: (payment: any) => void) => void;
  };
  user: {
    get: () => Promise<PiUser>;
  };
  nativeFeaturesList: () => Promise<string[]>;
  Ads: {
    isAdReady: (type: "interstitial" | "rewarded") => Promise<{ ready: boolean }>;
    requestAd: (type: "interstitial" | "rewarded") => Promise<{ result: string; adId?: string }>;
    showAd: (type: "interstitial" | "rewarded") => Promise<{ result: string; adId?: string }>;
  };
  authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: any) => void) => Promise<any>;
  createPayment: (paymentData: any, callbacks: PiPaymentChargeCallbacks) => Promise<{ txid: string; identifier: string }>;
  openShareDialog: (title: string, message: string) => void;
  // Add other Pi SDK methods as needed
}

interface Window {
  Pi?: any;
  piAccessToken?: string;
}

const isPiBrowser = typeof window !== 'undefined' && typeof window.Pi !== 'undefined';

if (typeof window.Pi !== 'undefined') {
  // Safe to use Pi SDK
}

const authRes = await window.Pi.authenticate([
  'username',
  'payments',
  'wallet_address'
], () => {});

export interface PiUser {
  uid: string;
  username: string;
  // Add other properties as needed based on Pi Network's user object
}

export interface PiPayment {
  amount: number;
  memo: string;
  metadata?: any;
  uid?: string; // payer user id
  to_uid?: string; // recipient user id
}