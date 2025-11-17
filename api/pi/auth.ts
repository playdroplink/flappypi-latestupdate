// Pi Network Authentication API
// Following official Pi demo patterns for backend authentication

interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface AuthResult {
  success: boolean;
  user?: PiUser;
  error?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { authResult }: { authResult: any } = req.body;

    // Validate request body
    if (!authResult || !authResult.accessToken || !authResult.user) {
      return res.status(400).json({
        success: false,
        error: 'Missing authResult, accessToken, or user data'
      });
    }

    const { accessToken, user } = authResult;

    console.log('🔐 Processing Pi authentication request...');
    console.log('👤 User:', user.username);

    // Verify the access token with Pi Platform API (following official documentation)
    const platformApiUrl = process.env.PLATFORM_API_URL || 'https://api.testnet.minepi.com';
    const verificationResponse = await fetch(`${platformApiUrl}/v2/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!verificationResponse.ok) {
      console.error('❌ Token verification failed:', verificationResponse.status);
      return res.status(401).json({
        success: false,
        error: `Token verification failed: ${verificationResponse.status}`
      });
    }

    const verifiedUserData = await verificationResponse.json();
    console.log('✅ Token verification successful');

    // Verify UID matches (security check)
    if (verifiedUserData.uid !== user.uid) {
      console.error('❌ UID mismatch:', verifiedUserData.uid, 'vs', user.uid);
      return res.status(401).json({
        success: false,
        error: 'User verification failed: UID mismatch'
      });
    }

    console.log('✅ User verification successful:', verifiedUserData.username);

    // In a real app, you would save user data to your database
    // For demo purposes, we'll just return the verified user data
    const userData: PiUser = {
      uid: verifiedUserData.uid,
      username: verifiedUserData.username,
      accessToken: accessToken
    };

    return res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error: any) {
    console.error('❌ Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Authentication failed'
    });
  }
}
