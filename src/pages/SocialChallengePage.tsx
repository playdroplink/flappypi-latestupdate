import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWallet } from '../context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useRouteUtils } from '../hooks/useRouteUtils';
import ImageWithFallback from '@/components/ImageWithFallback';
import { FaTwitter, FaDiscord, FaTelegram, FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaGlobe, FaComments } from 'react-icons/fa';
import { Globe, ExternalLink } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import FooterNPC from '../components/FooterNPC';
import Confetti from 'react-confetti';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import EnhancedFooter from '../components/EnhancedFooter';
import CommunityGuidelinesModal from '@/components/CommunityGuidelinesModal';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useAuth } from '../context/AuthContext';
import { usePiAuth } from '../context/PiAuthContext';
import ReturnToFlappyPiButton from '../components/ReturnToFlappyPiButton';

const SOCIAL_CHALLENGE_KEY = 'flappypi-social-challenge-claimed';
const SOCIAL_PROGRESS_KEY = 'flappypi-social-challenge-progress';

// Utility function to detect Pi Browser
const isPiBrowser = () => {
  return window.navigator.userAgent.includes('PiBrowser') || 
         window.location.hostname.includes('minepi.com') ||
         window.location.hostname.includes('pinet.com');
};

const socialLinks = [
  { name: 'Discord', handle: '@flappypiofficial', url: 'https://discord.gg/eBdVapW4nr', icon: <FaDiscord className="text-4xl text-indigo-500" />, btn: 'Join Discord', color: '#5865F2' },
  { name: 'Twitter', handle: '@flappypifun', url: 'https://x.com/flappypifun', icon: <FaTwitter className="text-4xl text-blue-400" />, btn: 'Follow', color: '#1DA1F2' },
  { name: 'Telegram', handle: '@flappypiofficial', url: 'https://t.me/flappypiofficial', icon: <FaTelegram className="text-4xl text-blue-500" />, btn: 'Join Channel', color: '#0088cc' },
  { name: 'YouTube', handle: '@flappypiofficial', url: 'https://youtube.com/@flappypiofficial', icon: <FaYoutube className="text-4xl text-red-500" />, btn: 'Subscribe', color: '#FF0000' },
  { name: 'Instagram', handle: '@flappypiofficial', url: 'https://instagram.com/flappypiofficial', icon: <FaInstagram className="text-4xl text-pink-500" />, btn: 'Follow', color: '#E4405F' },
  { name: 'Facebook', handle: '@flappypiofficial', url: 'https://facebook.com/flappypiofficial', icon: <FaFacebook className="text-4xl text-blue-600" />, btn: 'Like Page', color: '#1877F2' },
  { name: 'TikTok', handle: '@flappypiofficial', url: 'https://tiktok.com/@flappypiofficial', icon: <FaTiktok className="text-4xl text-black" />, btn: 'Follow', color: '#000000' },
  { name: 'Fireside Forum', handle: '@FlappyPiChallenge', url: 'https://fireside.pinet.com/channels/FlappyPiChallenge', icon: <FaComments className="text-4xl text-orange-500" />, btn: 'Join Forum', color: '#FF6B35' },
];

const EditablePersonalizedTemplate = () => {
  const canvasRef = useRef(null);
  const { profile } = useUserProfile();
  const { isAuthenticated, username: authUsername, isPiAuth, piUser } = useAuth();
  const { user: piAuthUser, isAuthenticated: isPiAuthenticated } = usePiAuth();
  
  // Get the best available username from multiple sources
  const getBestUsername = () => {
    // Priority order: Pi Auth user, Auth context user, profile username, default
    if (piAuthUser?.username) return piAuthUser.username;
    if (authUsername && authUsername !== 'Pi User') return authUsername;
    if (profile?.username) return profile.username;
    if (piUser?.username) return piUser.username;
    return 'YourName';
  };
  
  const [username, setUsername] = useState(getBestUsername());
  const [message, setMessage] = useState("I'm joining the #FlappyPiChallenge!");
  const [previewUrl, setPreviewUrl] = useState('');

  // Update username when authentication state changes
  useEffect(() => {
    const bestUsername = getBestUsername();
    if (bestUsername !== 'YourName' && bestUsername !== username) {
      setUsername(bestUsername);
    }
  }, [piAuthUser, authUsername, profile, piUser, isAuthenticated, isPiAuthenticated]);

  // Draw the template with the Flappy logo and background
  const drawTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sky blue background
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#7ed6ff';
    ctx.fillRect(0, 0, 1080, 1080);

    // Clouds
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(200, 180, 90, 40, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(800, 300, 80, 30, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(900, 900, 100, 40, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 1;

    // Green pipe (left)
    ctx.fillStyle = '#4ecb6e';
    ctx.fillRect(60, 200, 120, 700);
    ctx.fillStyle = '#3fa75c';
    ctx.fillRect(60, 200, 120, 60);

    // Trophy (right)
    ctx.save();
    ctx.translate(900, 900);
    ctx.fillStyle = '#f6b93b';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, -120); ctx.lineTo(120, 0); ctx.closePath(); ctx.fill(); // cup
    ctx.fillRect(-30, 0, 180, 40); // base
    ctx.restore();
    ctx.save();
    ctx.translate(1020, 900);
    ctx.fillStyle = '#e17055';
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI, true); ctx.fill(); // top of base
    ctx.restore();

    // Draw the Flappy logo in the center
    const logo = new window.Image();
    logo.src = '/flappy-logo.png';
    logo.onload = () => {
      ctx.drawImage(logo, 340, 350, 400, 400);
      // Hashtag
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#273c75'; // dark blue outline
      ctx.fillStyle = '#fff'; // white text
      ctx.strokeText('#FlappyPiChallenge', 540, 120);
      ctx.fillText('#FlappyPiChallenge', 540, 120);
      // Main text
      ctx.font = 'bold 64px Arial';
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#273c75';
      ctx.fillStyle = '#fff';
      ctx.strokeText('FLAP. SHARE. WIN!', 540, 300);
      ctx.fillText('FLAP. SHARE. WIN!', 540, 300);
      // Username (editable)
      ctx.font = 'bold 90px Arial';
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#273c75';
      ctx.fillStyle = '#ffe066'; // yellow username
      ctx.strokeText(username, 540, 800);
      ctx.fillText(username, 540, 800);
      // Custom message (editable)
      ctx.font = 'bold 48px Arial';
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#fff';
      ctx.fillStyle = '#0097e6'; // blue message
      ctx.strokeText(message, 540, 900);
      ctx.fillText(message, 540, 900);
      // Footer background (green)
      ctx.fillStyle = '#1abc5b';
      ctx.fillRect(0, 980, 1080, 100);
      // First line: Join the Pi Network gaming revolution!
      ctx.font = 'bold 38px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText('Join the Pi Network gaming revolution!', 540, 1030);
      // Second line: Powered by mrwain organization
      ctx.font = 'bold 26px Arial';
      ctx.globalAlpha = 0.7;
      ctx.fillText('Powered by mrwain organization', 540, 1065);
      ctx.globalAlpha = 1;
      // Update preview
      setPreviewUrl(canvas.toDataURL());
    };
  };

  useEffect(() => {
    drawTemplate();
    // eslint-disable-next-line
  }, [username, message]);

  const handleDownload = () => {
    drawTemplate();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `flappy-pi-challenge-${username}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }, 200); // Wait for logo to render
  };

  const isPiBrowser = typeof window !== 'undefined' && (window.Pi || navigator.userAgent.toLowerCase().includes('pibrowser') || navigator.userAgent.toLowerCase().includes('pi browser'));

  return (
    <div className="w-full flex flex-col items-center my-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2">Personalize & Download Your Challenge Image!</h2>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl items-center">
        <div className="flex-1">
          <label className="block mb-1 font-bold text-gray-700">
            Your Username:
            {getBestUsername() !== 'YourName' && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✨ Auto-filled from Pi Auth
              </span>
            )}
          </label>
          <input
            className="w-full p-2 rounded border mb-2"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={20}
            placeholder="Enter your username"
          />
          {getBestUsername() !== 'YourName' && (
            <p className="text-xs text-green-600 mb-2">
              💡 Username automatically filled from your Pi Network authentication
            </p>
          )}
          <label className="block mb-1 font-bold text-gray-700">Custom Message:</label>
          <input
            className="w-full p-2 rounded border mb-4"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={40}
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <canvas ref={canvasRef} width={1080} height={1080} style={{ display: 'none' }} />
          {previewUrl && (
            <>
              <img src={previewUrl} alt="Preview" className="w-full max-w-xs rounded-xl shadow-lg border border-blue-200 mb-4" />
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button 
                  className="w-full font-bold text-base py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all duration-200" 
                  onClick={handleDownload}
                >
                  🎨 Download My Personalized Challenge Image
                </Button>
                <button
                  className="w-full font-bold text-base py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all duration-200"
                  onClick={() => {
                    navigator.clipboard.writeText(previewUrl);
                    alert('Image link copied to clipboard!');
                  }}
                >
                  Copy Image Link
                </button>
                <div className="text-xs text-gray-500 text-center px-2">
                  Paste this link in another browser to download if needed.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { navigateBack } = useRouteUtils();
  const { addCoins, refreshBalance } = useWallet();
  const { toast } = useToast();
  
  // Load persistent progress from localStorage
  const [socialProgress, setSocialProgress] = useState(() => {
    const saved = localStorage.getItem(SOCIAL_PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure completed is an array for backward compatibility
      if (typeof parsed.completed === 'boolean') {
        parsed.completed = socialLinks.map(() => false);
      }
      return parsed;
    }
    return {
      clicked: socialLinks.map(() => false),
      checked: socialLinks.map(() => false),
      currentStep: 0, // Track which social is currently active
      completed: socialLinks.map(() => false) // Changed from boolean to array
    };
  });
  
  const [claimed, setClaimed] = useState(() => localStorage.getItem(SOCIAL_CHALLENGE_KEY) === '1');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [currentSocialIndex, setCurrentSocialIndex] = useState(-1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(false);
  
  // Only allow checking the next box if the previous is checked
  const allChecked = socialProgress.checked.every(Boolean);
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SOCIAL_PROGRESS_KEY, JSON.stringify(socialProgress));
  }, [socialProgress]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle page visibility changes (when user returns from external links)
  useEffect(() => {
    let returnTimeout: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        // User returned to the page, check if they completed any social actions
        const returnUrl = localStorage.getItem('flappypi-social-challenge-return-url');
        if (returnUrl && returnUrl === window.location.href) {
          // Hide return button since user is back
          setShowReturnButton(false);
          
          // Auto-refresh the page state after a short delay
          returnTimeout = setTimeout(() => {
            // Force a state refresh to update the UI
            setSocialProgress(prev => ({ ...prev }));
            
            // Show a toast asking if they completed the action
            toast({
              title: "Welcome Back! 🎉",
              description: "Did you complete the social media action? Click to mark as done.",
              duration: 10000,
              action: (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    // Find the current step and mark it as completed
                    const currentStep = socialProgress.currentStep;
                    setSocialProgress(prev => ({
                      ...prev,
                      checked: prev.checked.map((v, i) => (i === currentStep ? true : v)),
                      completed: prev.completed.map((v, i) => (i === currentStep ? true : v)),
                      currentStep: Math.min(currentStep + 1, socialLinks.length - 1)
                    }));
                    toast({
                      title: "Great! ✅",
                      description: "Social media action marked as completed. You can now proceed to the next step!",
                      variant: "default"
                    });
                  }}
                >
                  ✅ Mark as Done
                </Button>
              )
            });
          }, 500); // Small delay to ensure page is fully loaded
          
          // Clear the return URL
          localStorage.removeItem('flappypi-social-challenge-return-url');
        }
      }
    };

    // Also handle window focus events for better detection
    const handleWindowFocus = () => {
      handleVisibilityChange();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      if (returnTimeout) clearTimeout(returnTimeout);
    };
  }, [socialProgress.currentStep, toast]);

  // Auto-refresh mechanism for better user experience
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    // Set up periodic refresh when user is on the page
    const setupAutoRefresh = () => {
      // Clear any existing interval
      if (refreshInterval) clearInterval(refreshInterval);
      
      // Set up new interval for auto-refresh every 30 seconds
      refreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible' && document.hasFocus()) {
          // Force a gentle state refresh to update UI
          setSocialProgress(prev => ({ ...prev }));
          
          // Check if user has been away and returned
          const returnUrl = localStorage.getItem('flappypi-social-challenge-return-url');
          if (returnUrl && returnUrl === window.location.href) {
            // User might have completed an action, show a gentle reminder
            const currentStep = socialProgress.currentStep;
            if (currentStep < socialLinks.length && !socialProgress.checked[currentStep]) {
              console.log('🔄 Auto-refresh: User may have completed social action');
            }
          }
        }
      }, 30000); // Check every 30 seconds
    };

    // Set up auto-refresh
    setupAutoRefresh();

    // Also refresh when page becomes visible
    const handlePageFocus = () => {
      if (document.visibilityState === 'visible') {
        // Immediate refresh when page becomes visible
        setSocialProgress(prev => ({ ...prev }));
        setupAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handlePageFocus);
    window.addEventListener('focus', handlePageFocus);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handlePageFocus);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, [socialProgress.currentStep]);

  // Enhanced return detection with automatic progress updates
  useEffect(() => {
    const checkForReturn = () => {
      const returnUrl = localStorage.getItem('flappypi-social-challenge-return-url');
      const currentStep = localStorage.getItem('flappypi-social-challenge-current-step');
      const timestamp = localStorage.getItem('flappypi-social-challenge-timestamp');
      
      if (returnUrl && returnUrl === window.location.href && currentStep) {
        const stepIndex = parseInt(currentStep);
        const timeAway = timestamp ? Date.now() - parseInt(timestamp) : 0;
        
        // If user was away for more than 10 seconds, they likely completed the action
        if (timeAway > 10000) {
          console.log('🔄 User returned after being away, likely completed social action');
          
          // Auto-advance to next step if current step is not completed
          if (stepIndex < socialLinks.length && !socialProgress.checked[stepIndex]) {
            setSocialProgress(prev => ({
              ...prev,
              checked: prev.checked.map((v, i) => (i === stepIndex ? true : v)),
              completed: prev.completed.map((v, i) => (i === stepIndex ? true : v)),
              currentStep: Math.min(stepIndex + 1, socialLinks.length - 1)
            }));
            
            // Show success message
            toast({
              title: "Welcome Back! 🎉",
              description: `Great! You've completed the ${socialLinks[stepIndex].name} step. You can now proceed to the next social media platform.`,
              duration: 8000
            });
          }
          
          // Clear tracking data
          localStorage.removeItem('flappypi-social-challenge-return-url');
          localStorage.removeItem('flappypi-social-challenge-current-step');
          localStorage.removeItem('flappypi-social-challenge-timestamp');
          setShowReturnButton(false);
        }
      }
    };

    // Check for return on page focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(checkForReturn, 1000); // Small delay to ensure page is fully loaded
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);
    
    // Also check immediately on mount
    checkForReturn();

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [socialProgress.checked, toast]);

  const handleSocialClick = (idx: number, isInternal: boolean, url: string) => {
    // Only allow clicking the current step or the next available step
    if (idx > socialProgress.currentStep + 1) {
      toast({
        title: "Complete Previous Steps First",
        description: `Please complete the ${socialLinks[socialProgress.currentStep].name} step first.`,
        variant: "destructive"
      });
      return;
    }

    // Update clicked state for this social
    setSocialProgress(prev => ({
      ...prev,
      clicked: prev.clicked.map((v, i) => (i === idx ? true : v)),
      currentStep: Math.max(prev.currentStep, idx)
    }));

    if (isInternal) {
      navigate(url);
    } else {
      // Store the current page URL and step info for fallback
      const currentPageUrl = window.location.href;
      localStorage.setItem('flappypi-social-challenge-return-url', currentPageUrl);
      localStorage.setItem('flappypi-social-challenge-current-step', idx.toString());
      localStorage.setItem('flappypi-social-challenge-timestamp', Date.now().toString());
      
      // Show return button and track current social index
      setShowReturnButton(true);
      setCurrentSocialIndex(idx);
      
      // Show user feedback for Pi Browser
      if (isPiBrowser()) {
        toast({
          title: "Opening External Link",
          description: "This will open in your default browser. Complete the action and return to mark as done.",
          duration: 3000,
        });
      }
      
      // Enhanced external link handling with proper fallback
      try {
        // Method 1: Try window.open first (best for Pi Browser)
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer,width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (newWindow) {
          // Successfully opened in new window
          console.log('External link opened in new window');
          
          // Show immediate feedback
          toast({
            title: "External Link Opened",
            description: "Complete the action in the new tab and return here to mark as done.",
            duration: 5000,
          });
          
          // Set up a fallback mechanism
          const fallbackTimeout = setTimeout(() => {
            // Check if user is still on the page after 3 seconds
            if (document.visibilityState === 'visible') {
              toast({
                title: "Return to Flappy Pi",
                description: "Click here to return to the Social Challenge if you completed the action.",
                duration: 10000,
                action: (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      // Mark as completed when user returns
                      setSocialProgress(prev => ({
                        ...prev,
                        completed: prev.completed.map((v, i) => (i === idx ? true : v))
                      }));
                      toast({
                        title: "Great!",
                        description: "Social media action marked as completed.",
                        variant: "default"
                      });
                    }}
                  >
                    🎯 Mark as Done
                  </Button>
                )
              });
            }
          }, 3000);
          
          // Clean up timeout if user returns quickly
          const checkReturn = setInterval(() => {
            if (document.visibilityState === 'visible' && document.hasFocus()) {
              clearTimeout(fallbackTimeout);
              clearInterval(checkReturn);
            }
          }, 1000);
          
        } else {
          // Popup blocked, try alternative methods
          console.log('Popup blocked, trying alternative methods');
          
          // Method 2: Create and click a link element
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Method 3: Show a modal with instructions
          setTimeout(() => {
            toast({
              title: "External Link Opened",
              description: "Complete the action in the new tab and return here to mark as done.",
              duration: 8000,
              action: (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    // Mark as completed
                    setSocialProgress(prev => ({
                      ...prev,
                      completed: prev.completed.map((v, i) => (i === idx ? true : v))
                    }));
                    toast({
                      title: "Great!",
                      description: "Social media action marked as completed.",
                      variant: "default"
                    });
                  }}
                >
                  🚀 Mark as Done
                </Button>
              )
            });
          }, 1000);
        }
        
      } catch (error) {
        console.error('Error opening external link:', error);
        
        // Final fallback: Show instructions
        toast({
          title: "Manual Action Required",
          description: `Please manually visit ${url} and complete the action, then return here.`,
          duration: 10000,
          action: (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                // Mark as completed
                setSocialProgress(prev => ({
                  ...prev,
                  completed: prev.completed.map((v, i) => (i === idx ? true : v))
                }));
                toast({
                  title: "Great!",
                  description: "Social media action marked as completed.",
                  variant: "default"
                });
              }}
            >
              ⚡ Mark as Done
            </Button>
          )
        });
      }
    }
  };

  const handleReturnToFlappyPi = () => {
    // Hide return button
    setShowReturnButton(false);
    
    // Mark current social as completed
    if (currentSocialIndex >= 0) {
      setSocialProgress(prev => ({
        ...prev,
        completed: prev.completed.map((v, i) => (i === currentSocialIndex ? true : v))
      }));
      
      toast({
        title: "Great!",
        description: "Social media action marked as completed.",
        variant: "default"
      });
    }
    
    // Clear the return URL
    localStorage.removeItem('flappypi-social-challenge-return-url');
  };

  const handleCheck = (idx: number) => {
    // Only allow checking if this is the current step or previous steps are completed
    if (idx > socialProgress.currentStep) {
      toast({
        title: "Complete Current Step First",
        description: `Please complete the ${socialLinks[socialProgress.currentStep].name} step first.`,
        variant: "destructive"
      });
      return;
    }

    if (socialProgress.clicked[idx]) {
      setSocialProgress(prev => ({
        ...prev,
        checked: prev.checked.map((v, i) => (i === idx ? !v : v)),
        currentStep: Math.max(prev.currentStep, idx + 1) // Move to next step when checked
      }));
    }
  };

  const handleClaim = async () => {
    if (claimed) return;
    await addCoins(314, 'Social Challenge Reward');
    if (typeof refreshBalance === 'function') await refreshBalance();
    setClaimed(true);
    localStorage.setItem(SOCIAL_CHALLENGE_KEY, '1');
    
    // Mark challenge as completed
    setSocialProgress(prev => ({
      ...prev,
      completed: socialLinks.map(() => true) // Mark all as completed
    }));
    
    // Award badge in localStorage (simulate profile update)
    let badges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
    if (!badges.includes('social-challenge-badge')) {
      badges.push('social-challenge-badge');
      localStorage.setItem('flappypi-badges', JSON.stringify(badges));
    }
    setShowBadgeModal(true);
    toast({
      title: '🎉 Challenge Complete!',
      description: 'You received 314 Flappy Coins and a Social Challenge Badge!',
      duration: 4000
    });
  };

  // Reset progress function (for testing)
  const resetProgress = () => {
    setSocialProgress({
      clicked: socialLinks.map(() => false),
      checked: socialLinks.map(() => false),
      currentStep: 0,
      completed: false
    });
    setClaimed(false);
    localStorage.removeItem(SOCIAL_CHALLENGE_KEY);
    localStorage.removeItem(SOCIAL_PROGRESS_KEY);
    toast({
      title: "Progress Reset",
      description: "Social challenge progress has been reset.",
    });
  };

  // 50 dialog lines about the social challenge
  const socialChallengeDialogs = [
    "Welcome to the Flappy Pi Social Challenge!",
    "Follow all our socials to earn 314 Flappy Coins!",
    "Have you joined our Discord yet? It's a great place to meet other players!",
    "Don't forget to follow us on Twitter for the latest updates!",
    "Join our Telegram channel for exclusive news and events!",
    "Subscribe to our YouTube for gameplay tips and event streams!",
    "Follow us on Instagram for fun Flappy Pi moments!",
    "Like our Facebook page to stay connected!",
    "Follow us on TikTok for short, fun Flappy Pi videos!",
    "Join the Fireside Forum to discuss strategies and share your scores!",
    "Every social you follow brings you closer to the reward!",
    "Remember to check the box after you follow each social!",
    "You can only claim the reward once per user.",
    "Invite your friends to join the challenge too!",
    "Sharing your personalized image helps spread the word!",
    "The more the community grows, the more fun we have!",
    "Flappy Pi is all about community and fun!",
    "Did you know? Flappy Coins are in-game currency, not Pi.",
    "Stay tuned for more social challenges in the future!",
    "Have you downloaded your personalized challenge image yet?",
    "Show off your Flappy Pi pride on social media!",
    "The Social Challenge is a limited-time event!",
    "Claim your reward before the event ends!",
    "Thank you for supporting Flappy Pi!",
    "Our Discord is the best place for live support.",
    "Follow us everywhere to never miss an update!",
    "The Fireside Forum is perfect for sharing your achievements.",
    "Did you invite a friend today?",
    "Flappy Pi is better with friends!",
    "Check out our YouTube for tournament highlights!",
    "Instagram is where we post sneak peeks!",
    "Facebook is great for community polls and news.",
    "TikTok is where the fun, short videos live!",
    "Telegram is the fastest way to get news.",
    "Discord has channels for every topic!",
    "The Social Challenge is your chance to earn extra coins!",
    "Don't forget to claim your reward after following all socials!",
    "You can only claim the reward if all boxes are checked.",
    "Need help? Ask in our Discord or Fireside Forum!",
    "The Flappy Pi team thanks you for your support!",
    "Stay flappy, stay social!",
    "Did you know? You can personalize your challenge image!",
    "Share your challenge image and tag us!",
    "The more you share, the more the community grows!",
    "Flappy Pi is powered by the community.",
    "We love seeing your posts and shares!",
    "Social challenges bring us all together!",
    "Ready to flap, share, and win?",
    "Good luck and have fun in the Social Challenge!",
    "See you on the leaderboards!"
  ];

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full flex flex-col items-center p-4">
        <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center mx-auto max-w-2xl rounded-3xl mt-8">
          <Button variant="ghost" size="icon" onClick={() => navigateBack('/home')} className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2">
            ←
          </Button>
          <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Mascot" className="w-24 h-24 mb-4 animate-bounce drop-shadow-xl" lazy={true} />
          <h1 className="text-3xl font-black mb-2 text-blue-700 text-center">Flappy Pi Social Challenge</h1>
          <div className="mb-4">
            <Button
              variant="outline"
              className="font-bold"
              onClick={() => setShowGuidelines(true)}
            >
              Community Guidelines
            </Button>
          </div>
          {/* Badge Preview */}
          <div className="flex flex-col items-center mb-4">
            <img src="/social-challenge-badge.png" alt="Social Challenge Badge Preview" className="w-16 h-16 mb-1 drop-shadow-lg animate-trophy-glow" />
            <div className="text-xs font-bold text-yellow-700">Social Challenge Badge</div>
            <div className="text-xs text-gray-500 text-center max-w-xs">Earn this badge by completing the Social Challenge!</div>
          </div>
          <style>{`
            @keyframes trophy-glow {
              0% { filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 0px #fff); }
              50% { filter: drop-shadow(0 0 24px gold) drop-shadow(0 0 8px #fff); }
              100% { filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 0px #fff); }
            }
            .animate-trophy-glow { animation: trophy-glow 2.2s infinite cubic-bezier(0.4, 0.7, 0.6, 1); }
          `}</style>
          <p className="text-lg text-blue-800 font-medium mb-6 text-center">
            Follow all our official socials and claim{' '}
            <span className="font-bold text-yellow-500 inline-flex items-center gap-1">
              314
              <img src="/flappycoins.png" alt="Flappy Coin" className="w-6 h-6 inline-block align-middle" />
              Flappy Coins
            </span>!
          </p>
          
          {/* Progress Indicator */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {socialProgress.checked.filter(Boolean).length} / {socialLinks.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(socialProgress.checked.filter(Boolean).length / socialLinks.length) * 100}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {socialProgress.currentStep < socialLinks.length ? 
                `Current step: ${socialLinks[socialProgress.currentStep].name}` : 
                'All steps completed!'
              }
            </div>
          </div>

          <EditablePersonalizedTemplate />

          {/* Instructions */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📋 How to Complete the Challenge:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click the highlighted social media button (with blue ring)</li>
              <li>2. Follow/join the social media account in the new tab</li>
              <li>3. Return to this page and check the "I followed" box</li>
              <li>4. Repeat for the next social media platform</li>
              <li>5. Complete all 8 socials to claim your reward!</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              💡 <strong>Tip:</strong> Your progress is saved automatically. You can close and return anytime!
            </p>
          </div>

          {/* Social Media Share Template Section (moved to top) */}
          <div className="w-full flex flex-col items-center my-6">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Share Your Challenge!</h2>
            <p className="text-gray-700 mb-2 text-center">
              Download and share your personalized image above on your favorite social media to show you joined the Flappy Pi Social Challenge and invite friends!
            </p>
          </div>

          {/* --- Flappy Coin Reward Banner --- */}
          <div className="w-full flex flex-col items-center my-6">
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/flappycoins.png" 
                alt="Flappy Coin" 
                className="w-16 h-16 mb-2 animate-bounce animate-pulse drop-shadow-lg" 
                style={{ 
                  animation: 'float 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 4px 12px rgba(255, 193, 7, 0.3))'
                }}
              />
              <div className="text-lg font-bold text-yellow-500">Complete the Social Challenge and Earn Flappy Coins!</div>
              <div className="text-sm text-gray-600">(Not Pi. Flappy Coins are in-game currency.)</div>
              {isPiBrowser() && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg mt-2">
                  <strong>📱 Pi Browser Users:</strong> Links will open in your default browser. Complete the social media actions and return to mark them as done.
                </div>
              )}
            </div>
          </div>

          {/* Social links and challenge logic follow below this section */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {socialLinks.map((s, idx) => {
              const isEnabled = (idx === 0 || socialProgress.checked[idx - 1]) && !claimed;
              const isCurrentStep = idx === socialProgress.currentStep;
              const isCompleted = socialProgress.checked[idx];
              const isClicked = socialProgress.clicked[idx];
              
              return (
                <div key={s.name} className={`flex flex-col items-center rounded-2xl shadow-lg p-6 bg-white relative ${
                  !isEnabled ? 'opacity-50 pointer-events-none' : ''
                } ${
                  isCurrentStep ? 'ring-4 ring-blue-400 ring-opacity-50 animate-pulse' : ''
                } ${
                  isCompleted ? 'ring-2 ring-green-400' : ''
                }`}>
                  
                  {/* Step indicator */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isCurrentStep ? 'bg-blue-500 text-white animate-pulse' : 
                    'bg-gray-300 text-gray-600'
                  }">
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  
                  <div className="mb-2">{s.icon}</div>
                  <div className="font-bold text-lg mb-1 text-gray-900">{s.name}</div>
                  <div className="mb-2 text-base opacity-90 text-gray-700">{s.handle}</div>
                  
                  {/* Status indicator */}
                  {isCurrentStep && !isClicked && (
                    <div className="text-xs text-blue-600 font-semibold mb-2 animate-pulse">
                      👆 Click to follow this social
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="text-xs text-green-600 font-semibold mb-2">
                      ✅ Completed
                    </div>
                  )}
                  
                  <Button
                    className={`w-full font-bold text-base py-3 rounded-xl mb-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isCurrentStep ? 'animate-pulse ring-4 ring-blue-300 ring-opacity-50' : ''
                    } ${
                      isCompleted ? 'opacity-75' : 'hover:brightness-110'
                    }`}
                    style={{ 
                      background: isCompleted 
                        ? `linear-gradient(135deg, ${s.color}88, ${s.color})` 
                        : `linear-gradient(135deg, ${s.color}, ${s.color}dd)`,
                      color: '#fff',
                      boxShadow: isCurrentStep ? `0 0 20px ${s.color}40` : '0 4px 15px rgba(0,0,0,0.2)',
                      border: isCurrentStep ? `2px solid ${s.color}` : 'none'
                    }}
                    onClick={() => handleSocialClick(idx, false, s.url)}
                    disabled={!isEnabled}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isCompleted && <span className="text-lg">✅</span>}
                      {s.btn}
                      {isCurrentStep && !isCompleted && <span className="text-lg animate-bounce">👆</span>}
                    </span>
                  </Button>
                  
                  {isClicked && !isCompleted && (
                    <label className="flex items-center mt-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="mr-2" 
                        checked={isCompleted} 
                        onChange={() => handleCheck(idx)} 
                        disabled={!isEnabled || claimed} 
                      />
                      <span className={claimed ? 'line-through text-gray-400' : 'text-blue-600 font-semibold'}>
                        ✅ I followed {s.name}
                      </span>
                    </label>
                  )}
                  
                  {isCompleted && (
                    <div className="text-xs text-green-600 font-semibold mt-2">
                      ✅ Verified
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            className={`w-full font-bold text-lg py-4 rounded-xl text-white mb-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              claimed 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 cursor-not-allowed opacity-75' 
                : allChecked 
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 shadow-lg animate-pulse' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-50'
            }`}
            onClick={handleClaim}
            disabled={!allChecked || claimed}
          >
            <span className="flex items-center justify-center gap-2">
              {claimed ? (
                <>
                  <span className="text-2xl">✅</span>
                  <span>Reward Claimed</span>
                </>
              ) : allChecked ? (
                <>
                  <span className="text-2xl animate-bounce">🎉</span>
                  <span>Claim 314 Flappy Coins</span>
                  <span className="text-xl">💰</span>
                </>
              ) : (
                <>
                  <span className="text-xl">⏳</span>
                  <span>Complete All Socials First</span>
                </>
              )}
            </span>
          </Button>
          <p className="text-sm text-gray-500 mt-2">* You must follow all socials to claim the reward. One claim per user.</p>
          

          <Button
            className="w-full font-bold text-lg py-3 rounded-xl bg-blue-500 text-white mt-4"
            onClick={() => navigate('/home')}
          >
            ⬅️ Return to Home
          </Button>
          {/* Visit Our Website button with proper icons */}
          <div className="w-full flex flex-col items-center my-4">
            <Link to="/flappypiofficial" className="w-full max-w-xs">
              <Button className="w-full font-bold text-base py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg mb-2 hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2">
                <Globe className="w-5 h-5" />
                <span>Visit Our Website</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        {/* Footer NPC for Social Challenge */}
        <FooterNPC npcType="default" dialogs={socialChallengeDialogs} npcName="Social NPC" />
        
        {/* Footer */}
        <EnhancedFooter 
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
        <CommunityGuidelinesModal isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} />
        {/* Badge Modal */}
        {showBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} recycle={false} />
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center animate-bounce-in">
              <img src="/social-challenge-badge.png" alt="Social Challenge Badge" className="w-32 h-32 mb-4 animate-bounce-trophy animate-trophy-glow" />
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-800 mb-4 text-center">You earned the <span className="font-bold text-yellow-700">Social Challenge Badge</span> for completing the challenge!</p>
              <button className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition" onClick={() => setShowBadgeModal(false)}>Awesome!</button>
            </div>
            <style>{`
              @keyframes bounce-in {
                0% { transform: scale(0.7); opacity: 0; }
                60% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); }
              }
              .animate-bounce-in { animation: bounce-in 0.7s; }
              @keyframes trophy-glow {
                0% { filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 0px #fff); }
                50% { filter: drop-shadow(0 0 24px gold) drop-shadow(0 0 8px #fff); }
                100% { filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 0px #fff); }
              }
              .animate-trophy-glow { animation: trophy-glow 2.2s infinite cubic-bezier(0.4, 0.7, 0.6, 1); }
            `}</style>
          </div>
        )}
      </div>
      
      {/* Return to Flappy Pi Button */}
      <ReturnToFlappyPiButton 
        isVisible={showReturnButton}
        onReturn={handleReturnToFlappyPi}
        socialMediaName={currentSocialIndex >= 0 ? socialLinks[currentSocialIndex]?.name : undefined}
      />
    </SkyBackground>
  );
};

export default SocialChallengePage; 