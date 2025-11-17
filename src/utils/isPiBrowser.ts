// src/utils/isPiBrowser.ts
export function isPiBrowser() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  // Check for Pi SDK object (most reliable)
  if (typeof window.Pi !== 'undefined') return true;
  // Check for Pi Browser indicators in user agent
  if (
    ua.includes('pi browser') ||
    ua.includes('pibrowser') ||
    ua.includes('pi-browser') ||
    ua.includes('minepi') ||
    ua.includes('pinet') ||
    ua.includes('pi/')
  ) return true;
  // Check for Pi subdomains
  if (
    window.location.hostname.endsWith('.pinet.com') ||
    window.location.hostname.endsWith('.minepi.com') ||
    window.location.hostname.endsWith('.pi.network')
  ) return true;
  return false;
} 