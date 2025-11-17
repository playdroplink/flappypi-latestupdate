// User Sign Out Endpoint - Based on official demo implementation
// This endpoint handles Pi Network user sign out

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear user session
    // In a real implementation, you would clear the session from your database
    
    return res.status(200).json({ message: 'User signed out' });

  } catch (error) {
    console.error('Sign out error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 