// Type definitions for Pi Network SDK on window
interface PiAuthResponse {
  username: string;
  walletAddress: string;
  accessToken?: string;
  user?: any;
}

interface PiSDK {
  authenticate: (scopes?: string[], onIncompletePaymentFound?: (payment: any) => void) => Promise<PiAuthResponse>;
  // Add other Pi SDK methods as needed
}

interface Window {
  Pi?: PiSDK;
}
