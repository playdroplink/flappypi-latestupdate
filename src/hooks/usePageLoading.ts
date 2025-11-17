import { useLoading } from '../context/LoadingContext';
import { useEffect } from 'react';

export const usePageLoading = (isLoading: boolean, duration: number = 2000) => {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (isLoading) {
      showLoading(duration);
    } else {
      hideLoading();
    }
  }, [isLoading, duration, showLoading, hideLoading]);

  return { showLoading, hideLoading };
};
