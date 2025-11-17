const express = require('express');
const axios = require('axios');
const router = express.Router();

const PI_API_URL = 'https://api.minepi.com/v2';
const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;

// Validate API key is set
if (!PI_SERVER_API_KEY) {
  console.error('⚠️  PI_SERVER_API_KEY is not set in environment variables');
}

// 1. Verify Pi user access token
router.post('/verify-pi-user', async (req, res) => {
  const { accessToken } = req.body;
  try {
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await axios.get(`${PI_API_URL}/me`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User verified:', response.data.uid);
    res.json(response.data); // UserDTO
  } catch (err) {
    console.error('❌ User verification failed:', err.message);
    res.status(401).json({ error: 'Invalid Pi access token', details: err.message });
  }
});

// 2. Approve a payment (Phase 1)
router.post('/approve-payment', async (req, res) => {
  const { paymentId } = req.body;
  try {
    if (!paymentId) {
      console.error('❌ Payment ID missing in approval request');
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    if (!PI_SERVER_API_KEY) {
      console.error('❌ CRITICAL: PI_SERVER_API_KEY not set in backend environment');
      return res.status(500).json({ 
        error: 'Server not configured: PI_SERVER_API_KEY missing',
        message: 'Backend payment system not properly configured'
      });
    }

    console.log('📍 PHASE 1 STARTED: Approving payment:', paymentId);
    console.log(`   API Key Present: Yes (${PI_SERVER_API_KEY.substring(0, 10)}...)`);
    console.log(`   Calling: ${PI_API_URL}/payments/${paymentId}/approve`);

    // CRITICAL: Make the actual Pi API call to approve
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/approve`,
      {}, // Empty body for approve endpoint (CRITICAL: Required by Pi API)
      {
        headers: {
          Authorization: `Key ${PI_SERVER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout for Pi API
      }
    );

    console.log('✅ PHASE 1 COMPLETE: Payment approved by Pi Network');
    console.log(`   Response Status: ${response.status}`);
    console.log(`   Payment UID: ${response.data?.identifier || 'N/A'}`);
    
    // CRITICAL: Return success response so Pi SDK can proceed to Phase 2
    res.status(200).json({ 
      success: true, 
      approved: true,
      payment: response.data,
      message: 'Payment successfully approved by Pi Network'
    });
  } catch (err) {
    console.error('❌ PHASE 1 FAILED: Payment approval error');
    console.error(`   Status: ${err.response?.status}`);
    console.error(`   Message: ${err.message}`);
    
    if (err.response?.status === 404) {
      console.error('   → Payment ID not found or already processed');
    } else if (err.response?.status === 401) {
      console.error('   → Invalid or expired API key');
      console.error('   → Get new key from: https://developer.minepi.com');
    } else if (err.response?.status === 400) {
      console.error('   → Bad payment request');
      console.error(`   → Details: ${JSON.stringify(err.response?.data)}`);
    }
    
    res.status(err.response?.status || 500).json({
      error: 'Payment approval failed',
      status: err.response?.status,
      details: err.response?.data || err.message,
      apiError: err.response?.data?.error_code || 'UNKNOWN'
    });
  }
});

// 3. Complete a payment (Phase 3)
router.post('/complete-payment', async (req, res) => {
  const { paymentId, txid } = req.body;
  try {
    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'Payment ID and transaction ID are required' });
    }

    if (!PI_SERVER_API_KEY) {
      return res.status(500).json({ error: 'Server not configured: PI_SERVER_API_KEY missing' });
    }

    console.log('🔄 Completing payment:', paymentId, 'with txid:', txid);

    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          Authorization: `Key ${PI_SERVER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // CRITICAL: Validate response before confirming
    if (response.status === 200 && response.data) {
      console.log('✅ Payment completed successfully:', paymentId);
      return res.json({ success: true, payment: response.data });
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (err) {
    console.error('❌ Payment completion failed:', err.response?.status, err.message);
    
    // Critical: Do NOT acknowledge payment if completion fails
    const statusCode = err.response?.status || 400;
    res.status(statusCode).json({
      error: 'Payment completion failed',
      details: err.response?.data || err.message,
      message: 'Payment was not completed. Item should NOT be delivered.'
    });
  }
});

// 4. Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!PI_SERVER_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 