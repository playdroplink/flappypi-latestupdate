// Utility for saving and loading game data per user using localStorage

function getNetworkPrefix() {
  // Use VITE_PI_NETWORK or fallback to NODE_ENV
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PI_NETWORK) {
    return import.meta.env.VITE_PI_NETWORK === 'testnet' ? 'testnet' : 'mainnet';
  }
  // Fallback: treat localhost as testnet, production as mainnet
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'testnet';
  }
  return 'mainnet';
}

function getGameDataKey(username) {
  const prefix = getNetworkPrefix();
  return `${prefix}_gameData_${username}`;
}

// Save game data for a user
export function saveGameData(username: string, data: any) {
  localStorage.setItem(getGameDataKey(username), JSON.stringify(data));
}

// Load game data for a user
export function loadGameData(username: string) {
  const data = localStorage.getItem(getGameDataKey(username));
  return data ? JSON.parse(data) : null;
}

// Update a single field in the user's game data
export function updateGameDataField(username: string, field: string, value: any) {
  const data = loadGameData(username) || {};
  data[field] = value;
  saveGameData(username, data);
} 