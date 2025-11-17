import { useState, useCallback } from 'react';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const newToast = {
      ...props,
      id: Date.now(),
      duration: props.duration || 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, newToast.duration);

    // Log to console for development
    console.log(`🍞 Toast: ${props.title}`, props.description);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
};
