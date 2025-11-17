// Cancelled Payment Endpoint - EXACT DEMO IMPLEMENTATION
// This endpoint handles cancelled payments following the exact demo pattern

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    console.log('Handling cancelled payment:', paymentId);

    // Implement your logic here - EXACT DEMO PATTERN
    // e.g. mark the order record to cancelled, etc.
    console.log('Payment cancelled:', paymentId);

    return res.status(200).json({ 
      message: `Cancelled the payment ${paymentId}`,
      paymentId
    });

  } catch (error) {
    console.error('Cancelled payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 