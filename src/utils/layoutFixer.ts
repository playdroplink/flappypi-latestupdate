/**
 * Layout Fixer Utility
 * Fixes layout, scrolling, and centering issues on mobile and desktop
 */

export class LayoutFixer {
  private static instance: LayoutFixer;
  private isMobile: boolean;
  private isInitialized: boolean = false;

  private constructor() {
    this.isMobile = this.detectMobile();
  }

  public static getInstance(): LayoutFixer {
    if (!LayoutFixer.instance) {
      LayoutFixer.instance = new LayoutFixer();
    }
    return LayoutFixer.instance;
  }

  /**
   * Detect if device is mobile
   */
  private detectMobile(): boolean {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Initialize layout fixes
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    console.log('🔧 Initializing Layout Fixer...');
    
    this.fixViewport();
    this.fixScrolling();
    this.fixCentering();
    this.fixTouchHandling();
    this.fixOverflow();
    
    this.isInitialized = true;
    console.log('✅ Layout Fixer initialized');
  }

  /**
   * Fix viewport issues
   */
  private fixViewport(): void {
    // Set proper viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    
    if (this.isMobile) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
  }

  /**
   * Fix scrolling issues
   */
  private fixScrolling(): void {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    if (this.isMobile) {
      // Mobile scrolling fixes
      html.style.height = '100vh';
      html.style.overflow = 'hidden';
      
      body.style.height = '100vh';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = '0';
      body.style.left = '0';
      
      if (root) {
        root.style.height = '100vh';
        root.style.overflow = 'auto';
        root.style.webkitOverflowScrolling = 'touch';
        root.style.position = 'relative';
        root.style.width = '100%';
      }
    } else {
      // Desktop scrolling fixes
      html.style.height = '100vh';
      html.style.overflow = 'hidden';
      
      body.style.height = '100vh';
      body.style.overflow = 'hidden';
      body.style.position = 'relative';
      body.style.width = '100%';
      
      if (root) {
        root.style.height = '100vh';
        root.style.overflow = 'auto';
        root.style.position = 'relative';
        root.style.width = '100%';
      }
    }
  }

  /**
   * Fix centering issues
   */
  private fixCentering(): void {
    const root = document.getElementById('root');
    if (!root) return;

    if (this.isMobile) {
      // Mobile centering
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
      root.style.alignItems = 'center';
      root.style.justifyContent = 'flex-start';
      root.style.padding = '0';
      root.style.margin = '0';
    } else {
      // Desktop centering
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
      root.style.alignItems = 'center';
      root.style.justifyContent = 'center';
      root.style.padding = '0';
      root.style.margin = '0';
    }
  }

  /**
   * Fix touch handling
   */
  private fixTouchHandling(): void {
    if (this.isMobile) {
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      // Prevent zoom on input focus
      document.addEventListener('focusin', (event) => {
        if (event.target instanceof HTMLInputElement || 
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
        }
      });
    }
  }

  /**
   * Fix overflow issues
   */
  private fixOverflow(): void {
    // Add CSS classes for better overflow handling
    const style = document.createElement('style');
    style.textContent = `
      .layout-fixed {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        overflow: hidden !important;
      }
      
      .layout-scrollable {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
        overscroll-behavior: contain !important;
      }
      
      .layout-centered {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .layout-mobile-centered {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
      }
      
      .layout-desktop-centered {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .layout-no-scrollbar {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      .layout-no-scrollbar::-webkit-scrollbar {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Apply layout classes to elements
   */
  applyLayoutClasses(element: HTMLElement, classes: string[]): void {
    classes.forEach(className => {
      element.classList.add(className);
    });
  }

  /**
   * Remove layout classes from elements
   */
  removeLayoutClasses(element: HTMLElement, classes: string[]): void {
    classes.forEach(className => {
      element.classList.remove(className);
    });
  }

  /**
   * Get current device type
   */
  getDeviceType(): 'mobile' | 'desktop' {
    return this.isMobile ? 'mobile' : 'desktop';
  }

  /**
   * Check if layout is initialized
   */
  isLayoutInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Force layout recalculation
   */
  forceLayoutRecalculation(): void {
    // Trigger layout recalculation
    document.body.offsetHeight;
    
    // Re-apply fixes
    this.fixScrolling();
    this.fixCentering();
  }

  /**
   * Handle orientation change
   */
  handleOrientationChange(): void {
    setTimeout(() => {
      this.forceLayoutRecalculation();
    }, 100);
  }

  /**
   * Handle window resize
   */
  handleWindowResize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    
    if (wasMobile !== this.isMobile) {
      // Device type changed, reinitialize
      this.isInitialized = false;
      this.initialize();
    } else {
      // Just resize, recalculate layout
      this.forceLayoutRecalculation();
    }
  }

  /**
   * Completely hide all scrollbars across the application
   */
  hideAllScrollbars(): void {
    try {
      // Apply to all major elements
      const elements = ['html', 'body', '#root', '.app-container', '.main-content'];
      
      elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          (element as HTMLElement).style.overflowX = 'hidden';
          (element as HTMLElement).style.overflowY = 'auto';
          (element as HTMLElement).style.scrollbarWidth = 'none';
          (element as HTMLElement).style.msOverflowStyle = 'none';
        }
      });

      // Add CSS to hide scrollbars for all elements
      const style = document.createElement('style');
      style.id = 'scrollbar-hide-style';
      style.textContent = `
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
        }
        html, body, #root, .app-container, .main-content {
          overflow-x: hidden !important;
          overflow-y: auto !important;
        }
      `;
      
      // Remove existing style if present
      const existingStyle = document.getElementById('scrollbar-hide-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      console.log('✅ All scrollbars hidden but scrolling enabled');
    } catch (error) {
      console.error('❌ Error hiding scrollbars:', error);
    }
  }

  /**
   * Force hide scrollbars with maximum priority
   */
  forceHideScrollbars(): void {
    try {
      // Apply with !important using CSS custom properties
      const style = document.createElement('style');
      style.id = 'force-scrollbar-hide';
      style.textContent = `
        html, body, #root, .app-container, .main-content {
          overflow-x: hidden !important;
          overflow-y: auto !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        #root::-webkit-scrollbar,
        .app-container::-webkit-scrollbar,
        .main-content::-webkit-scrollbar,
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `;
      
      // Remove existing style if present
      const existingStyle = document.getElementById('force-scrollbar-hide');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      // Also apply directly to elements
      const elements = ['html', 'body', '#root'];
      elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          (element as HTMLElement).style.setProperty('overflow-x', 'hidden', 'important');
          (element as HTMLElement).style.setProperty('overflow-y', 'auto', 'important');
          (element as HTMLElement).style.setProperty('scrollbar-width', 'none', 'important');
          (element as HTMLElement).style.setProperty('-ms-overflow-style', 'none', 'important');
        }
      });
      
      console.log('✅ Scrollbars hidden but scrolling enabled');
    } catch (error) {
      console.error('❌ Error force hiding scrollbars:', error);
    }
  }
}

// Export singleton instance
export const layoutFixer = LayoutFixer.getInstance();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    layoutFixer.initialize();
  });
  
  window.addEventListener('orientationchange', () => {
    layoutFixer.handleOrientationChange();
  });
  
  window.addEventListener('resize', () => {
    layoutFixer.handleWindowResize();
  });
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).layoutFixer = layoutFixer;
}
