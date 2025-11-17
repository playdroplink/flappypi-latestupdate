import { useState, useEffect, useCallback } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface FullscreenOptions {
  hideBrowserUI: boolean;
  hideSystemUI: boolean;
  immersiveMode: boolean;
  preventZoom: boolean;
  lockOrientation: boolean;
}

export const useDeviceAdaptiveFullscreen = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    deviceType: 'desktop'
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenOptions, setFullscreenOptions] = useState<FullscreenOptions>({
    hideBrowserUI: false,
    hideSystemUI: false,
    immersiveMode: false,
    preventZoom: false,
    lockOrientation: false
  });

  // Detect device type and capabilities
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window;
      
      const isMobile = width <= 768 || (width <= 1024 && isTouchDevice);
      const isTablet = width > 768 && width <= 1024 && isTouchDevice;
      const isDesktop = width > 1024 && !isTouchDevice;
      
      const orientation = height > width ? 'portrait' : 'landscape';
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth: width,
        screenHeight: height,
        orientation,
        deviceType
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  // Get optimal fullscreen options for device
  const getOptimalOptions = useCallback((device: DeviceInfo): FullscreenOptions => {
    if (device.isMobile) {
      return {
        hideBrowserUI: true,
        hideSystemUI: true,
        immersiveMode: true,
        preventZoom: true,
        lockOrientation: true
      };
    } else if (device.isTablet) {
      return {
        hideBrowserUI: true,
        hideSystemUI: false,
        immersiveMode: true,
        preventZoom: true,
        lockOrientation: false
      };
    } else {
      return {
        hideBrowserUI: false,
        hideSystemUI: false,
        immersiveMode: false,
        preventZoom: false,
        lockOrientation: false
      };
    }
  }, []);

  // Enter fullscreen with device-specific optimizations
  const enterFullscreen = useCallback(async () => {
    const options = getOptimalOptions(deviceInfo);
    setFullscreenOptions(options);

    try {
      // Apply device-specific optimizations
      if (options.hideBrowserUI) {
        // Hide browser UI elements
        document.body.classList.add('hide-browser-ui');
      }

      if (options.hideSystemUI) {
        // Hide system UI (mobile status bar, etc.)
        document.body.classList.add('hide-system-ui');
      }

      if (options.immersiveMode) {
        // Enable immersive mode
        document.body.classList.add('immersive-mode');
      }

      if (options.preventZoom) {
        // Prevent zoom on touch devices
        document.body.classList.add('prevent-zoom');
      }

      if (options.lockOrientation) {
        // Lock orientation for mobile
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (error) {
            console.log('Orientation lock not supported:', error);
          }
        }
      }

      // Enter fullscreen API
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }

      setIsFullscreen(true);
    } catch (error) {
      console.log('Fullscreen not supported or denied:', error);
    }
  }, [deviceInfo, getOptimalOptions]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      // Remove all optimization classes
      document.body.classList.remove(
        'hide-browser-ui',
        'hide-system-ui',
        'immersive-mode',
        'prevent-zoom'
      );

      // Exit fullscreen API
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      // Unlock orientation
      if (screen.orientation && (screen.orientation as any).unlock) {
        try {
          (screen.orientation as any).unlock();
        } catch (error) {
          console.log('Orientation unlock not supported:', error);
        }
      }

      setIsFullscreen(false);
    } catch (error) {
      console.log('Error exiting fullscreen:', error);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, exitFullscreen]);

  return {
    deviceInfo,
    isFullscreen,
    fullscreenOptions,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen: () => isFullscreen ? exitFullscreen() : enterFullscreen()
  };
};
