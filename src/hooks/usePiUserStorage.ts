import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { saveGameData, loadGameData, updateGameDataField } from '@/utils/gameDataStorage';

// --- Types ---
export interface PiUser {
  uid: string;
  username: string;
}

export interface FlappyUserData {
  coins: number;
  highScore: number;
  unlockedSkins: string[];
  inventory: Record<string, number>; // e.g. { 'extra_life': 2 }
  achievements: string[];
}

export interface UsePiUserStorage {
  user: PiUser | null;
  coins: number;
  highScore: number;
  unlockedSkins: string[];
  inventory: Record<string, number>;
  achievements: string[];
  piToken: string | null;
  loading: boolean;
  updateGameData: (data: Partial<FlappyUserData>) => Promise<void>;
  authenticatePiUser: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  logout: () => void;
}

// --- Pi SDK Logic ---
const authenticateWithPi = (): Promise<{ user: PiUser; accessToken: string }> => {
  return new Promise((resolve, reject) => {
    if (!window.Pi) return reject('Pi SDK not found');
    window.Pi.authenticate(
      ['username', 'payments'],
      (auth: any) => {
        const { user, accessToken } = auth;
        resolve({ user: { uid: user.uid, username: user.username }, accessToken });
      },
      (err: any) => reject(err)
    );
  });
};

// --- Supabase Logic ---
const fetchUserFromSupabase = async (uid: string) => {
  const { data, error } = await supabase
    .from('flappy_users')
    .select('*')
    .eq('user_id', uid)
    .single();
  return { data, error };
};

const insertUserToSupabase = async (uid: string, username: string) => {
  return await supabase.from('flappy_users').insert([
    {
      user_id: uid,
      username,
      coins: 0,
      high_score: 0,
      unlocked_skins: [],
      inventory: {},
      achievements: [],
    },
  ]);
};

const updateUserInSupabase = async (uid: string, updates: Partial<FlappyUserData>) => {
  return await supabase
    .from('flappy_users')
    .update(updates)
    .eq('user_id', uid);
};

// --- Main Hook ---
export const usePiUserStorage = (): UsePiUserStorage => {
  const [user, setUser] = useState<PiUser | null>(null);
  const [piToken, setPiToken] = useState<string | null>(null);
  // Use Pi username as key
  const piUsername = localStorage.getItem('piUsername') || undefined;
  const initialData = piUsername ? loadGameData(piUsername) : null;
  const [coins, setCoins] = useState(initialData?.coins || 0);
  const [highScore, setHighScore] = useState(initialData?.highScore || 0);
  const [unlockedSkins, setUnlockedSkins] = useState(initialData?.unlockedSkins || []);
  const [inventory, setInventory] = useState(initialData?.inventory || {});
  const [achievements, setAchievements] = useState(initialData?.achievements || []);
  const [loading, setLoading] = useState(true);

  // Save all user data to localStorage whenever any field changes
  useEffect(() => {
    if (piUsername) {
      saveGameData(piUsername, {
        coins,
        highScore,
        unlockedSkins,
        inventory,
        achievements,
      });
    }
  }, [piUsername, coins, highScore, unlockedSkins, inventory, achievements]);

  // --- Authenticate Pi User ---
  const authenticatePiUser = useCallback(async () => {
    setLoading(true);
    try {
      const { user: piUser, accessToken } = await authenticateWithPi();
      setUser(piUser);
      setPiToken(accessToken);
      localStorage.setItem('piUserId', piUser.uid);
      localStorage.setItem('piUsername', piUser.username);
      document.cookie = `piAuth=${accessToken}; path=/; max-age=86400`;
      // Fetch or create user in Supabase
      let { data } = await fetchUserFromSupabase(piUser.uid);
      if (!data) {
        await insertUserToSupabase(piUser.uid, piUser.username);
        data = (await fetchUserFromSupabase(piUser.uid)).data;
      }
      // Sync state
      setCoins(data.coins || 0);
      setHighScore(data.high_score || 0);
      setUnlockedSkins(data.unlocked_skins || []);
      setInventory(data.inventory || {});
      setAchievements(data.achievements || []);
      // Save to localStorage (per-user)
      saveGameData(piUser.username, {
        coins: data.coins || 0,
        highScore: data.high_score || 0,
        unlockedSkins: data.unlocked_skins || [],
        inventory: data.inventory || {},
        achievements: data.achievements || [],
      });
    } catch (err) {
      console.error('Pi Auth Error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Update Game Data (local + Supabase) ---
  const updateGameData = useCallback(
    async (updates: Partial<FlappyUserData>) => {
      const uid = localStorage.getItem('piUserId');
      const username = localStorage.getItem('piUsername');
      if (!uid || !username) return;
      if (updates.coins !== undefined) setCoins(updates.coins);
      if (updates.highScore !== undefined) setHighScore(updates.highScore);
      if (updates.unlockedSkins !== undefined) setUnlockedSkins(updates.unlockedSkins);
      if (updates.inventory !== undefined) setInventory(updates.inventory);
      if (updates.achievements !== undefined) setAchievements(updates.achievements);
      // Save to localStorage (per-user)
      const prev = loadGameData(username) || {};
      saveGameData(username, { ...prev, ...updates });
      // Update Supabase
      await updateUserInSupabase(uid, updates);
    },
    []
  );

  // --- Sync with Supabase (manual or on login) ---
  const syncWithSupabase = useCallback(async () => {
    const uid = localStorage.getItem('piUserId');
    const username = localStorage.getItem('piUsername');
    if (!uid || !username) return;
    const { data } = await fetchUserFromSupabase(uid);
    if (data) {
      setCoins(data.coins || 0);
      setHighScore(data.high_score || 0);
      setUnlockedSkins(data.unlocked_skins || []);
      setInventory(data.inventory || {});
      setAchievements(data.achievements || []);
      // Save to localStorage (per-user)
      saveGameData(username, {
        coins: data.coins || 0,
        highScore: data.high_score || 0,
        unlockedSkins: data.unlocked_skins || [],
        inventory: data.inventory || {},
        achievements: data.achievements || [],
      });
    }
  }, []);

  // --- Logout ---
  const logout = useCallback(() => {
    setUser(null);
    setPiToken(null);
    setCoins(0);
    setHighScore(0);
    setUnlockedSkins([]);
    setInventory({});
    setAchievements([]);
    // Do not clear localStorage, just clear in-memory state
    document.cookie = 'piAuth=; Max-Age=0; path=/;';
  }, []);

  // --- Token Expiry Handling ---
  useEffect(() => {
    if (!user) authenticatePiUser();
  }, [user, authenticatePiUser]);

  // --- Load from localStorage on mount ---
  useEffect(() => {
    if (piUsername) {
      const data = loadGameData(piUsername) || {};
      if (data.coins !== undefined) setCoins(data.coins);
      if (data.highScore !== undefined) setHighScore(data.highScore);
      if (data.unlockedSkins !== undefined) setUnlockedSkins(data.unlockedSkins);
      if (data.inventory !== undefined) setInventory(data.inventory);
      if (data.achievements !== undefined) setAchievements(data.achievements);
    }
  }, [piUsername]);

  return {
    user,
    coins,
    highScore,
    unlockedSkins,
    inventory,
    achievements,
    piToken,
    loading,
    updateGameData,
    authenticatePiUser,
    syncWithSupabase,
    logout,
  };
}; 