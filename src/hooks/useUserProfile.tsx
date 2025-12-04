import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { gameBackendService, UserProfile } from '@/services/gameBackendService';
import { purchaseStateService, PurchaseState } from '@/services/purchaseStateService';
import { subscriptionService } from '@/services/subscriptionService';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  purchaseState: PurchaseState | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPurchaseState: () => Promise<void>;
  initializeProfile: (userId?: string, username?: string) => Promise<void>;
  hasPremium: boolean;
  isAdFree: boolean;
  ownedSkins: string[];
  subscriptionStatus: string;
  hasActiveSubscription: boolean;
  // Local auth methods
  signIn: (userId: string, username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  currentUserId: string | null;
}

const UserProfileContext = createContext<UseUserProfileReturn | undefined>(undefined);

export function useUserProfile(): UseUserProfileReturn {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [purchaseState, setPurchaseState] = useState<PurchaseState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Derive hasActiveSubscription from profile.subscription_status
  const hasActiveSubscription = profile?.subscription_status === 'active';

  // Local sign in
  const signIn = async (userId: string, username: string): Promise<boolean> => {
    setLoading(true);
    try {
      setIsAuthenticated(true);
      setCurrentUserId(userId);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      setIsAuthenticated(false);
      setCurrentUserId(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      setIsAuthenticated(false);
      setCurrentUserId(null);
      // Clear profile and purchase state on sign out
      setProfile(null);
      setPurchaseState(null);
      localStorage.removeItem('flappypi-profile');
      localStorage.removeItem('flappypi-purchase-state');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPurchaseState = async () => {
    if (!currentUserId) return;

    try {
      const state = await purchaseStateService.getPurchaseState(currentUserId);
      setPurchaseState(state);
      
      // Update localStorage for immediate UI feedback
      localStorage.setItem('flappypi-purchase-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error refreshing purchase state:', error);
      // Set a default state if service fails
      setPurchaseState({
        hasPremium: false,
        isAdFree: false,
        ownedSkins: ['default'],
        premiumExpiresAt: null,
        coins: 0,
      });
    }
  };

  const checkSubscriptionExpiry = async () => {
    if (!currentUserId) return;

    try {
      // Check if subscriptions need to be expired
      await subscriptionService.expireSubscriptions();
    } catch (error) {
      console.error('Error checking subscription expiry:', error);
    }
  };

  const initializeProfile = async (userId?: string, username?: string) => {
    const effectiveUserId = userId || currentUserId;
    if (!effectiveUserId) {
      console.log('No authenticated user ID, skipping profile initialization');
      return;
    }

    setLoading(true);
    try {
      // Use the authenticated user's ID and metadata
      const userUsername = username || `Player_${effectiveUserId.slice(0, 8)}`; // Use provided username or generate one
      
      // Try to get existing profile
      let existingProfile: UserProfile | null = null;
      try {
        existingProfile = await gameBackendService.getUserProfile(effectiveUserId);
      } catch (error) {
        console.warn('Failed to get user profile from backend:', error);
      }
      
      if (!existingProfile) {
        // Create new profile
        const newProfile: UserProfile = {
          pi_user_id: effectiveUserId,
          username: userUsername,
          total_coins: 0,
          extra_lives: 0,
          selected_bird_skin: 'default',
          music_enabled: true,
          owned_skins: ['fluppy'],
          highest_score: 0,
          total_games: 0,
          last_played_at: new Date().toISOString(),
          subscription_status: 'none',
          premium_expires_at: null,
          ad_free_permanent: false,
          owned_power_ups: null,
          power_ups_extra_life: 0,
          power_ups_2x_coins: 0,
          power_ups_magnet: 0,
          power_ups_shield: 0,
          power_ups_turbo_start: 0
        };
        
        // For new profiles, we'll need to insert directly since updateUserProfile requires existing record
        // This is a simplified approach - in production you'd have a proper upsert method
        existingProfile = newProfile;
      }
      
      setProfile(existingProfile);
      
      // Store in localStorage for persistence
      if (existingProfile) {
        localStorage.setItem('flappypi-profile', JSON.stringify(existingProfile));
        
        // Load purchase state and check subscription expiry
        try {
          await Promise.all([
            refreshPurchaseState(),
            checkSubscriptionExpiry()
          ]);
        } catch (error) {
          console.warn('Failed to load purchase state or check subscription:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !currentUserId) return;
    
    setLoading(true);
    try {
      let updatedProfile: UserProfile | null = null;
      try {
        updatedProfile = await gameBackendService.updateUserProfile(currentUserId, updates);
      } catch (error) {
        console.warn('Failed to update profile in backend:', error);
        // Create a local update if backend fails
        updatedProfile = { ...profile, ...updates };
      }
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        localStorage.setItem('flappypi-profile', JSON.stringify(updatedProfile));
        
        // Dispatch custom event for real-time UI updates across components
        window.dispatchEvent(new CustomEvent('profile-updated', {
          detail: {
            profile: updatedProfile,
            timestamp: new Date().getTime()
          }
        }));
        
        console.log('📝 Profile updated and event dispatched:', { avatar_url: updatedProfile.avatar_url, selected_bird_skin: updatedProfile.selected_bird_skin });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      let refreshedProfile: UserProfile | null = null;
      try {
        refreshedProfile = await gameBackendService.getUserProfile(currentUserId);
      } catch (error) {
        console.warn('Failed to refresh profile from backend:', error);
        // Use local profile if backend fails
        refreshedProfile = profile;
      }
      
      if (refreshedProfile) {
        setProfile(refreshedProfile);
        localStorage.setItem('flappypi-profile', JSON.stringify(refreshedProfile));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = localStorage.getItem('flappypi-profile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
          setCurrentUserId(parsedProfile.pi_user_id);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading saved profile:', error);
        }
      }
    };
    
    loadProfile();
  }, []);

  // Derived values
  const hasPremium = profile?.subscription_status === 'active' || profile?.ad_free_permanent === true;
  const isAdFree = profile?.ad_free_permanent === true;
  const ownedSkins = profile?.owned_skins || ['fluppy'];
  const subscriptionStatus = profile?.subscription_status || 'none';

  const value: UseUserProfileReturn = {
    profile,
    purchaseState,
    loading,
    updateProfile,
    refreshProfile,
    refreshPurchaseState,
    initializeProfile,
    hasPremium,
    isAdFree,
    ownedSkins,
    subscriptionStatus,
    hasActiveSubscription,
    signIn,
    signOut,
    isAuthenticated,
    currentUserId,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}
