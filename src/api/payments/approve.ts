// Payment Approval Endpoint - EXACT DEMO IMPLEMENTATION
// This endpoint handles payment approval on the server side following the exact demo pattern

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

    console.log('Approving payment:', paymentId);

    // Get payment details from Pi Network API - EXACT DEMO IMPLEMENTATION
    const paymentResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key tpatf1d3qvgrccnjljlmvupr3umgckz2ce1wledeo9jb1cizaaytpu4t461kzrgy`
      }
    });

    if (!paymentResponse.ok) {
      return res.status(400).json({ error: 'Failed to get payment details' });
    }

    const currentPayment = await paymentResponse.json();

    // Implement your logic here - EXACT DEMO PATTERN
    // e.g. creating an order record, reserve an item if the quantity is limited, etc.
    console.log('Payment details:', currentPayment);

    // Approve the payment on Pi Network - EXACT DEMO IMPLEMENTATION
    const approveResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key tpatf1d3qvgrccnjljlmvupr3umgckz2ce1wledeo9jb1cizaaytpu4t461kzrgy`,
        'Content-Type': 'application/json'
      }
    });

    if (!approveResponse.ok) {
      return res.status(400).json({ error: 'Failed to approve payment' });
    }

    const approveResult = await approveResponse.json();
    console.log('Payment approved:', approveResult);

    return res.status(200).json({ 
      message: `Approved the payment ${paymentId}`,
      payment: approveResult
    });

  } catch (error) {
    console.error('Payment approval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 