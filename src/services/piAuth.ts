// Pi Network OAuth Authentication Service
// Implements OAuth implicit flow for Pi Sign-in
// Documentation: https://github.com/pi-apps/pi-platform-docs/blob/master/pi-sign-in.md

const PI_AUTHORIZE_URL = 'https://accounts.pinet.com/oauth/authorize';
const PI_API_BASE = 'https://api.minepi.com/v2';

export interface PiOAuthUser {
  uid: string;
  username: string;
  [key: string]: any;
}

export interface PiOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  state?: string;
}

export interface PiOAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes?: string[];
}

/**
 * Get the OAuth configuration from environment variables
 */
export const getOAuthConfig = (): PiOAuthConfig => {
  const clientId = import.meta.env.VITE_PI_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_PI_REDIRECT_URI;
  const redirectUriLocal = import.meta.env.VITE_PI_REDIRECT_URI_LOCAL;
  
  if (!clientId) {
    throw new Error('VITE_PI_CLIENT_ID environment variable is not set');
  }
  
  // Auto-detect local development and use appropriate redirect URI
  let finalRedirectUri = redirectUri;
  if (!redirectUri) {
    throw new Error('VITE_PI_REDIRECT_URI environment variable is not set');
  }
  
  // Check if running on localhost
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost && redirectUriLocal) {
      finalRedirectUri = redirectUriLocal;
    }
  }
  
  return {
    clientId,
    redirectUri: finalRedirectUri,
    scopes: ['username', 'payments'] // Default scopes
  };
};

/**
 * Build the Pi OAuth authorization URL
 */
export const buildAuthUrl = (config: PiOAuthConfig, state: string): string => {
  const url = new URL(PI_AUTHORIZE_URL);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scopes?.join(' ') || 'username');
  url.searchParams.set('state', state);
  return url.toString();
};

/**
 * Login with Pi Network OAuth
 * Redirects the user to the Pi authorization page
 */
export const loginWithPi = (scopes?: string[]): void => {
  try {
    const config = getOAuthConfig();
    
    // Override default scopes if provided
    const finalConfig = scopes ? { ...config, scopes } : config;
    
    // Generate random state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('pi_oauth_state', state);
    
    // Build and navigate to authorization URL
    const authUrl = buildAuthUrl(finalConfig, state);
    window.location.assign(authUrl);
  } catch (error) {
    console.error('Error initiating Pi OAuth login:', error);
    throw error;
  }
};

/**
 * Parse the access token from the URL fragment
 */
export const parseTokenFromHash = (): PiOAuthToken | null => {
  const hash = window.location.hash.substring(1); // Remove the '#'
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get('access_token');
  const tokenType = params.get('token_type');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');
  
  if (!accessToken) {
    return null;
  }
  
  return {
    access_token: accessToken,
    token_type: tokenType || 'Bearer',
    expires_in: expiresIn ? parseInt(expiresIn) : 3600,
    state: state || undefined
  };
};

/**
 * Verify the state parameter to prevent CSRF attacks
 */
export const verifyState = (state: string | undefined): boolean => {
  if (!state) {
    console.warn('No state parameter in OAuth callback');
    return false;
  }
  
  const storedState = sessionStorage.getItem('pi_oauth_state');
  sessionStorage.removeItem('pi_oauth_state');
  
  if (!storedState) {
    console.warn('No stored state found');
    return false;
  }
  
  return state === storedState;
};

/**
 * Save the access token to localStorage
 */
export const saveAccessToken = (token: PiOAuthToken): void => {
  const expiresAt = Date.now() + (token.expires_in * 1000);
  
  localStorage.setItem('pi_oauth_access_token', token.access_token);
  localStorage.setItem('pi_oauth_token_type', token.token_type);
  localStorage.setItem('pi_oauth_expires_at', expiresAt.toString());
};

/**
 * Get the access token from localStorage
 */
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem('pi_oauth_access_token');
  const expiresAt = localStorage.getItem('pi_oauth_expires_at');
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired
  if (expiresAt) {
    const now = Date.now();
    if (now > parseInt(expiresAt)) {
      console.warn('Pi OAuth access token has expired');
      logout();
      return null;
    }
  }
  
  return token;
};

/**
 * Fetch user information from Pi API using the access token
 */
export const fetchPiUser = async (accessToken: string): Promise<PiOAuthUser> => {
  const response = await fetch(`${PI_API_BASE}/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }
  
  const user = await response.json();
  return user;
};

/**
 * Save user information to localStorage
 */
export const savePiUser = (user: PiOAuthUser): void => {
  localStorage.setItem('pi_oauth_user', JSON.stringify(user));
};

/**
 * Get user information from localStorage
 */
export const getPiUser = (): PiOAuthUser | null => {
  const userStr = localStorage.getItem('pi_oauth_user');
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated via OAuth
 */
export const isOAuthAuthenticated = (): boolean => {
  const token = getAccessToken();
  const user = getPiUser();
  return !!token && !!user;
};

/**
 * Logout from Pi OAuth
 */
export const logout = (): void => {
  localStorage.removeItem('pi_oauth_access_token');
  localStorage.removeItem('pi_oauth_token_type');
  localStorage.removeItem('pi_oauth_expires_at');
  localStorage.removeItem('pi_oauth_user');
  sessionStorage.removeItem('pi_oauth_state');
  console.log('Logged out from Pi OAuth');
};

/**
 * Use Pi SDK's signIn method if available (recommended approach)
 */
export const loginWithPiSDK = (scopes?: string[]): void => {
  try {
    if (typeof window === 'undefined' || !window.Pi) {
      console.warn('Pi SDK not available, falling back to plain OAuth');
      loginWithPi(scopes);
      return;
    }

    const config = getOAuthConfig();
    const finalConfig = scopes ? { ...config, scopes } : config;
    
    const state = crypto.randomUUID();
    sessionStorage.setItem('pi_oauth_state', state);
    
    // Use Pi SDK's signIn method
    window.Pi.signIn({
      clientId: finalConfig.clientId,
      redirectUri: finalConfig.redirectUri,
      scopes: finalConfig.scopes,
      state
    });
  } catch (error) {
    console.error('Error initiating Pi SDK login:', error);
    throw error;
  }
};
