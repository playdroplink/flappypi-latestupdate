import { useEffect, useState } from 'react';
import { adService } from '../services/adService';

/**
 * Returns the remaining cooldown (in seconds) for rewarded ads, updating every second.
 */
export function useRewardedAdCooldown() {
  const [cooldown, setCooldown] = useState(() => Math.ceil(adService.getCooldownTime() / 1000));

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      const next = Math.ceil(adService.getCooldownTime() / 1000);
      setCooldown(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Also update immediately if cooldown hits zero
  useEffect(() => {
    if (cooldown > 0) {
      const timeout = setTimeout(() => setCooldown(Math.ceil(adService.getCooldownTime() / 1000)), 100);
      return () => clearTimeout(timeout);
    }
  }, [cooldown]);

  return cooldown;
} 