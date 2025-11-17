declare global {
  interface Window {
    Pi: any;
  }
}

// Pi Network utility for Pi Browser detection and authentication

export function isPiBrowser(): boolean {
  const ua = navigator.userAgent;
  const hasPiBrowser = /PiBrowser|Pi\//i.test(ua);
  const hasPiObject = typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  return hasPiBrowser || hasPiObject;
}

// Minimal Pi Network authentication utility
// Usage: Call authenticateWithPi() to trigger Pi login and get user info
// Always verify the accessToken on your backend using the Pi Platform /me endpoint

export async function authenticateWithPi() {
  const Pi = window.Pi;
  if (!Pi) {
    throw new Error('Pi Network SDK not available. Please open in Pi Browser.');
  }
  const scopes = ['username']; // Only request what you need
  function onIncompletePaymentFound(payment) {
    // You can handle incomplete payments here if your app uses Pi payments
    console.log('Incomplete payment found:', payment);
  }
  try {
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    // auth: { accessToken: string, user: { uid: string, username: string } }
    // SECURITY: Send accessToken to your backend and verify with Pi Platform /me endpoint
    return auth;
  } catch (error) {
    console.error('Pi authentication failed:', error);
    throw error;
  }
}

export async function verifyPiUser(accessToken: string) {
  try {
    const res = await fetch('https://api.minepi.com/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Invalid token');
    return await res.json(); // This is the UserDTO
  } catch (err) {
    console.error('Failed to verify Pi user:', err);
    return null;
  }
}

export async function showRewardedAdAndVerify() {
  if (!window.Pi || !window.Pi.Ads) throw new Error('Pi SDK not available');
  const result = await window.Pi.Ads.showAd('rewarded');
  if (result.type === 'rewarded' && result.result === 'AD_REWARDED' && result.adId) {
    // Verify with backend
    const res = await fetch('/api/pi/verify-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: result.adId }),
    });
    if (!res.ok) throw new Error('Ad verification failed');
    return true;
  }
  throw new Error('Ad not rewarded or not available');
}