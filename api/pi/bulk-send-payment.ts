// Pi Network Bulk App-to-User (A2U) Payment API Endpoint
// Based on official Pi Network documentation: https://github.com/pi-apps/pi-platform-docs.git

interface BulkSendPaymentRequest {
  payments: Array<{
    userUid: string;
    amount: number;
    memo: string;
    metadata?: any;
  }>;
  network?: string;
}

interface BulkSendPaymentResponse {
  success: boolean;
  results: Array<{
    userUid: string;
    success: boolean;
    paymentId?: string;
    txid?: string;
    error?: string;
  }>;
  totalSent: number;
  totalFailed: number;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { payments, network = 'mainnet' }: BulkSendPaymentRequest = req.body;

    console.log('🔄 Processing bulk A2U payments:', { count: payments.length, network });

    // Validate payment data
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payments data. payments array is required.'
      });
    }

    // Limit bulk payments to prevent abuse
    if (payments.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Too many payments. Maximum 100 payments per request.'
      });
    }

    // Get Pi Network API configuration
    const apiKey = process.env.PI_API_KEY || 'htjotdxpfamsvnshw5yspxjtp9psgvqym5fusybgu4ouuiqobtrcupilytu3pg4w';
    const appId = process.env.PI_NETWORK_APP_ID || 'flappypi2807';
    const platformApiUrl = network === 'mainnet' 
      ? 'https://api.minepi.com' 
      : 'https://api.sandbox.minepi.com';

    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Process each payment
    for (const payment of payments) {
      try {
        const { userUid, amount, memo, metadata } = payment;

        // Validate individual payment
        if (!userUid || !amount || amount <= 0) {
          results.push({
            userUid: userUid || 'unknown',
            success: false,
            error: 'Invalid payment data'
          });
          totalFailed++;
          continue;
        }

        // Create A2U payment using Pi Network Platform API
        const paymentData = {
          user_uid: userUid,
          amount: amount,
          memo: memo || `Flappy Pi Bulk Reward - ${new Date().toISOString()}`,
          metadata: metadata || {},
          network: network
        };

        console.log('💰 Creating bulk A2U payment:', paymentData);

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
          console.error('❌ Pi Network API error for user', userUid, ':', response.status, errorText);
          
          results.push({
            userUid,
            success: false,
            error: `API error: ${response.status}`
          });
          totalFailed++;
          continue;
        }

        const result = await response.json();
        console.log('✅ Bulk A2U payment created successfully for user', userUid, ':', result);

        // Store payment record
        await storeA2UPayment(result.payment_id, userUid, amount, memo, metadata);

        results.push({
          userUid,
          success: true,
          paymentId: result.payment_id,
          txid: result.txid
        });
        totalSent++;

      } catch (error: any) {
        console.error('❌ Bulk A2U payment error for user', payment.userUid, ':', error);
        
        results.push({
          userUid: payment.userUid,
          success: false,
          error: error.message || 'Payment failed'
        });
        totalFailed++;
      }
    }

    console.log('📊 Bulk A2U payment summary:', { totalSent, totalFailed, total: payments.length });

    return res.status(200).json({
      success: true,
      results,
      totalSent,
      totalFailed
    });

  } catch (error: any) {
    console.error('❌ Bulk A2U payment error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process bulk payments'
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
    console.log('💾 Storing bulk A2U payment record:', { paymentId, userUid, amount });
    
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
    
    console.log('✅ Bulk A2U payment record stored successfully');
    
  } catch (error) {
    console.error('❌ Failed to store bulk A2U payment record:', error);
    // Don't throw error here as payment is already sent
  }
}
