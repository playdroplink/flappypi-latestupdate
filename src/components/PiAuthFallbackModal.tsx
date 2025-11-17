import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Download, User, Camera, Upload, X, Image, Globe, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userPhotoService } from '../services/userPhotoService';
import { EnhancedPiBrowserDetector } from '../utils/enhancedPiBrowserDetection';

interface PiAuthFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
  error?: string;
}

export const PiAuthFallbackModal: React.FC<PiAuthFallbackModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  error
}) => {
  const [authMethod, setAuthMethod] = useState<'download' | 'manual' | 'photo'>('download');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login, loginWithPi } = useAuth();

  // Enhanced browser detection
  const browserInfo = EnhancedPiBrowserDetector.detectBrowser();

  // Device-specific download links with enhanced detection
  const getDownloadLinks = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');
    const isAndroid = userAgent.includes('android');

    return {
      piNetwork: isIOS 
        ? 'https://apps.apple.com/us/app/pi-network/id1445471895'
        : isAndroid 
        ? 'https://play.google.com/store/apps/details?id=com.blockchainvault'
        : 'https://minepi.com/Wain2020',
      piBrowser: isIOS
        ? 'https://apps.apple.com/us/app/pi-browser/id1560911608'
        : isAndroid
        ? 'https://play.google.com/store/apps/details?id=pi.browser'
        : 'https://minepi.com/Wain2020'
    };
  };

  const downloadLinks = getDownloadLinks();

  // Get appropriate messaging based on browser detection
  const getBrowserSpecificMessage = () => {
    if (browserInfo.isExternalBrowser) {
      return {
        title: `Using ${browserInfo.externalBrowserType}`,
        description: `You're currently using ${browserInfo.externalBrowserType}. For the best experience with Pi Network features, please use Pi Browser.`,
        icon: <Globe className="w-5 h-5" />
      };
    } else if (browserInfo.isMobile) {
      return {
        title: "Mobile Device Detected",
        description: "You're on a mobile device. To access Pi Network features, please download and use Pi Browser.",
        icon: <Smartphone className="w-5 h-5" />
      };
    } else {
      return {
        title: "Desktop Browser Detected",
        description: "You're using a desktop browser. For Pi Network features, please download Pi Browser on your mobile device.",
        icon: <Globe className="w-5 h-5" />
      };
    }
  };

  const browserMessage = getBrowserSpecificMessage();

  const handleManualLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      // Use the existing auth system
      await login(username.trim(), password);
      if (onAuthSuccess) {
        onAuthSuccess({ username: username.trim(), isPiAuth: false });
      }
      onClose();
    } catch (error) {
      setAuthError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    setIsLoading(true);
    setAuthError('');

    try {
      // Compress image first
      const compressedFile = await userPhotoService.compressImage(file, 300, 300);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload photo
      const result = await userPhotoService.uploadPhoto(compressedFile, username.trim() || 'temp_user');
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.photo) {
        setUserPhoto(result.photo.photoData);
        // Store in localStorage for immediate use
        localStorage.setItem('flappypi-user-photo', result.photo.photoData);
      } else {
        setAuthError(result.error || 'Failed to upload photo');
      }
    } catch (error) {
      setAuthError('Failed to process photo');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePhotoAuth = async () => {
    if (!username.trim()) {
      setAuthError('Please enter a username');
      return;
    }

    if (!userPhoto) {
      setAuthError('Please upload a photo');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      // Create a mock Pi user with photo
      const mockPiUser = {
        username: username.trim(),
        uid: `photo_${Date.now()}`,
        photo: userPhoto,
        isPhotoAuth: true,
        photoId: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store user data
      localStorage.setItem('flappypi-photo-user', JSON.stringify(mockPiUser));
      
      if (onAuthSuccess) {
        onAuthSuccess(mockPiUser);
      }
      onClose();
    } catch (error) {
      setAuthError('Failed to create photo account');
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = () => {
    setUserPhoto(null);
    localStorage.removeItem('flappypi-user-photo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStorageInfo = () => {
    const info = userPhotoService.getStorageInfo();
    return {
      totalPhotos: info.totalPhotos,
      totalSize: info.totalSize,
      maxSize: info.maxSize
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full bg-white/95 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700 text-center">
            {browserMessage.title}
          </DialogTitle>
        </DialogHeader>

        {/* Browser Detection Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
          {browserMessage.icon}
          <div className="text-sm text-blue-800">
            <p className="font-medium">{browserMessage.title}</p>
            <p className="text-xs">{browserMessage.description}</p>
            {browserInfo.confidence > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                Detection confidence: {browserInfo.confidence}%
              </p>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Method Selection */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={authMethod === 'download' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAuthMethod('download')}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant={authMethod === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAuthMethod('manual')}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            Manual
          </Button>
          <Button
            variant={authMethod === 'photo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAuthMethod('photo')}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
        </div>

        {/* Download Method */}
        {authMethod === 'download' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              {browserInfo.isExternalBrowser 
                ? `You're using ${browserInfo.externalBrowserType}. To access Pi Network features, please download the official Pi apps:`
                : "To use Pi Network features, please download the official apps:"
              }
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => window.open(downloadLinks.piNetwork, '_blank')}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Pi Network App
              </Button>
              
              <Button
                onClick={() => window.open(downloadLinks.piBrowser, '_blank')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Pi Browser
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              After downloading, return here and try again.
            </p>
          </div>
        )}

        {/* Manual Login Method */}
        {authMethod === 'manual' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Create a local account to play without Pi Network features:
            </p>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleManualLogin}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>

            {authError && (
              <Alert>
                <AlertDescription className="text-red-600">
                  {authError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Photo Authentication Method */}
        {authMethod === 'photo' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Create an account with your photo for a personalized experience:
            </p>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="photo-username">Username</Label>
                <Input
                  id="photo-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="photo-upload">Profile Photo</Label>
                <div className="mt-1 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {userPhoto && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePhoto}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              
              {userPhoto && (
                <div className="flex justify-center">
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                </div>
              )}
              
              <Button
                onClick={handlePhotoAuth}
                disabled={isLoading || !username.trim() || !userPhoto}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
              >
                {isLoading ? 'Creating Account...' : 'Create Photo Account'}
              </Button>
            </div>

            {/* Storage Info */}
            <div className="text-xs text-gray-500 text-center">
              <p>Storage: {storageInfo.totalPhotos} photos, {storageInfo.totalSize}KB / {storageInfo.maxSize}KB</p>
              <p>Supported: JPEG, PNG, WebP (max 5MB)</p>
            </div>

            {authError && (
              <Alert>
                <AlertDescription className="text-red-600">
                  {authError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}; 