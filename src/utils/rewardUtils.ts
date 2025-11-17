// Utility functions for managing user rewards

export const getReviveCount = (username: string): number => {
  const key = `flappypi-revives-${username}`;
  const saved = localStorage.getItem(key);
  return saved ? Number(saved) : 0;
};

export const saveReviveCount = (username: string, count: number): void => {
  const key = `flappypi-revives-${username}`;
  localStorage.setItem(key, String(count));
};

export const getExtraLifeCount = (username: string): number => {
  const key = `flappypi-extra-lives-${username}`;
  const saved = localStorage.getItem(key);
  return saved ? Number(saved) : 0;
};

export const saveExtraLifeCount = (username: string, count: number): void => {
  const key = `flappypi-extra-lives-${username}`;
  localStorage.setItem(key, String(count));
};

export const getRouletteSpinCount = (username: string): number => {
  const key = `flappypi-roulette-spins-${username}`;
  const saved = localStorage.getItem(key);
  return saved ? Number(saved) : 0;
};

export const saveRouletteSpinCount = (username: string, count: number): void => {
  const key = `flappypi-roulette-spins-${username}`;
  localStorage.setItem(key, String(count));
};

export const useRevive = (username: string): boolean => {
  const currentRevives = getReviveCount(username);
  if (currentRevives > 0) {
    saveReviveCount(username, currentRevives - 1);
    return true;
  }
  return false;
};

export const useExtraLife = (username: string): boolean => {
  const currentLives = getExtraLifeCount(username);
  if (currentLives > 0) {
    saveExtraLifeCount(username, currentLives - 1);
    return true;
  }
  return false;
};

export const useRouletteSpin = (username: string): boolean => {
  const currentSpins = getRouletteSpinCount(username);
  if (currentSpins > 0) {
    saveRouletteSpinCount(username, currentSpins - 1);
    return true;
  }
  return false;
};

export const getUserRewardCounts = (username: string) => {
  const { loadWalletBalance } = require('@/utils/walletUtils');
  return {
    revives: getReviveCount(username),
    extraLives: getExtraLifeCount(username),
    rouletteSpins: getRouletteSpinCount(username),
    coins: loadWalletBalance(username)
  };
};

export const addRevive = (username: string, amount: number = 1): void => {
  const current = getReviveCount(username);
  saveReviveCount(username, current + amount);
};

export const addExtraLife = (username: string, amount: number = 1): void => {
  const current = getExtraLifeCount(username);
  saveExtraLifeCount(username, current + amount);
};

export const addRouletteSpin = (username: string, amount: number = 1): void => {
  const current = getRouletteSpinCount(username);
  saveRouletteSpinCount(username, current + amount);
};
