// Pi SDK authentication utility
export async function authenticateWithPi(onIncompletePaymentFound) {
  if (!window.Pi) throw new Error("Pi SDK not loaded");
  // Request all relevant scopes
  const authRes = await window.Pi.authenticate([
    'username',
    'payments',
    'wallet_address'
  ], onIncompletePaymentFound);
  return authRes.accessToken;
} 