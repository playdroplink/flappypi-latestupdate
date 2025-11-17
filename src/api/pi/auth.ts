// Pi Network Authentication API Endpoint
// Based on the official Pi Network demo implementation
// https://github.com/playdroplink/demo.git

// This is a server-side API endpoint for Pi authentication verification
// Use this with your backend server (Express.js, etc.)

interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: any;
}

// Express.js middleware function for Pi authentication
export function piAuthMiddleware(req: any, res: any, next: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  handlePiAuth(req, res);
}

// Main authentication handler
export async function handlePiAuth(req: any, res: any) {
  try {
    const { authResult }: { authResult: AuthResult } = req.body;

    // Validate request body
    if (!authResult || !authResult.accessToken || !authResult.user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body: missing authResult, accessToken, or user data'
      });
    }

    console.log('🔐 Processing Pi authentication request...');
    console.log('👤 User:', authResult.user.username);
    console.log('🔑 Access Token:', authResult.accessToken ? 'Present' : 'Missing');

    // Step 1: Verify the access token with Pi Platform API
    console.log('🔍 Verifying access token with Pi Platform API...');
    
    const verificationResponse = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authResult.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!verificationResponse.ok) {
      console.error('❌ Token verification failed:', verificationResponse.status, verificationResponse.statusText);
      return res.status(401).json({
        success: false,
        error: `Token verification failed: ${verificationResponse.status} ${verificationResponse.statusText}`
      });
    }

    const verifiedUserData = await verificationResponse.json();
    console.log('✅ Token verification successful');

    // Step 2: Verify UID matches (security check)
    if (verifiedUserData.uid !== authResult.user.uid) {
      console.error('❌ UID mismatch:', verifiedUserData.uid, 'vs', authResult.user.uid);
      return res.status(401).json({
        success: false,
        error: 'User verification failed: UID mismatch'
      });
    }

    console.log('✅ User verification successful:', verifiedUserData.username);

    // Step 3: Store user data (in a real app, you'd save to database)
    // For demo purposes, we'll just return success
    const userData = {
      uid: verifiedUserData.uid,
      username: verifiedUserData.username,
      accessToken: authResult.accessToken,
      verified: true,
      verifiedAt: new Date().toISOString()
    };

    console.log('🎉 Pi authentication completed successfully!');

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user: userData
    });

  } catch (error) {
    console.error('❌ Pi authentication API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return res.status(500).json({
      success: false,
      error: `Authentication failed: ${errorMessage}`
    });
  }
}

// Client-side function to call the auth endpoint
export async function verifyPiAuthOnServer(authResult: AuthResult, apiUrl: string = '/api/pi/auth'): Promise<ApiResponse> {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authResult })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Failed to verify auth on server:', error);
    return {
      success: false,
      error: 'Failed to verify authentication on server'
    };
  }
}
