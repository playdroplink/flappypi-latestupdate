// Pi OAuth Callback Page
// Handles the OAuth redirect from Pi Network and processes the access token

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  parseTokenFromHash, 
  verifyState, 
  saveAccessToken, 
  fetchPiUser, 
  savePiUser,
  logout 
} from '../services/piAuth';

const PiCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing Pi OAuth callback...');
        
        // Parse token from URL hash
        const token = parseTokenFromHash();
        
        if (!token) {
          throw new Error('No access token found in URL hash');
        }
        
        console.log('✅ Token parsed from hash:', { 
          token_type: token.token_type, 
          expires_in: token.expires_in 
        });
        
        // Verify state to prevent CSRF attacks
        if (!verifyState(token.state)) {
          throw new Error('State verification failed - possible CSRF attack');
        }
        
        console.log('✅ State verified successfully');
        
        // Save access token
        saveAccessToken(token);
        console.log('✅ Access token saved');
        
        // Fetch user information from Pi API
        console.log('🔄 Fetching user information from Pi API...');
        const user = await fetchPiUser(token.access_token);
        console.log('✅ User information fetched:', user);
        
        // Save user information
        savePiUser(user);
        console.log('✅ User information saved');
        
        setStatus('success');
        
        // Redirect to dashboard/home page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
        
      } catch (err) {
        console.error('❌ Error processing OAuth callback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
        
        // Clear any partial data
        logout();
        
        // Redirect to home page after a longer delay on error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-800">Signing you in...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-green-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Sign-in Successful!</h2>
            <p className="text-gray-600">Redirecting you to the dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Sign-in Failed</h2>
            <p className="text-gray-600">{error || 'An error occurred during sign-in.'}</p>
            <p className="text-sm text-gray-500">You will be redirected to the home page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PiCallback;
