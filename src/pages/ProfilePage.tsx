import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Calendar, Star, AlertTriangle, Upload, Package, ShoppingCart, Trophy, RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/gameTypes';
import { inventoryService } from '@/services/inventoryService';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useAuth } from '../context/AuthContext';
import { getDisplayUsername } from '../utils/usernameUtils';
import { useToast } from '@/hooks/use-toast';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { shopItems } from '@/constants/shopItems';
// Removed UsernameDebug import - no debug components needed

interface ProfilePageProps {
  profile: UserProfile | null;
  onLogout?: () => void;
}

const defaultAvatars = [
  '/birds2/bird_0.gif',
  '/birds2/bird_1.gif',
  '/birds2/bird_2.gif',
  '/birds2/bird_3.gif',
  '/birds2/bird_4.gif',
  '/birds2/bird_5.gif',
  '/birds2/bird_6.gif',
  '/birds2/bird_7.gif',
  '/birds2/bird_8.gif',
  '/birds2/bird_9.gif',
  '/birds2/bird_10.gif',
  '/birds2/bird_11.gif',
  '/flappy pi gif/flappy-2.gif.gif',
];


const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onLogout }) => {
  const { updateProfile } = useUserProfile();
  const { isAuthenticated, isPiAuth, piUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelSub, setPendingCancelSub] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  // Use Pi authentication username with enhanced extraction
  const getEnhancedUsername = () => {
    // First try AuthContext
    if (isAuthenticated && piUser) {
      const extractUsername = (user: any) => {
        if (!user) return null;
        
        if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
          return user.username.trim();
        }
        
        if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
          return user.name.trim();
        }
        
        if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
          return user.displayName.trim();
        }
        
        if (user.first_name || user.last_name) {
          const firstName = user.first_name || '';
          const lastName = user.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          if (fullName && fullName !== 'Player') {
            return fullName;
          }
        }
        
        return null;
      };
      
      const extracted = extractUsername(piUser);
      if (extracted) {
        return extracted;
      }
    }
    
    // Check localStorage for Pi user data
    const storedPiUser = localStorage.getItem('flappypi-pi-user');
    if (storedPiUser) {
      try {
        const parsedUser = JSON.parse(storedPiUser);
        const extractUsername = (user: any) => {
          if (!user) return null;
          
          if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
            return user.username.trim();
          }
          
          if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
            return user.name.trim();
          }
          
          if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
            return user.displayName.trim();
          }
          
          if (user.first_name || user.last_name) {
            const firstName = user.first_name || '';
            const lastName = user.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName && fullName !== 'Player') {
              return fullName;
            }
          }
          
          return null;
        };
        
        const extracted = extractUsername(parsedUser);
        if (extracted) {
          return extracted;
        }
      } catch (error) {
        // Error parsing stored Pi user
      }
    }
    
    // Check Pi SDK localStorage
    const piSDKUser = localStorage.getItem('pi_user');
    if (piSDKUser) {
      try {
        const parsedUser = JSON.parse(piSDKUser);
        const extractUsername = (user: any) => {
          if (!user) return null;
          
          if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
            return user.username.trim();
          }
          
          if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
            return user.name.trim();
          }
          
          if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
            return user.displayName.trim();
          }
          
          if (user.first_name || user.last_name) {
            const firstName = user.first_name || '';
            const lastName = user.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName && fullName !== 'Player') {
              return fullName;
            }
          }
          
          return null;
        };
        
        const extracted = extractUsername(parsedUser);
        if (extracted) {
          return extracted;
        }
      } catch (error) {
        // Error parsing Pi SDK user
      }
    }
    
    // Check window.Pi if available
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        if (typeof window.Pi.currentUser === 'function') {
          const currentUser = window.Pi.currentUser();
          if (currentUser) {
            const extractUsername = (user: any) => {
              if (!user) return null;
              
              if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
                return user.username.trim();
              }
              
              if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
                return user.name.trim();
              }
              
              if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
                return user.displayName.trim();
              }
              
              if (user.first_name || user.last_name) {
                const firstName = user.first_name || '';
                const lastName = user.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                if (fullName && fullName !== 'Player') {
                  return fullName;
                }
              }
              
              return null;
            };
            
            const extracted = extractUsername(currentUser);
            if (extracted) {
              return extracted;
            }
          }
        }
      } catch (error) {
        // Error checking window.Pi
      }
    }
    
    // Fallback to getDisplayUsername
    const fallbackUsername = getDisplayUsername();
    return fallbackUsername;
  };
  
  const [username, setUsername] = useState(() => getEnhancedUsername());
  
  // Function to refresh username
  const refreshUsername = () => {
    const newUsername = getEnhancedUsername();
    setUsername(newUsername);
    // Username refreshed
  };
  
  // Refresh username when authentication state changes
  useEffect(() => {
    refreshUsername();
  }, [isAuthenticated, piUser, isPiAuth]);
  const [tab, setTab] = useState('avatar');
  const [avatar, setAvatar] = useState(() => {
    // Priority 1: User's selected bird character
    if (profile?.selected_bird_skin) {
      return getBirdImageSrc(profile.selected_bird_skin);
    }
    // Priority 2: Profile avatar_url if available
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    // Priority 3: Fallback to localStorage or default
    return localStorage.getItem('flappypi-avatar') || 'flappy-logo.png';
  });
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [ownedSkins, setOwnedSkins] = useState<any[]>([]);
  const [equippedSkinId, setEquippedSkinId] = useState<string | null>(null);
  const [lockedSkins, setLockedSkins] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWalletConsent, setShowWalletConsent] = useState(() => !localStorage.getItem('pi-mainnet-wallet'));
  const [walletInput, setWalletInput] = useState(localStorage.getItem('pi-mainnet-wallet') || '');
  const [showWalletInput, setShowWalletInput] = useState(false);
  const [walletSaved, setWalletSaved] = useState(!!localStorage.getItem('pi-mainnet-wallet'));
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  // Add mock game history data loader
  const [gameHistory, setGameHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch subscriptions
    const status = inventoryService.getSubscriptionStatus();
    setSubscriptions(status.activeSubscriptions || []);
    const stored = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
    setBadges(stored);
    
    // Load owned skins from inventory
    const ownedSkinItems = inventoryService.getInventoryByType('skin');
    setOwnedSkins(ownedSkinItems);
    
    // Find currently equipped skin
    const equipped = ownedSkinItems.find(skin => skin.equipped);
    setEquippedSkinId(equipped?.id || null);
    
    // Get locked skins (available in shop but not owned)
    const ownedSkinIds = ownedSkinItems.map(skin => skin.id);
    const availableSkins = shopItems.filter(item => 
      item.type === 'skin' && 
      !ownedSkinIds.includes(item.id) && 
      !item.notForSale
    );
    setLockedSkins(availableSkins);
    
    // Load real game history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('flappypi-game-history') || '[]');
    if (storedHistory.length > 0) {
      // Convert to display format
      const formattedHistory = storedHistory.map((entry: any) => ({
        date: new Date(entry.timestamp).toISOString().split('T')[0],
        mode: entry.gameMode.charAt(0).toUpperCase() + entry.gameMode.slice(1),
        score: entry.score,
        coins: entry.coinsEarned,
        best: entry.isNewHighScore ? entry.score : entry.score, // This could be improved with actual best score tracking
        duration: entry.duration,
        birdSkin: entry.birdSkin,
        pipesPassed: entry.gameStats?.pipesPassed || 0,
        powerUpsUsed: entry.powerUpsUsed || []
      }));
      setGameHistory(formattedHistory);
    } else {
      // No game history available yet
      setGameHistory([]);
    }
  }, []);

  // Update avatar when profile changes
  useEffect(() => {
    // Priority 1: User's selected bird character
    if (profile?.selected_bird_skin) {
      setAvatar(getBirdImageSrc(profile.selected_bird_skin));
    }
    // Priority 2: Profile avatar_url if available
    else if (profile?.avatar_url) {
      setAvatar(profile.avatar_url);
    }
  }, [profile?.selected_bird_skin, profile?.avatar_url]);

  // Listen for inventory updates to refresh skins
  useEffect(() => {
    const handleInventoryUpdate = () => {
      // Reload owned skins
      const ownedSkinItems = inventoryService.getInventoryByType('skin');
      setOwnedSkins(ownedSkinItems);
      
      // Update equipped skin
      const equipped = ownedSkinItems.find(skin => skin.equipped);
      setEquippedSkinId(equipped?.id || null);
      
      // Update locked skins
      const ownedSkinIds = ownedSkinItems.map(skin => skin.id);
      const availableSkins = shopItems.filter(item => 
        item.type === 'skin' && 
        !ownedSkinIds.includes(item.id) && 
        !item.notForSale
      );
      setLockedSkins(availableSkins);
    };

    // Listen for inventory updates
    window.addEventListener('inventory-updated', handleInventoryUpdate);
    
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleReset = () => {
    // Comprehensive reset - clear ALL user data and restart as fresh account
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      // Also clear sessionStorage if any data is stored there
      sessionStorage.clear();
      
      // Clear any IndexedDB data if used
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }
      
      // Clear any cookies related to the app
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Force reload to restart as completely fresh account
      window.location.href = window.location.origin;
    } catch (error) {
      // Error during reset
      // Fallback to simple reload if there's an error
      window.location.reload();
    }
  };

  const handleCancelClick = (sub) => {
    setPendingCancelSub(sub);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (pendingCancelSub) {
      inventoryService.removeSubscription(pendingCancelSub.id);
      // Refresh subscriptions
      const status = inventoryService.getSubscriptionStatus();
      setSubscriptions(status.activeSubscriptions || []);
      setShowCancelModal(false);
      setPendingCancelSub(null);
    }
  };

  const cancelCancel = () => {
    setShowCancelModal(false);
    setPendingCancelSub(null);
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle skin selection and equipping
  const handleSkinSelect = (skinId: string) => {
    try {
      // Equip the selected skin
      inventoryService.equipItem(skinId, 'skin');
      
      // Update local state
      setEquippedSkinId(skinId);
      
      // Find the skin to get its image
      const selectedSkin = ownedSkins.find(skin => skin.id === skinId);
      if (selectedSkin) {
        setAvatar(selectedSkin.image || getBirdImageSrc(skinId));
        setCustomAvatar(null);
        
        // Update profile with selected skin
        if (updateProfile) {
          updateProfile({ selected_bird_skin: skinId });
        }
        
        toast({
          title: "Skin Equipped!",
          description: `${selectedSkin.name} is now your active bird character.`,
        });
      }
    } catch (error) {
      console.error('Error equipping skin:', error);
      toast({
        title: "Error",
        description: "Failed to equip skin. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save avatar (custom or selected)
  const handleSaveAvatar = async () => {
    let avatarUrl = '';
    
    if (customAvatar) {
      // Save custom avatar to localStorage for immediate use
      localStorage.setItem('flappypi-avatar', customAvatar);
      setAvatar(customAvatar);
      avatarUrl = customAvatar;
    } else {
      // Save selected avatar to localStorage
      localStorage.setItem('flappypi-avatar', avatar);
      avatarUrl = avatar;
    }

    // Update user profile with avatar URL
    if (profile && updateProfile) {
      try {
        await updateProfile({ avatar_url: avatarUrl });
        toast({
          title: "Avatar Saved! 🎉",
          description: "Your avatar has been saved to your profile and will now appear on the homescreen.",
          duration: 4000,
        });
      } catch (error) {
        // Failed to save avatar to profile
        toast({
          title: "Partial Save",
          description: "Avatar saved locally, but failed to sync with profile.",
          variant: "destructive",
          duration: 4000,
        });
      }
    } else {
      toast({
        title: "Avatar Saved Locally! 📱",
        description: "Your avatar has been saved locally.",
        duration: 3000,
      });
    }
  };

  const handleSaveWallet = () => {
    localStorage.setItem('pi-mainnet-wallet', walletInput);
    setWalletSaved(true);
    setShowWalletConsent(false);
    setShowWalletInput(false);
    setShowWalletModal(false);
    toast({
      title: "Wallet Address Saved! 💰",
      description: "Your wallet address has been saved successfully.",
      duration: 3000,
    });
  };

  const handleDeclineWallet = () => {
    setShowWalletConsent(false);
    setShowWalletInput(false);
    setShowWalletModal(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200 p-2 sm:p-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
        <div className="w-full flex flex-col items-center justify-start p-2 sm:p-6 relative z-10 bg-white/95 rounded-3xl shadow-2xl border border-blue-200 overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
          
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="absolute top-4 sm:top-6 left-4 sm:left-6 text-blue-700 hover:bg-blue-100 rounded-full p-2 z-20"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Floating Icons */}
            <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s' }}>
              <User className="h-8 w-8 text-blue-300" />
            </div>
            <div className="absolute top-32 right-16 animate-bounce" style={{ animationDelay: '1s' }}>
              <Settings className="h-6 w-6 text-purple-300" />
            </div>
            <div className="absolute bottom-32 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
              <Calendar className="h-7 w-7 text-green-300" />
            </div>
            <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Star className="h-6 w-6 text-yellow-300" />
            </div>
            
            {/* Animated clouds */}
            <div className="absolute top-0 left-0 w-full h-full animate-clouds pointer-events-none z-0">
              <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="200" cy="100" rx="120" ry="40" fill="#fff" opacity="0.7">
                  <animate attributeName="cx" values="200;1600" dur="30s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="800" cy="180" rx="180" ry="60" fill="#fff" opacity="0.5">
                  <animate attributeName="cx" values="800;-200" dur="40s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="1200" cy="80" rx="100" ry="30" fill="#fff" opacity="0.6">
                  <animate attributeName="cx" values="1200;0" dur="35s" repeatCount="indefinite" />
                </ellipse>
              </svg>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full flex flex-col items-center justify-start text-center z-10 relative pt-16 sm:pt-20">
            
            {/* Profile Icon */}
            <div className="relative mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <img src={avatar} alt="Avatar" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce">
                {customAvatar ? 'Custom' : profile?.avatar_url ? 'Profile' : 'Default'}
              </div>
            </div>

            {/* Mobile-Friendly Icon Row */}
            <div className="flex flex-row justify-center gap-2 sm:gap-4 mb-6 w-full max-w-sm px-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/inventory')} 
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 min-w-[70px] sm:min-w-[80px]"
                title="Inventory"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-1">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-xs text-blue-700 font-medium">Inventory</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/shop')} 
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 min-w-[70px] sm:min-w-[80px]"
                title="Shop"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-1">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-xs text-purple-700 font-medium">Shop</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/leaderboard')} 
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 min-w-[70px] sm:min-w-[80px]"
                title="Leaderboard"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center mb-1">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-xs text-green-700 font-medium">Leaderboard</span>
              </Button>
            </div>

            {/* Centered Settings Button */}
            <div className="flex justify-center mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTab('settings')} 
                className="flex flex-col items-center p-3 sm:p-4 rounded-full border-2 border-blue-400 bg-white shadow-lg hover:bg-blue-50 min-w-[50px] min-h-[50px] sm:min-w-[60px] sm:min-h-[60px]"
                title="Settings"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-1" />
                <span className="text-xs text-blue-600 font-medium">Settings</span>
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Profile Page
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-md px-4">
              We're working hard to bring you an amazing profile experience!
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full max-w-lg px-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-bold text-blue-800 mb-1 text-sm sm:text-base">Custom Avatars</h3>
                <p className="text-xs sm:text-sm text-blue-600">Choose from our collection of unique bird skins</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 border border-purple-200 cursor-pointer hover:bg-purple-200 transition" onClick={() => setTab('settings')}>
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-bold text-purple-800 mb-1 text-sm sm:text-base">Profile Settings</h3>
                <p className="text-xs sm:text-sm text-purple-600">Customize your bio and privacy preferences</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border border-green-200">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-green-800 mb-1 text-sm sm:text-base">Game History</h3>
                <p className="text-xs sm:text-sm text-green-600">Track your achievements and statistics</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 sm:p-4 border border-yellow-200">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-bold text-yellow-800 mb-1 text-sm sm:text-base">Achievements</h3>
                <p className="text-xs sm:text-sm text-yellow-600">Unlock badges and special rewards</p>
              </div>
            </div>

            {/* Progress Bar removed */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-4">
              <Button
                onClick={() => navigate('/home')}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Back to Home
              </Button>
              
              <Button
                onClick={() => navigate('/shop')}
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Visit Shop
              </Button>
            </div>

            {/* Reset Game Data Button */}
            <div className="w-full max-w-md mt-6 sm:mt-8 px-4">
              <Button
                onClick={() => setShowResetModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg mt-2"
              >
                Reset Game Data
              </Button>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-all duration-300 p-4">
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-200 p-6 sm:p-10 max-w-sm w-full text-center relative animate-fadeIn">
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-red-100 rounded-full p-4 mb-2 shadow">
                      <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-red-500" />
                    </div>
                    <h3 className="font-extrabold text-xl sm:text-2xl mb-2 text-red-700 tracking-tight">Reset Game Data?</h3>
                  </div>
                  <p className="text-gray-700 mb-6 text-sm sm:text-base font-semibold leading-relaxed">
                    <span className="text-red-600 font-bold">Warning:</span> This will completely reset your account to a <span className="text-red-600 font-bold">BRAND NEW</span> state.<br/><br/>
                    <span className="text-red-600 font-bold">Will be erased:</span><br/>
                    • All coins and wallet balance<br/>
                    • All skins and inventory items<br/>
                    • All power-ups and boosters<br/>
                    • All subscriptions and premium features<br/>
                    • Game progress and statistics<br/>
                    • Daily rewards and streaks<br/>
                    • Settings and preferences<br/><br/>
                    <span className="font-bold text-gray-900">This action cannot be undone.</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                    <Button onClick={handleReset} className="flex-1 bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-extrabold py-3 px-6 rounded-xl shadow-lg text-base sm:text-lg border-2 border-red-400 transition-all duration-200">
                      Yes, Reset Everything
                    </Button>
                    <Button onClick={() => setShowResetModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl border-2 border-gray-300 text-base sm:text-lg transition-all duration-200">
                      No, Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Launch banner removed */}

            {/* Pi Wallet Connect Consent Card */}
            {showWalletConsent && !walletSaved && (
              <div className="w-full max-w-md mb-6 sm:mb-8 mt-4 bg-gradient-to-r from-yellow-50 to-purple-50 border-2 border-yellow-200 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center z-20 mx-4">
                <img src="/pi-logo.png" alt="Pi Network" className="w-8 h-8 sm:w-10 sm:h-10 mb-2" onError={e => {e.currentTarget.style.display='none'}} />
                <h2 className="text-base sm:text-lg font-bold text-purple-700 mb-2">Connect your Pi Wallet</h2>
                <p className="text-xs text-purple-800 mb-4">Flappy Pi needs your Pi mainnet wallet address to send you Pi rewards if you are a top player in the leaderboards.</p>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button className="flex-1 bg-white hover:bg-gray-100 text-white font-bold px-4 sm:px-6 py-2 rounded-lg shadow border border-gray-400" onClick={() => setShowWalletModal(true)}>
                    Connect Wallet
                  </Button>
                  <Button className="flex-1 bg-white hover:bg-gray-200 text-white font-bold px-4 sm:px-6 py-2 rounded-lg shadow border border-gray-400" onClick={handleDeclineWallet}>
                    Decline
                  </Button>
                </div>
                {/* Modal for Pi-style consent confirmation */}
                <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
                  <DialogContent className="max-w-md w-full bg-white rounded-xl p-4 sm:p-6 text-center">
                    <DialogHeader>
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-purple-700 mb-2">Share your Pi Wallet Address?</DialogTitle>
                    </DialogHeader>
                    <p className="mb-4 text-gray-700 text-sm">Flappy Pi is requesting your Pi mainnet wallet address to send you Pi rewards if you are a top player in the leaderboards. This address will only be used for reward payouts.</p>
                    {!showWalletInput ? (
                      <div className="flex flex-col gap-2 w-full">
                        <Button className="w-full bg-[#8a4cff] hover:bg-[#6c2ed9] text-white font-bold py-3 px-6 rounded-lg shadow-none" onClick={() => setShowWalletInput(true)}>
                          Allow
                        </Button>
                        <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg shadow-none" onClick={handleDeclineWallet}>
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center mt-2">
                        <input
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-base mb-2 bg-white text-purple-900"
                          placeholder="Paste your Pi wallet address..."
                          value={walletInput}
                          onChange={e => setWalletInput(e.target.value)}
                          maxLength={64}
                          spellCheck={false}
                          autoComplete="off"
                        />
                        <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-none mt-2" onClick={handleSaveWallet}>
                          Save Wallet Address
                        </Button>
                        <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-none mt-2" onClick={handleDeclineWallet}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {/* Show wallet if already saved */}
            {walletSaved && !showWalletConsent && (
              <div className="w-full max-w-md mb-6 sm:mb-8 mt-4 bg-gradient-to-r from-yellow-50 to-purple-50 border-2 border-yellow-200 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center z-10 mx-4">
                <img src="/pi-logo.png" alt="Pi Network" className="w-6 h-6 sm:w-8 sm:h-8 mb-2" onError={e => {e.currentTarget.style.display='none'}} />
                <span className="text-xs sm:text-sm text-purple-900 font-semibold mb-1">Your Pi Mainnet Wallet Address</span>
                <span className="block text-xs text-purple-700 break-all mb-2">{walletInput}</span>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 sm:px-6 py-2 rounded-lg shadow" onClick={() => { setShowWalletConsent(true); setShowWalletInput(true); }}>
                  Update Wallet Address
                </Button>
              </div>
            )}

            {/* Subscriptions Section */}
            <div className="w-full max-w-md mt-6 sm:mt-8 mb-6 sm:mb-8 px-4">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-4">Subscriptions</h2>
              {subscriptions.length === 0 ? (
                <div className="text-gray-500">No active subscriptions.</div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex flex-col items-center">
                    <div className="font-bold text-blue-800 text-base sm:text-lg mb-1">{sub.name}</div>
                    <div className="text-sm text-gray-700 mb-2">Expires: {format(new Date(sub.expiresAt), 'PPP')}</div>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
                      onClick={() => handleCancelClick(sub)}
                    >
                      Cancel Plan
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-xs w-full text-center">
                  <div className="text-3xl mb-2">⚠️</div>
                  <h3 className="font-bold text-lg mb-2">Cancel Subscription?</h3>
                  <p className="text-gray-600 mb-4 text-sm">Are you sure you want to cancel <b>{pendingCancelSub?.name}</b>? <b>No refund</b> will be given.</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={confirmCancel} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Yes</Button>
                    <Button onClick={cancelCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">No</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Power-Ups Inventory Section */}

            {/* Real Profile Management UI */}
            <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">Profile</h1>
              <div className="mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl mb-2">
                  <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              {/* Pi Authentication - Profile is managed by Pi Network */}
              <div className="mb-4 flex items-center gap-3">
                <div>
                  <strong>Username:</strong> {username}
                </div>
                <Button
                  onClick={refreshUsername}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
              
              {/* Removed debug information - no debug UI needed */}
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Pi Network Authenticated:</strong> Your profile is managed by Pi Network. 
                  Username and authentication are handled automatically.
                </p>
              </div>
              {onLogout && (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded font-bold"
                  onClick={onLogout}
                >
                  Log Out
                </button>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="w-full mt-6 sm:mt-8 px-4">
              <TabsList className="flex justify-center gap-2 mb-6">
                <TabsTrigger value="avatar" className="text-xs sm:text-sm"><User className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />Avatar</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm"><Calendar className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />Game History</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm"><Settings className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />Settings</TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs sm:text-sm"><Star className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />Achievements</TabsTrigger>
              </TabsList>

              {/* Custom Avatar Section */}
              <TabsContent value="avatar">
                <div className="flex flex-col items-center gap-6">
                  
                  {/* Current Bird Character Section */}
                  {equippedSkinId && (
                    <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-blue-800 mb-3 text-center">Your Current Bird Character</h3>
                      <div className="flex items-center justify-center gap-4">
                        {(() => {
                          const equippedSkin = ownedSkins.find(skin => skin.id === equippedSkinId);
                          return (
                            <>
                              <img 
                                src={equippedSkin?.image || getBirdImageSrc(equippedSkinId)} 
                                alt="Current Bird Character" 
                                className="w-16 h-16 rounded-full border-2 border-blue-400 shadow-lg"
                              />
                              <div className="text-center">
                                <p className="font-semibold text-blue-800 capitalize">
                                  {equippedSkin?.name || equippedSkinId.replace('_', ' ').replace('-', ' ')}
                                </p>
                                <p className="text-sm text-blue-600">Active in game</p>
                                {equippedSkin?.rarity && (
                                  <p className="text-xs text-purple-600 font-medium">{equippedSkin.rarity} Rarity</p>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Bird Characters Section - Based on Owned Skins */}
                  <div className="w-full">
                    <h3 className="font-bold text-blue-800 mb-3 text-center">Your Bird Characters</h3>
                    {ownedSkins.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-600 mb-2">No bird characters yet!</p>
                          <p className="text-sm text-gray-500">Visit the shop to unlock new bird skins</p>
                        </div>
                        <Button
                          onClick={() => navigate('/shop')}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Visit Shop
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                        {ownedSkins.map((skin) => {
                          const isEquipped = skin.id === equippedSkinId;
                          return (
                            <button
                              key={skin.id}
                              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 transition-all duration-200 ${
                                isEquipped 
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                  : 'border-gray-300 hover:border-blue-300 hover:scale-105'
                              } shadow bg-white p-1`}
                              onClick={() => handleSkinSelect(skin.id)}
                              title={`${skin.name} ${isEquipped ? '(Equipped)' : ''}`}
                            >
                              <img 
                                src={skin.image || getBirdImageSrc(skin.id)} 
                                alt={skin.name} 
                                className="w-full h-full rounded object-cover" 
                              />
                              {isEquipped && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                  <Star className="w-3 h-3 text-white fill-white" />
                                </div>
                              )}
                              {skin.rarity && (
                                <div className={`absolute bottom-0 left-0 right-0 text-xs font-bold text-center rounded-b ${
                                  skin.rarity === 'Legendary' ? 'bg-yellow-500 text-yellow-900' :
                                  skin.rarity === 'Epic' ? 'bg-purple-500 text-white' :
                                  skin.rarity === 'Rare' ? 'bg-blue-500 text-white' :
                                  'bg-gray-400 text-gray-800'
                                } py-0.5`}>
                                  {skin.rarity}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Locked Skins Section */}
                  {lockedSkins.length > 0 && (
                    <div className="w-full">
                      <h3 className="font-bold text-gray-700 mb-3 text-center">Available in Shop</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                        {lockedSkins.slice(0, 9).map((skin) => (
                          <button
                            key={skin.id}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-300 hover:border-purple-300 transition-all duration-200 shadow bg-gray-100 p-1 opacity-75 hover:opacity-90"
                            onClick={() => navigate('/shop')}
                            title={`${skin.name} - ${skin.piPrice > 0 ? `${skin.piPrice} π` : `${skin.flappyCoinPrice} coins`}`}
                          >
                            <img 
                              src={skin.image} 
                              alt={skin.name} 
                              className="w-full h-full rounded object-cover grayscale" 
                            />
                            <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                            <div className={`absolute bottom-0 left-0 right-0 text-xs font-bold text-center rounded-b ${
                              skin.rarity === 'Legendary' ? 'bg-yellow-500/80 text-yellow-900' :
                              skin.rarity === 'Epic' ? 'bg-purple-500/80 text-white' :
                              skin.rarity === 'Rare' ? 'bg-blue-500/80 text-white' :
                              'bg-gray-400/80 text-gray-800'
                            } py-0.5`}>
                              {skin.piPrice > 0 ? `${skin.piPrice}π` : `${skin.flappyCoinPrice}c`}
                            </div>
                          </button>
                        ))}
                      </div>
                      {lockedSkins.length > 9 && (
                        <div className="text-center">
                          <Button
                            onClick={() => navigate('/shop')}
                            variant="outline"
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                          >
                            View All {lockedSkins.length} Skins in Shop
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="relative">
                    <img
                      src={customAvatar || avatar}
                      alt="Avatar Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-400 shadow-lg object-cover bg-white"
                    />
                    <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      Preview
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 bg-white border border-blue-300"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload custom avatar"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="w-full">
                    <h3 className="font-bold text-blue-800 mb-3 text-center">Other Avatars</h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {defaultAvatars.filter(img => !img.startsWith('/birds/')).map((img) => (
                        <button
                          key={img}
                          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 ${avatar === img && !customAvatar ? 'border-blue-500' : 'border-gray-300'} shadow bg-white p-1 transition-all hover:scale-105`}
                          onClick={() => { setAvatar(img); setCustomAvatar(null); }}
                        >
                          <img src={img} alt="Avatar option" className="w-full h-full rounded-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="mt-4" onClick={handleSaveAvatar}>
                    Save Avatar
                  </Button>
                </div>
              </TabsContent>

              {/* Game History Section */}
              <TabsContent value="history">
                <div className="flex flex-col items-center gap-6 py-10 w-full">
                  <h2 className="text-2xl font-bold text-green-700 mb-4">Game History</h2>
                  {gameHistory.length === 0 ? (
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">No games played yet.</div>
                      <div className="text-sm text-gray-500">
                        Start playing to see your game history here!
                      </div>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto">
                      <table className="min-w-full text-sm border border-gray-200 rounded-xl bg-white">
                        <thead>
                          <tr className="bg-green-50">
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Mode</th>
                            <th className="px-3 py-2">Score</th>
                            <th className="px-3 py-2">Coins</th>
                            <th className="px-3 py-2">Duration</th>
                            <th className="px-3 py-2">Bird Skin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameHistory.map((g, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                              <td className="px-3 py-2">{g.date}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  g.mode === 'Classic' ? 'bg-blue-100 text-blue-800' :
                                  g.mode === 'Endless' ? 'bg-green-100 text-green-800' :
                                  g.mode === 'Challenge' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {g.mode}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-semibold">{g.score}</td>
                              <td className="px-3 py-2 text-yellow-600">{g.coins}</td>
                              <td className="px-3 py-2">{g.duration ? `${Math.floor(g.duration / 60)}:${(g.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</td>
                              <td className="px-3 py-2">
                                <img 
                                  src={`/birds/${g.birdSkin || 'bird_0'}.png`} 
                                  alt={g.birdSkin || 'bird_0'} 
                                  className="w-6 h-6 rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.src = '/birds/bird_0.png';
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-4 text-sm text-gray-600 text-center">
                        Showing {gameHistory.length} game{gameHistory.length !== 1 ? 's' : ''} played
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Profile Settings Section */}
              <TabsContent value="settings">
                <div className="flex flex-col items-center gap-6 py-10 w-full">
                  <h2 className="text-2xl font-bold text-purple-700 mb-4">Profile Settings</h2>
                  {/* Pi Authentication Notice */}
                  <div className="w-full max-w-sm mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <p className="text-sm text-blue-800 text-center">
                      <strong>Pi Network Authenticated:</strong> Your username and authentication are managed by Pi Network.
                    </p>
                  </div>

                  <form className="flex flex-col gap-4 w-full max-w-sm mx-auto" onSubmit={e => { 
                    e.preventDefault(); 
                    toast({
                      title: "Settings Saved! ⚙️",
                      description: "Your settings have been saved successfully.",
                      duration: 3000,
                    });
                  }}>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Show Achievements</span>
                    </label>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Save Settings</button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              {/* Achievements Section */}
              <TabsContent value="achievements">
                <div className="flex flex-col items-center gap-6 py-10">
                  <h2 className="text-2xl font-bold text-yellow-700 mb-4">Achievements</h2>
                  <div className="flex flex-wrap gap-6 justify-center items-center">
                    {badges.includes('social-challenge-badge') && (
                      <div className="flex flex-col items-center">
                        <img src="/social-challenge-badge.png" alt="Social Challenge Badge" className="w-20 h-20 mb-2 drop-shadow-lg animate-bounce-trophy animate-trophy-glow" />
                        <div className="text-sm font-bold text-yellow-700">Social Challenge Badge</div>
                        <div className="text-xs text-gray-500 text-center max-w-xs mb-2">Awarded for completing the Flappy Pi Social Challenge and supporting the community!</div>
                        <button
                          className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition text-xs"
                          onClick={() => {
                            // Navigate to Flappy Pi community page
                            navigate('/community');
                          }}
                        >
                          Share on Social Media
                        </button>
                      </div>
                    )}
                    {/* Add more badges here as needed */}
                  </div>
                  {badges.length === 0 && <div className="text-gray-400 mt-4">No achievements yet. Complete challenges to earn badges!</div>}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;