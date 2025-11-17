// Pi Network Authentication Backend - Following demo.pi pattern
// This endpoint verifies Pi authentication tokens

const express = require('express');
const router = express.Router();

// EXACT DEMO.PI PATTERN: Backend verification endpoint
router.post('/user/signin', async (req, res) => {
  const auth = req.body.authResult;
  
  if (!auth || !auth.accessToken) {
    return res.status(400).json({ error: "Missing access token" });
  }
  
  try {
    console.log('🔍 Verifying Pi authentication token...');
    
    // EXACT DEMO.PI PATTERN: Verify the user's access token with the /me endpoint
    const me = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${auth.accessToken}` }
    });
    
    if (!me.ok) {
      console.error('❌ Token verification failed:', me.status, me.statusText);
      return res.status(401).json({ error: "Invalid access token" });
    }
    
    const userData = await me.json();
    console.log('✅ Token verification successful:', userData);
    
    return res.status(200).json({ 
      success: true,
      message: "User signed in successfully",
      user: userData
    });
    
  } catch (err) {
    console.error('❌ Backend verification error:', err);
    return res.status(500).json({ error: "Backend verification failed" });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Pi Network authentication backend is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
