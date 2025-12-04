import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Settings, RefreshCw, Camera, Upload } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import { getDisplayUsername } from '@/utils/usernameUtils';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useUserProfile();
  const { isAuthenticated, isPiAuth, piUser } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  // Function to get the current profile image based on user's selected character
  const getCurrentProfileImage = () => {
    // Priority 1: User's selected bird character
    if (profile?.selected_bird_skin) {
      return getBirdImageSrc(profile.selected_bird_skin);
    }
    // Priority 2: Profile avatar_url if available
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    // Priority 3: Fallback to default
    return 'flappy-logo.png';
  };

  // Function to get the current username
  const getCurrentUsername = () => {
    // Try AuthContext first
    if (piUser?.username && piUser.username !== 'Pi User') {
      return piUser.username;
    }
    
    // Try localStorage for Pi user data
    const storedPiUser = localStorage.getItem('flappypi-pi-user');
    if (storedPiUser) {
      try {
        const parsedUser = JSON.parse(storedPiUser);
        if (parsedUser.username && parsedUser.username !== 'Player' && parsedUser.username.trim() !== '') {
          return parsedUser.username.trim();
        }
      } catch (error) {
        // Error parsing stored Pi user
      }
    }
    
    // Try Pi SDK localStorage
    const piSDKUser = localStorage.getItem('pi_user');
    if (piSDKUser) {
      try {
        const parsedUser = JSON.parse(piSDKUser);
        if (parsedUser.username && parsedUser.username !== 'Player' && parsedUser.username.trim() !== '') {
          return parsedUser.username.trim();
        }
      } catch (error) {
        // Error parsing Pi SDK user
      }
    }
    
    // Try window.Pi if available
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        const currentUser = window.Pi.currentUser();
        if (currentUser?.username && currentUser.username !== 'Player' && currentUser.username.trim() !== '') {
          return currentUser.username.trim();
        }
      } catch (error) {
        // Error checking window.Pi
      }
    }
    
    // Fallback to getDisplayUsername
    return getDisplayUsername();
  };

  // Update profile image and username when profile or authentication changes
  useEffect(() => {
    const newImage = getCurrentProfileImage();
    const newUsername = getCurrentUsername();
    
    console.log('📝 ProfileImageModal updating display:', {
      profileImage: newImage,
      username: newUsername,
      selectedBirdSkin: profile?.selected_bird_skin,
      avatarUrl: profile?.avatar_url,
      isAuthenticated
    });
    
    setProfileImage(newImage);
    setUsername(newUsername);
  }, [profile?.selected_bird_skin, profile?.avatar_url, profile, isAuthenticated, piUser]);

  // Listen for profile updates from other components (e.g., ProfilePage)
  useEffect(() => {
    if (!isOpen) return; // Only listen when modal is open
    
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 ProfileImageModal received profile-updated event:', customEvent.detail);
      
      // Trigger refresh of profile image and username
      const newImage = getCurrentProfileImage();
      const newUsername = getCurrentUsername();
      
      console.log('✅ ProfileImageModal updating from event:', {
        newImage,
        newUsername,
        eventDetail: customEvent.detail
      });
      
      setProfileImage(newImage);
      setUsername(newUsername);
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [isOpen, profile?.selected_bird_skin, profile?.avatar_url, profile]);

  // Refresh function to manually update profile data
  const refreshProfile = () => {
    const newImage = getCurrentProfileImage();
    const newUsername = getCurrentUsername();
    
    console.log('🔄 Manual refresh triggered:', { newImage, newUsername });
    
    setProfileImage(newImage);
    setUsername(newUsername);
  };

  // Load profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('📂 ProfileImageModal opened - loading profile data');
      refreshProfile();
      
      // Also load from localStorage to ensure we have latest saved profile
      const savedProfile = localStorage.getItem('flappypi-profile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          console.log('💾 Loaded profile from localStorage:', {
            username: parsedProfile.username,
            selected_bird_skin: parsedProfile.selected_bird_skin,
            avatar_url: parsedProfile.avatar_url
          });
        } catch (error) {
          console.warn('⚠️ Error parsing saved profile:', error);
        }
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-blue-800">
            Your Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          {/* Profile Image Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-blue-400 shadow-lg overflow-hidden bg-white">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'flappy-logo.png';
                }}
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              Live
            </div>
          </div>

          {/* Username Display */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-1">{username || 'User Profile'}</h3>
            <p className="text-sm text-blue-600">
              {profile?.selected_bird_skin 
                ? `Character: ${profile.selected_bird_skin.replace('_', ' ').replace('-', ' ')}`
                : 'Default Character'
              }
            </p>
            {/* Debug info - show if data is being read */}
            <div className="text-xs text-gray-400 mt-2">
              Profile Data: {profile ? '✓' : '✗'} | User: {profile?.username || 'N/A'}
            </div>
          </div>

          {/* Character Info */}
          {profile?.selected_bird_skin && (
            <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2 text-center">Current Character</h4>
              <div className="flex items-center justify-center gap-3">
                <img 
                  src={getBirdImageSrc(profile.selected_bird_skin)} 
                  alt="Current Character" 
                  className="w-12 h-12 rounded-full border-2 border-blue-400"
                />
                <div className="text-center">
                  <p className="font-semibold text-blue-800 capitalize">
                    {profile.selected_bird_skin.replace('_', ' ').replace('-', ' ')}
                  </p>
                  <p className="text-sm text-blue-600">Active in game</p>
                </div>
              </div>
            </div>
          )}

          {/* Authentication Status */}
          <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800 font-medium">
                {isPiAuth ? 'Pi Network Authenticated' : 'Authenticated'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={refreshProfile}
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center">
            Your profile image automatically updates when you change your character in the game.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageModal;
