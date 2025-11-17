// Wallet utility functions for managing balance persistence

// Seed a small starting balance on first run so the wallet "works"
// without requiring a backend profile yet. Tunable via localStorage if needed.
const DEFAULT_START_BALANCE = 1000;
const WALLET_SEEDED_FLAG = 'flappypi-wallet-seeded';

export const getWalletKey = (username?: string) => {
  if (!username) return 'flappypi-balance';
  return `flappypi-balance-${username}`;
};

export const getTransactionsKey = (username?: string) => {
  if (!username) return 'flappypi-transactions';
  return `flappypi-transactions-${username}`;
};

export const saveWalletBalance = (balance: number, username?: string) => {
  const key = getWalletKey(username);
  localStorage.setItem(key, String(balance));
  
  // Auto-sync wallet balance to cloud if user is logged in
  syncWalletToCloud(balance, username);
};

// New function: Sync wallet balance to cloud
const syncWalletToCloud = async (balance: number, username?: string) => {
  try {
    const piUserData = localStorage.getItem('flappypi-pi-user');
    if (!piUserData) return;
    
    const piUser = JSON.parse(piUserData);
    if (!piUser?.uid) return;
    
    console.log('💰 Syncing wallet balance to cloud:', balance);
    
    // Import inventoryService dynamically to avoid circular dependency
    const { inventoryService } = await import('../services/inventoryService');
    
    // Trigger a sync that includes wallet balance
    await inventoryService.syncInventoryToCloud(piUser.uid);
    
    console.log('✅ Wallet balance synced to cloud');
  } catch (error) {
    console.warn('⚠️ Failed to sync wallet to cloud:', error);
    // Don't throw - wallet still saved locally
  }
};

export const loadWalletBalance = (username?: string): number => {
  const key = getWalletKey(username);
  const saved = localStorage.getItem(key);
  if (saved !== null && saved !== undefined) {
    return Number(saved);
  }

  // If no balance exists yet, seed once per device
  const alreadySeeded = localStorage.getItem(WALLET_SEEDED_FLAG) === '1';
  const initial = alreadySeeded ? 0 : DEFAULT_START_BALANCE;
  if (!alreadySeeded) {
    localStorage.setItem(WALLET_SEEDED_FLAG, '1');
  }
  localStorage.setItem(key, String(initial));
  return initial;
};

export const saveWalletTransactions = (transactions: any[], username?: string) => {
  const key = getTransactionsKey(username);
  localStorage.setItem(key, JSON.stringify(transactions));
};

export const loadWalletTransactions = (username?: string): any[] => {
  const key = getTransactionsKey(username);
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const transactions = JSON.parse(saved);
      return transactions;
    } catch (error) {
      console.error('Failed to parse saved transactions:', error);
      return [];
    }
  }
  return [];
};

export const migrateWalletBalance = (oldUsername: string, newUsername: string) => {
  const oldKey = getWalletKey(oldUsername);
  const newKey = getWalletKey(newUsername);
  const oldBalance = localStorage.getItem(oldKey);
  
  if (oldBalance) {
    localStorage.setItem(newKey, oldBalance);
    localStorage.removeItem(oldKey);
  }
};

export const clearUserWalletData = (username: string) => {
  const balanceKey = getWalletKey(username);
  const transactionsKey = getTransactionsKey(username);
  
  localStorage.removeItem(balanceKey);
  localStorage.removeItem(transactionsKey);
};

export const backupWalletBalance = (username: string) => {
  const balance = loadWalletBalance(username);
  const transactions = loadWalletTransactions(username);
  
  return {
    balance,
    transactions,
    timestamp: new Date().toISOString()
  };
};

export const restoreWalletBalance = (username: string, backup: any) => {
  if (backup.balance !== undefined) {
    saveWalletBalance(backup.balance, username);
  }
  if (backup.transactions) {
    saveWalletTransactions(backup.transactions, username);
  }
}; 