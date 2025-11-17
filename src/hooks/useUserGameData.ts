import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserGameData {
  coins: number;
  skins: string[];
  powerups: string[];
  inventory: string[];
  // add more fields as needed
}

export function useUserGameData(userId: string | null) {
  const [gameData, setGameData] = useState<UserGameData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch on login
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('user_game_data')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') { // not found is ok
          console.error(error);
        }
        setGameData(data || { coins: 0, skins: [], powerups: [], inventory: [] });
        setLoading(false);
      });
  }, [userId]);

  // Save/update
  const saveGameData = useCallback(
    async (updates: Partial<UserGameData>) => {
      if (!userId) return;
      const newGameData = { ...gameData, ...updates };
      setGameData(newGameData as UserGameData);
      const { error } = await supabase
        .from('user_game_data')
        .upsert({ user_id: userId, ...newGameData });
      if (error) console.error(error);
    },
    [userId, gameData]
  );

  return { gameData, setGameData: saveGameData, loading };
} 