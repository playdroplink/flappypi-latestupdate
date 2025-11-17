// Pi Network Payment Approval API
// Handles payment approval following official Pi Platform API documentation
// Reference: https://github.com/pi-apps/pi-platform-docs

// Payment approval handler for Pi Network
// Compatible with Vercel serverless functions

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body || {};

    console.log('🔍 [PI API] Processing payment approval:', { paymentId });

    // Validate required fields
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: paymentId'
      });
    }

    // Get Server API Key from environment
    const PI_API_KEY = process.env.PI_API_KEY || process.env.VITE_PI_SERVER_API_KEY;
    if (!PI_API_KEY) {
      console.error('❌ [PI API] Server API Key not configured');
      return res.status(500).json({
        success: false,
        error: 'Server API Key not configured'
      });
    }

    // Determine API URL based on sandbox mode
    const isSandbox = process.env.PI_SANDBOX_MODE === 'true' || 
                      process.env.VITE_PI_SANDBOX_MODE === 'true';
    const API_BASE_URL = isSandbox 
      ? 'https://api.sandbox.minepi.com/v2'
      : 'https://api.minepi.com/v2';

    console.log('🔐 [PI API] Calling Pi Platform API:', {
      url: `${API_BASE_URL}/payments/${paymentId}/approve`,
      isSandbox,
      paymentId,
      apiKey: PI_API_KEY ? `${PI_API_KEY.substring(0, 10)}...` : 'NOT SET'
    });

    // Call Pi Platform API to approve payment
    // Reference: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PI API] Payment approval failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        paymentId
      });
      return res.status(response.status).json({
        success: false,
        error: `Payment approval failed: ${errorText || response.statusText}`
      });
    }

    const result = await response.json();
    console.log('✅ [PI API] Payment approved successfully:', {
      paymentId,
      result,
      apiUrl: API_BASE_URL
    });

    return res.status(200).json({
      success: true,
      approved: true,
      paymentId,
      result
    });

  } catch (error: any) {
    console.error('❌ [MAINNET API] Payment approval failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Payment approval failed'
    });
  }
}