// Incomplete Payment Endpoint - EXACT DEMO IMPLEMENTATION
// This endpoint handles incomplete payments found during authentication following the exact demo pattern

// Vercel serverless function export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payment } = req.body;

    if (!payment) {
      return res.status(400).json({ error: 'Payment data is required' });
    }

    const paymentId = payment.identifier;
    const txid = payment.transaction && payment.transaction.txid;
    const txURL = payment.transaction && payment.transaction._link;

    console.log('Handling incomplete payment:', { paymentId, txid, txURL });

    // Implement your logic here - EXACT DEMO PATTERN
    // e.g. verifying the payment, delivering the item to the user, etc.
    console.log('Incomplete payment details:', payment);

    if (txid && txURL) {
      // Check the transaction on the Pi blockchain - EXACT DEMO IMPLEMENTATION
      try {
        const horizonResponse = await fetch(txURL);
        if (horizonResponse.ok) {
          const horizonData = await horizonResponse.json();
          console.log('Blockchain transaction data:', horizonData);
        }
      } catch (error) {
        console.error('Failed to verify blockchain transaction:', error);
      }
    }

    // Complete the payment on Pi Network if we have a txid - EXACT DEMO IMPLEMENTATION
    if (txid) {
      const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Key tpatf1d3qvgrccnjljlmvupr3umgckz2ce1wledeo9jb1cizaaytpu4t461kzrgy`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      });

      if (completeResponse.ok) {
        const completeResult = await completeResponse.json();
        console.log('Incomplete payment completed:', completeResult);
      }
    }

    return res.status(200).json({ 
      message: `Handled the incomplete payment ${paymentId}`,
      paymentId,
      txid
    });

  } catch (error) {
    console.error('Incomplete payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 