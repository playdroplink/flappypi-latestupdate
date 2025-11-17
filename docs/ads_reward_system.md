# Flappy Pi Ads & Reward System

## Overview

The Ads & Reward System allows players to watch rewarded ads to earn in-game benefits like revives or small Pi coin bonuses. This system integrates with the Pi Ad Network or placeholder ad services if Pi Ads are unavailable.

---

## Features

* Rewarded video ads that players can choose to watch voluntarily
* Rewards include:

  * Extra revive to continue after game over
  * Small Pi coin bonuses added to user balance
* Ad availability and cooldown timers to prevent abuse
* UI prompts before and after ads to inform players about rewards

---

## Components Involved

* **AdsManager** (Frontend):

  * Handles ad loading, display, and reward triggering
  * Manages cooldown timers and ad availability state

* **PiSDKWrapper** (Frontend):

  * Connects with Pi Ad Network SDK or third-party ad provider
  * Tracks ad impressions and rewards distribution

* **Backend API**:

  * Records rewarded ad usage
  * Updates user Pi balances or revive counts securely

---

## Workflow

1. Player opts to watch a rewarded ad (e.g., after game over)
2. AdsManager checks cooldown and ad availability
3. If ad is available, load and display rewarded video
4. On ad completion, AdsManager triggers reward distribution:

   * For revives: increase revive count for user session
   * For Pi bonuses: call backend to add Pi to user balance
5. Update cooldown timer to prevent immediate repeated rewards
6. Notify player of earned reward

---

## Cooldown & Limits

* Typical cooldown: 5-10 minutes between rewarded ads
* Maximum rewards per day to avoid exploitation
* Backend enforces limits and validates reward claims

---

## Error Handling

* If ad fails to load or user skips, no reward is granted
* Show friendly message and option to try again later

---

## Implementation Notes

* Use Pi Ad Network SDK if available; fallback to AdMob, Unity Ads, or other providers
* Secure all reward granting via backend to prevent client spoofing
* Track ad engagement metrics for analytics and optimization

---

## Example UI

* Button: “Watch Ad to Revive” or “Watch Ad to Earn Pi”
* Progress spinner during ad load
* Reward confirmation popup after ad finishes

---

## References

* [Pi Ad Network Documentation (if available)](https://minepi.com/developers/ad-network)
* [Rewarded Ads Integration Guide - AdMob](https://developers.google.com/admob/android/rewarded-video)
* [Unity Ads Rewarded Video](https://unityads.unity3d.com/help/unity/integration-guide-unity)

---

## Additional Logic for Ad Display

```javascript
useEffect(() => {
  // Increment game count on every game restart
  adSystem.incrementGameCount();

  // Check if mandatory ad should be shown
  if (adSystem.gameCount % 3 === 0 && !adSystem.isAdFree) {
    adSystem.shouldShowMandatoryAd = true;
  } else {
    adSystem.shouldShowMandatoryAd = false;
  }
}, [adSystem.gameCount]);

// Ensure ad counter resets when ad-free is purchased
useEffect(() => {
  if (adSystem.isAdFree) {
    adSystem.resetAdCounter();
  }
}, [adSystem.isAdFree]);
```


