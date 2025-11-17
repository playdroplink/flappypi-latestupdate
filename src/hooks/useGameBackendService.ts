import { useMemo } from 'react';
import { gameBackendService } from '@/services/gameBackendService';

export const useGameBackendService = () => {
  return useMemo(() => ({
    gameBackendService
  }), []);
}; 