/**
 * Service Worker Manager for Pi Browser Compatibility
 * Handles service worker registration and unregistration for Pi Browser
 */

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private isPiBrowser: boolean;

  private constructor() {
    this.isPiBrowser = this.detectPiBrowser();
  }

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  private detectPiBrowser(): boolean {
    return (
      window.location.hostname.includes('pi-browser') ||
      window.navigator.userAgent.includes('PiBrowser') ||
      window.navigator.userAgent.includes('Pi Network')
    );
  }

  /**
   * Check if service workers are supported
   */
  public isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Get all active service worker registrations
   */
  public async getRegistrations(): Promise<readonly ServiceWorkerRegistration[]> {
    if (!this.isSupported()) {
      return [];
    }

    try {
      return await navigator.serviceWorker.getRegistrations();
    } catch (error) {
      console.warn('Failed to get service worker registrations:', error);
      return [];
    }
  }

  /**
   * Unregister all service workers (useful for Pi Browser testing)
   */
  public async unregisterAll(): Promise<boolean> {
    if (!this.isSupported()) {
      return true;
    }

    try {
      const registrations = await this.getRegistrations();
      const unregisterPromises = registrations.map(registration => 
        registration.unregister()
      );
      
      await Promise.all(unregisterPromises);
      console.log('✅ All service workers unregistered successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to unregister service workers:', error);
      return false;
    }
  }

  /**
   * Check if service workers might interfere with Pi Browser
   */
  public async checkPiBrowserCompatibility(): Promise<{
    hasServiceWorkers: boolean;
    mightInterfere: boolean;
    recommendations: string[];
  }> {
    const registrations = await this.getRegistrations();
    const hasServiceWorkers = registrations.length > 0;
    const mightInterfere = this.isPiBrowser && hasServiceWorkers;

    const recommendations: string[] = [];
    
    if (mightInterfere) {
      recommendations.push('Service workers detected in Pi Browser - consider unregistering for testing');
      recommendations.push('Use ServiceWorkerManager.unregisterAll() to remove service workers');
    }

    if (this.isPiBrowser && !hasServiceWorkers) {
      recommendations.push('No service workers detected - Pi Browser should work optimally');
    }

    return {
      hasServiceWorkers,
      mightInterfere,
      recommendations
    };
  }

  /**
   * Register a service worker with Pi Browser compatibility checks
   */
  public async registerServiceWorker(scriptURL: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Service workers not supported in this environment');
      return null;
    }

    if (this.isPiBrowser) {
      console.warn('⚠️ Registering service worker in Pi Browser - monitor for conflicts');
    }

    try {
      const registration = await navigator.serviceWorker.register(scriptURL, options);
      console.log('✅ Service worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Failed to register service worker:', error);
      return null;
    }
  }

  /**
   * Initialize service worker management for Pi Browser
   */
  public async initialize(): Promise<void> {
    console.log('🔧 Initializing Service Worker Manager...');
    
    const compatibility = await this.checkPiBrowserCompatibility();
    
    if (compatibility.mightInterfere) {
      console.warn('⚠️ Service workers detected in Pi Browser environment');
      console.log('💡 Recommendations:', compatibility.recommendations);
    } else {
      console.log('✅ Service worker environment is compatible with Pi Browser');
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = ServiceWorkerManager.getInstance();
