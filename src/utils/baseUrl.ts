// Base URL detection utility for Pi Browser compatibility
export interface BaseUrlConfig {
  apiUrl: string;
  appUrl: string;
  isDevelopment: boolean;
  isPiBrowser: boolean;
  isSandbox: boolean;
}

class BaseUrlManager {
  private config: BaseUrlConfig | null = null;

  getConfig(): BaseUrlConfig {
    if (this.config) {
      return this.config;
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
    const isPiBrowser = navigator.userAgent.includes('Pi Browser');
    const isSandbox = hostname.includes('sandbox.minepi.com');

    let apiUrl: string;
    let appUrl: string;

    if (isDevelopment) {
      // Development environment - use HTTP for localhost
      apiUrl = `http://${hostname}:8080`;
      appUrl = `http://${hostname}:8080`;
    } else if (isSandbox) {
      // Pi Browser sandbox environment
      apiUrl = 'https://www.flappypi.xyz/flappypiofficial';
      appUrl = 'https://www.flappypi.xyz/flappypiofficial';
    } else {
      // Production environment
      apiUrl = 'https://www.flappypi.xyz/flappypiofficial';
      appUrl = 'https://www.flappypi.xyz/flappypiofficial';
    }

    this.config = { apiUrl, appUrl, isDevelopment, isPiBrowser, isSandbox };
    return this.config;
  }

  getApiUrl(): string {
    return this.getConfig().apiUrl;
  }

  getAppUrl(): string {
    return this.getConfig().appUrl;
  }

  isDevelopment(): boolean {
    return this.getConfig().isDevelopment;
  }

  isPiBrowser(): boolean {
    return this.getConfig().isPiBrowser;
  }

  isSandbox(): boolean {
    return this.getConfig().isSandbox;
  }
}

export const baseUrlManager = new BaseUrlManager();
export const getBaseUrl = () => baseUrlManager.getConfig();
export const getApiUrl = () => baseUrlManager.getApiUrl();
export const getAppUrl = () => baseUrlManager.getAppUrl(); 