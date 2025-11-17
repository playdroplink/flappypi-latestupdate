// Payment Completion Endpoint - EXACT DEMO IMPLEMENTATION
// This endpoint handles payment completion on the server side following the exact demo pattern

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, txid } = req.body;

    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'Payment ID and txid are required' });
    }

    console.log('Completing payment:', { paymentId, txid });

    // Implement your logic here - EXACT DEMO PATTERN
    // e.g. verify the transaction, deliver the item to the user, etc.
    console.log('Payment completed with txid:', txid);

    // Complete the payment on Pi Network - EXACT DEMO IMPLEMENTATION
    const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key tpatf1d3qvgrccnjljlmvupr3umgckz2ce1wledeo9jb1cizaaytpu4t461kzrgy`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    if (!completeResponse.ok) {
      return res.status(400).json({ error: 'Failed to complete payment' });
    }

    const completeResult = await completeResponse.json();
    console.log('Payment completed:', completeResult);

    return res.status(200).json({ 
      message: `Completed the payment ${paymentId}`,
      payment: completeResult
    });

  } catch (error) {
    console.error('Payment completion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 