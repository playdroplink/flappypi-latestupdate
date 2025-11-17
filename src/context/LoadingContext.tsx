import React, { createContext, useContext, useState, ReactNode } from 'react';
import FloatingCoinLoader from '../components/FloatingCoinLoader';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (duration?: number) => void;
  hideLoading: () => void;
  loadingMessage?: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const showLoading = (duration: number = 2000) => {
    setIsLoading(true);
    setLoadingMessage('Loading...');
    
    // Auto-hide after duration
    setTimeout(() => {
      hideLoading();
    }, duration);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      showLoading,
      hideLoading,
      loadingMessage,
      setLoadingMessage
    }}>
      {children}
      <FloatingCoinLoader 
        isVisible={isLoading}
        onComplete={hideLoading}
        duration={2000}
      />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
