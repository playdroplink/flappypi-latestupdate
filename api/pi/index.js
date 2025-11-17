// Pi API Health Check Endpoint
// Vercel serverless function format

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Health check endpoint
      return res.status(200).json({
        success: true,
        message: 'Pi API is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
          '/api/pi/auth',
          '/api/pi/approve-payment',
          '/api/pi/complete-payment',
          '/api/pi/cancel-payment',
          '/api/pi/verify-payment'
        ]
      });
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('❌ Pi API health check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
}
