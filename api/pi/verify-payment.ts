// Pi Network Payment Verification API
// This endpoint verifies payment completion with Pi Network

const PI_API_KEY = process.env.PI_API_KEY || "3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc";
const PI_API_BASE = 'https://api.minepi.com/v2';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { paymentId, txid, amount, itemName, itemType } = req.body;

    // Validate required fields
    if (!paymentId || !txid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment ID and transaction ID are required' 
      });
    }

    console.log('🔍 Verifying payment:', { paymentId, txid, amount, itemName, itemType });

    // Call Pi Network API to verify payment
    const piResponse = await fetch(`${PI_API_BASE}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!piResponse.ok) {
      console.error('❌ Pi Network API error:', piResponse.status, piResponse.statusText);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to verify payment with Pi Network' 
      });
    }

    const paymentData = await piResponse.json();
    console.log('📊 Payment data from Pi Network:', paymentData);

    // Verify payment status
    const isApproved = paymentData.payment?.developer_approved || false;
    const isCompleted = paymentData.payment?.developer_completed || false;
    const transactionId = paymentData.payment?.transaction?.txid;

    // Verify transaction ID matches
    const txidMatches = transactionId === txid;

    if (isApproved && isCompleted && txidMatches) {
      console.log('✅ Payment verified successfully');
      return res.status(200).json({
        success: true,
        verified: true,
        paymentId,
        txid,
        status: 'completed'
      });
    } else {
      console.log('❌ Payment verification failed:', {
        isApproved,
        isCompleted,
        txidMatches,
        expectedTxid: txid,
        actualTxid: transactionId
      });
      
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment not properly approved and completed'
      });
    }

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during payment verification' 
    });
  }
}
