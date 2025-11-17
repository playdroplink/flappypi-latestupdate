# Pi SDK Ads Implementation Guide

This guide explains how to use the implemented Pi SDK ads system in the Flappy Pi game, following the official Pi Network documentation.

## Overview

The ads system has been implemented following the official Pi SDK documentation and includes:

- **Interstitial Ads**: Full-screen ads shown between game sessions
- **Rewarded Ads**: Full-screen ads that reward users with revives or coins
- **Security Verification**: Platform API verification for rewarded ads
- **Cooldown System**: Prevents ad abuse with configurable cooldowns
- **Pi Browser Detection**: Ensures ads only work in Pi Browser
- **Error Handling**: Comprehensive error handling and user feedback

## Architecture

### Core Components

1. **`src/services/adService.ts`** - Main ads service with Pi SDK integration
2. **`src/services/piAdsService.ts`** - Pi SDK wrapper service
3. **`src/services/piPlatformApi.ts`** - Platform API for ad verification
4. **`src/hooks/useAdsSystem.ts`** - React hook for ads functionality
5. **`src/components/ads/AdsManager.tsx`** - Complete ads management UI
6. **`src/components/ads/AdButton.tsx`** - Simple ad button components

### Key Features

- ✅ **Official Pi SDK Integration**: Uses `Pi.Ads.showAd()`, `Pi.Ads.isAdReady()`, `Pi.Ads.requestAd()`
- ✅ **Security Verification**: Verifies rewarded ads with Platform API
- ✅ **Native Features Check**: Checks for `ad_network` support
- ✅ **Pi Browser Detection**: Ensures ads only work in Pi Browser
- ✅ **Cooldown Management**: Prevents ad abuse
- ✅ **Error Handling**: Comprehensive error states and user feedback
- ✅ **TypeScript Support**: Full type safety
- ✅ **React Integration**: Easy-to-use hooks and components

## Usage Examples

### 1. Using the Ads Hook

```typescript
import { useAdsSystem } from '@/hooks/useAdsSystem';

const MyComponent = () => {
  const {
    isAdNetworkSupported,
    cooldownTime,
    isWatchingAd,
    showRewardedAdForRevive,
    showRewardedAdForCoins,
    showInterstitialAd
  } = useAdsSystem();

  const handleRevive = async () => {
    const result = await showRewardedAdForRevive();
    if (result.success) {
      // User earned a revive
      console.log('Revive earned!');
    }
  };

  const handleEarnCoins = async () => {
    const result = await showRewardedAdForCoins();
    if (result.success) {
      // User earned coins
      console.log(`Earned ${result.reward_amount} coins!`);
    }
  };

  return (
    <div>
      <button 
        onClick={handleRevive}
        disabled={!isAdNetworkSupported || cooldownTime > 0}
      >
        Watch Ad for Revive
      </button>
      
      <button 
        onClick={handleEarnCoins}
        disabled={!isAdNetworkSupported || cooldownTime > 0}
      >
        Watch Ad for Coins
      </button>
    </div>
  );
};
```

### 2. Using Ad Button Components

```typescript
import { ReviveAdButton, CoinsAdButton, InterstitialAdButton } from '@/components/ads/AdButton';

const MyComponent = () => {
  const handleReviveSuccess = (rewardType: 'revive', amount: number) => {
    console.log('Revive earned!');
    // Handle revive logic
  };

  const handleCoinsSuccess = (rewardType: 'coins', amount: number) => {
    console.log(`Earned ${amount} coins!`);
    // Handle coins logic
  };

  return (
    <div>
      <ReviveAdButton 
        onSuccess={handleReviveSuccess}
        variant="outline"
        className="mb-2"
      />
      
      <CoinsAdButton 
        onSuccess={handleCoinsSuccess}
        variant="outline"
        className="mb-2"
      />
      
      <InterstitialAdButton 
        variant="secondary"
      />
    </div>
  );
};
```

### 3. Using the Complete Ads Manager

```typescript
import { AdsManager } from '@/components/ads/AdsManager';

const MyComponent = () => {
  const handleRewardEarned = (rewardType: 'revive' | 'coins', amount: number) => {
    if (rewardType === 'revive') {
      // Handle revive
      console.log('Revive earned!');
    } else if (rewardType === 'coins') {
      // Handle coins
      console.log(`Earned ${amount} coins!`);
    }
  };

  const handleAdCompleted = () => {
    console.log('Ad completed successfully');
  };

  const handleAdFailed = (error: string) => {
    console.error('Ad failed:', error);
  };

  return (
    <AdsManager
      onRewardEarned={handleRewardEarned}
      onAdCompleted={handleAdCompleted}
      onAdFailed={handleAdFailed}
      className="max-w-md"
    />
  );
};
```

## Integration with Game Components

### 1. Game Over Modal Integration

```typescript
// In GameOverModal.tsx
import { ReviveAdButton } from '@/components/ads/AdButton';

const GameOverModal = ({ onRevive, ...props }) => {
  const handleReviveSuccess = (rewardType: 'revive', amount: number) => {
    onRevive('ad'); // Pass 'ad' to indicate this was a free revive via ad
  };

  return (
    <div>
      {/* Other game over content */}
      
      <ReviveAdButton 
        onSuccess={handleReviveSuccess}
        variant="outline"
        size="lg"
        className="w-full mb-2"
      >
        Watch Ad to Revive
      </ReviveAdButton>
    </div>
  );
};
```

### 2. Shop Integration

```typescript
// In shop components
import { CoinsAdButton } from '@/components/ads/AdButton';

const CoinShop = ({ onCoinsEarned }) => {
  const handleCoinsSuccess = (rewardType: 'coins', amount: number) => {
    onCoinsEarned(amount);
  };

  return (
    <div>
      <CoinsAdButton 
        onSuccess={handleCoinsSuccess}
        variant="outline"
        className="w-full"
      >
        Watch Ad for 10 Coins
      </CoinsAdButton>
    </div>
  );
};
```

### 3. Mandatory Ads Integration

```typescript
// In game components
import { useAdsSystem } from '@/hooks/useAdsSystem';

const GameComponent = () => {
  const { incrementGameCount, shouldShowMandatoryAd, handleMandatoryAd } = useAdsSystem();

  const handleGameOver = () => {
    incrementGameCount(); // Increment game count for mandatory ads
    
    if (shouldShowMandatoryAd) {
      // Show mandatory ad modal
      setShowMandatoryAdModal(true);
    } else {
      // Normal game over flow
      setGameState('gameOver');
    }
  };

  const handleMandatoryAdWatch = async () => {
    const success = await handleMandatoryAd();
    if (success) {
      // Continue with game flow
      setGameState('gameOver');
    }
  };

  return (
    <div>
      {/* Game content */}
      
      {shouldShowMandatoryAd && (
        <div className="mandatory-ad-modal">
          <h3>Watch a quick ad to continue</h3>
          <button onClick={handleMandatoryAdWatch}>
            Watch Ad
          </button>
        </div>
      )}
    </div>
  );
};
```

## Configuration

### Ad Cooldowns

Cooldowns are configured in the ads service:

```typescript
// In src/services/adService.ts
this.adCooldown = 60; // 60 seconds for rewarded ads
this.adCooldown = 30; // 30 seconds for interstitial ads
```

### Mandatory Ad Frequency

Configure mandatory ad frequency in the ads hook:

```typescript
// In src/hooks/useAdsSystem.ts
// Show mandatory ad every 2 games
if (newCount % 2 === 0 && !hasActiveSubscription) {
  setShouldShowMandatoryAd(true);
}
```

## Security Features

### 1. Platform API Verification

All rewarded ads are verified with the Pi Platform API:

```typescript
// In src/services/adService.ts
if (showAdResponse.result === 'AD_REWARDED' && showAdResponse.adId) {
  // Verify the ad status with Pi Platform API for security
  const adStatus = await this.verifyAdStatus(showAdResponse.adId);
  
  if (adStatus.mediator_ack_status === 'granted') {
    // Only reward if verified
    return { success: true, reward_amount: 10 };
  }
}
```

### 2. Pi Browser Detection

Ads only work in Pi Browser:

```typescript
if (!piBrowserRedirect.isInPiBrowser()) {
  return { success: false, description: 'Pi Browser required' };
}
```

### 3. Native Features Check

Checks for ad network support:

```typescript
const nativeFeaturesList = await window.Pi.nativeFeaturesList();
this.adNetworkSupported = nativeFeaturesList.includes('ad_network');
```

## Error Handling

The system handles various error scenarios:

1. **Pi Browser not available**: Shows redirect modal
2. **Ad network not supported**: Shows update message
3. **Ad cooldown active**: Shows cooldown timer
4. **Ad loading failed**: Shows retry option
5. **Ad verification failed**: Shows error message
6. **Network errors**: Shows generic error with retry

## Testing

### Development Testing

The ads system includes debug controls in development:

```typescript
{process.env.NODE_ENV === 'development' && (
  <Card>
    <CardHeader>
      <CardTitle>Debug Controls</CardTitle>
    </CardHeader>
    <CardContent>
      <Button onClick={resetCooldown}>
        Reset Cooldown
      </Button>
      <Button onClick={() => console.log(getStatus())}>
        Log Status
      </Button>
    </CardContent>
  </Card>
)}
```

### Testnet vs Mainnet

The system automatically detects the network mode:

```typescript
// In src/services/piAdsService.ts
const isMainnet = PI_CONFIG.getNetworkMode() === 'mainnet';
```

## Best Practices

1. **Always verify rewarded ads** with Platform API before giving rewards
2. **Check Pi Browser availability** before showing ad buttons
3. **Handle cooldowns gracefully** with user-friendly messages
4. **Provide fallback options** when ads are not available
5. **Use appropriate ad types** for different scenarios:
   - Rewarded ads for user-initiated actions (revives, coins)
   - Interstitial ads for mandatory viewing (every N games)
6. **Test thoroughly** in both testnet and mainnet environments

## Troubleshooting

### Common Issues

1. **"Ads not supported"**: Update Pi Browser to latest version
2. **"Pi Browser required"**: Open game in Pi Browser app
3. **"Ad cooldown active"**: Wait for cooldown to expire
4. **"Ad verification failed"**: Check Platform API configuration
5. **"Network error"**: Check internet connection and try again

### Debug Information

Enable debug logging to troubleshoot issues:

```typescript
// Check ads status
console.log('Ads Status:', {
  isAdNetworkSupported,
  cooldownTime,
  isWatchingAd,
  adError
});

// Check Pi SDK availability
console.log('Pi SDK:', {
  available: typeof window !== 'undefined' && !!window.Pi,
  ads: window.Pi?.Ads,
  nativeFeatures: await window.Pi?.nativeFeaturesList()
});
```

## API Reference

### useAdsSystem Hook

```typescript
const {
  // State
  isAdNetworkSupported: boolean,
  cooldownTime: number,
  isWatchingAd: boolean,
  adError: string | null,
  
  // Mandatory ad system
  gameCount: number,
  shouldShowMandatoryAd: boolean,
  incrementGameCount: () => void,
  handleMandatoryAd: () => Promise<boolean>,
  skipMandatoryAd: () => void,
  
  // Ad methods
  showRewardedAdForRevive: () => Promise<AdRewardResult>,
  showRewardedAdForCoins: () => Promise<AdRewardResult>,
  showInterstitialAd: () => Promise<boolean>,
  
  // Utility methods
  resetCooldown: () => void,
  getStatus: () => object
} = useAdsSystem();
```

### AdButton Component

```typescript
<AdButton
  type="revive" | "coins" | "interstitial"
  variant="default" | "outline" | "secondary" | "ghost"
  size="default" | "sm" | "lg" | "icon"
  onSuccess={(rewardType, amount) => void}
  onError={(error) => void}
  disabled={boolean}
>
  Custom Button Text
</AdButton>
```

This implementation provides a complete, secure, and user-friendly ads system that follows Pi Network's official documentation and best practices.
