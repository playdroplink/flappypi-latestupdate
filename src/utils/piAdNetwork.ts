export function isPiAdNetworkAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.Pi !== 'undefined' &&
    typeof window.Pi.openAd === 'function'
  );
} 