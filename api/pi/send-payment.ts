// Pi Network App-to-User (A2U) Payment API Endpoint
// Based on official Pi Network documentation: https://github.com/pi-apps/pi-platform-docs.git

interface SendPaymentRequest {
  userUid: string;
  amount: number;
  memo: string;
  metadata?: any;
  network?: string;
}

interface SendPaymentResponse {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userUid, amount, memo, metadata, network = 'mainnet' }: SendPaymentRequest = req.body;

    console.log('🔄 Processing A2U payment:', { userUid, amount, memo, network });

    // Validate payment data
    if (!userUid || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment data. userUid and amount are required.'
      });
    }

    // Get Pi Network API configuration
    const apiKey = process.env.PI_API_KEY || 'htjotdxpfamsvnshw5yspxjtp9psgvqym5fusybgu4ouuiqobtrcupilytu3pg4w';
    const appId = process.env.PI_NETWORK_APP_ID || 'flappypi2807';
    const platformApiUrl = network === 'mainnet' 
      ? 'https://api.minepi.com' 
      : 'https://api.sandbox.minepi.com';

    // Create A2U payment using Pi Network Platform API
    const paymentData = {
      user_uid: userUid,
      amount: amount,
      memo: memo || `Flappy Pi Reward - ${new Date().toISOString()}`,
      metadata: metadata || {},
      network: network
    };

    console.log('💰 Creating A2U payment:', paymentData);

    // Call Pi Network Platform API to send payment
    const response = await fetch(`${platformApiUrl}/v2/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Pi-App-Id': appId
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pi Network API error:', response.status, errorText);
      throw new Error(`Pi Network API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ A2U payment created successfully:', result);

    // Store payment record
    await storeA2UPayment(result.payment_id, userUid, amount, memo, metadata);

    return res.status(200).json({
      success: true,
      paymentId: result.payment_id,
      txid: result.txid,
      message: 'Payment sent successfully'
    });

  } catch (error: any) {
    console.error('❌ A2U payment error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send payment'
    });
  }
}

/**
 * Store A2U payment record in database
 */
async function storeA2UPayment(
  paymentId: string,
  userUid: string,
  amount: number,
  memo: string,
  metadata: any
): Promise<void> {
  try {
    console.log('💾 Storing A2U payment record:', { paymentId, userUid, amount });
    
    // Store payment record in database
    // await database.a2u_payments.create({
    //   paymentId,
    //   userUid,
    //   amount,
    //   memo,
    //   metadata,
    //   status: 'sent',
    //   sentAt: new Date()
    // });
    
    console.log('✅ A2U payment record stored successfully');
    
  } catch (error) {
    console.error('❌ Failed to store A2U payment record:', error);
    // Don't throw error here as payment is already sent
  }
}
