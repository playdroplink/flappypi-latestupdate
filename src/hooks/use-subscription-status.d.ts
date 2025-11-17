// Type declaration for useSubscriptionStatus

declare module '@/hooks/use-subscription-status' {
  export const useSubscriptionStatus: () => {
    isSubscribed: boolean;
    checkSubscription: () => boolean;
  };
}
