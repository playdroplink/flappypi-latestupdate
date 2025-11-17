// Pi Network Payment Status API
// This endpoint gets the status of a specific payment

const PI_API_KEY = process.env.PI_API_KEY || "3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc";
const PI_API_BASE = 'https://api.minepi.com/v2';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment ID is required' 
      });
    }

    console.log('📊 Getting payment status for:', paymentId);

    // Call Pi Network API to get payment status
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
        error: 'Failed to get payment status from Pi Network' 
      });
    }

    const paymentData = await piResponse.json();
    console.log('📊 Payment status from Pi Network:', paymentData);

    // Extract payment information
    const payment = paymentData.payment;
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const status = {
      paymentId: payment.id,
      status: payment.status,
      approved: payment.developer_approved || false,
      completed: payment.developer_completed || false,
      amount: payment.amount,
      memo: payment.memo,
      transaction: payment.transaction,
      verified: payment.developer_approved && payment.developer_completed
    };

    console.log('✅ Payment status retrieved:', status);
    
    return res.status(200).json({
      success: true,
      ...status
    });

  } catch (error: any) {
    console.error('❌ Payment status error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error while getting payment status' 
    });
  }
}
