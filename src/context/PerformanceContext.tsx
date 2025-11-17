import React, { createContext, useContext, useState } from 'react';

interface PerformanceContextProps {
  lowQualityMode: boolean;
  setLowQualityMode: (val: boolean) => void;
  autoLowQuality: boolean;
  setAutoLowQuality: (val: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
}

const PerformanceContext = createContext<PerformanceContextProps | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lowQualityMode, setLowQualityMode] = useState(false);
  const [autoLowQuality, setAutoLowQuality] = useState(false);
  const [fps, setFps] = useState(60);

  return (
    <PerformanceContext.Provider value={{ lowQualityMode, setLowQualityMode, autoLowQuality, setAutoLowQuality, fps, setFps }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export function usePerformance() {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error('usePerformance must be used within PerformanceProvider');
  return ctx;
} 