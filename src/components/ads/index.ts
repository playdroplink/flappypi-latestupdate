// Ads System Components
export { AdsManager } from './AdsManager';
export { AdButton, ReviveAdButton, CoinsAdButton, InterstitialAdButton } from './AdButton';
export { AdsIntegrationExample } from './AdsIntegrationExample';

// Re-export hooks and services for convenience
export { useAdsSystem } from '@/hooks/useAdsSystem';
export { adService } from '@/services/adService';
export { piAdsService } from '@/services/piAdsService';

// Re-export types
export type { AdRewardResult } from '@/services/adService';
export type { AdsSystemState } from '@/hooks/useAdsSystem';
