// User Sign In Endpoint - EXACT DEMO IMPLEMENTATION
// This endpoint handles Pi Network user authentication following the exact demo pattern

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { authResult } = req.body;

    if (!authResult || !authResult.accessToken || !authResult.user) {
      return res.status(400).json({ error: 'Invalid auth result' });
    }

    // Verify the user's access token with the /me endpoint - EXACT DEMO IMPLEMENTATION
    const meResponse = await fetch('https://api.minepi.com/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authResult.accessToken}`
      }
    });

    if (!meResponse.ok) {
      console.error('Pi API verification failed:', meResponse.status);
      return res.status(401).json({ error: 'Invalid access token' });
    }

    const meData = await meResponse.json();
    console.log('Pi user verified successfully:', meData);

    // Store user data in session or database
    // For now, we'll just return success
    // In a real implementation, you would store this in your database
    
    return res.status(200).json({ 
      message: 'User signed in',
      user: authResult.user
    });

  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 