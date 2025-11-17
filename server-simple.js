import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Pi Network Mainnet Configuration
const PI_MAINNET_CONFIG = {
  validationKey: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce',
  apiKey: '3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc',
  appId: 'flappypi2807',
  domain: 'flappypi.fun',
  pinetSubdomain: 'flappypi2807.pinet.com'
};

// Enhanced CORS configuration for Pi Browser
const corsOptions = {
  origin: [
    'https://flappypi.fun',
    'https://flappypi.fun/flappypiofficial',
    'https://flappypiofficial-gsiesfbgc-flappypis-projects.vercel.app',
    'https://flappypiofficial-gvxqbrplm-flappypis-projects.vercel.app',
    'https://flappypiofficial.vercel.app',
    'https://flappypi4340.pinet.com',
    'https://flappypi2807.pinet.com',
    'https://*.pinet.com',
    'https://*.minepi.com',
    'https://pinet.com',
    'https://minepi.com',
    'https://localhost:8080',
    'https://localhost:3000',
    'https://localhost:3001',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://192.168.1.20:8080',
    'https://192.168.1.20:3000',
    'https://192.168.1.20:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Pi-App-Id', 'Pi-Validation-Key']
};

app.use(cors(corsOptions));

// Enhanced security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Pi Network Authentication API - EXACT DEMO PATTERN
app.post('/api/pi/user/signin', async (req, res) => {
  try {
    const { authResult } = req.body;

    // Validate request body
    if (!authResult || !authResult.accessToken || !authResult.user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body: missing authResult, accessToken, or user data'
      });
    }

    console.log('🔐 Processing Pi authentication request...');
    console.log('👤 User:', authResult.user.username);
    console.log('🔑 Access Token:', authResult.accessToken ? 'Present' : 'Missing');

    // EXACT DEMO PATTERN: Verify the user's access token with the /me endpoint
    console.log('🔍 Verifying access token with Pi Platform API...');
    
    try {
      // Use the mainnet API key to verify the access token
      const verificationResponse = await fetch('https://api.minepi.com/v2/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authResult.accessToken}`,
          'Content-Type': 'application/json',
          'Pi-App-Id': PI_MAINNET_CONFIG.appId,
          'Pi-Validation-Key': PI_MAINNET_CONFIG.validationKey
        }
      });

      if (!verificationResponse.ok) {
        console.error('❌ Token verification failed:', verificationResponse.status, verificationResponse.statusText);
        return res.status(401).json({
          success: false,
          error: `Invalid access token: ${verificationResponse.status} ${verificationResponse.statusText}`
        });
      }

      const verifiedUserData = await verificationResponse.json();
      console.log('✅ Token verification successful');
      console.log('🔍 Verified user data:', verifiedUserData);

      // Verify UID matches (security check)
      if (verifiedUserData.uid !== authResult.user.uid) {
        console.error('❌ UID mismatch:', verifiedUserData.uid, 'vs', authResult.user.uid);
        return res.status(401).json({
          success: false,
          error: 'User verification failed: UID mismatch'
        });
      }

      console.log('✅ User verification successful:', verifiedUserData.username);

      // EXACT DEMO PATTERN: Store user data (in a real app, you'd save to database)
      const userData = {
        uid: verifiedUserData.uid,
        username: verifiedUserData.username,
        accessToken: authResult.accessToken,
        verified: true,
        verifiedAt: new Date().toISOString()
      };

      console.log('🎉 Pi authentication completed successfully!');

      // Return success response - EXACT DEMO PATTERN
      return res.status(200).json({
        success: true,
        message: "User signed in",
        user: userData
      });

    } catch (verificationError) {
      console.error('❌ Token verification error:', verificationError);
      return res.status(401).json({
        success: false,
        error: "Invalid access token"
      });
    }

  } catch (error) {
    console.error('❌ Pi authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Sign out endpoint
app.get('/api/pi/user/signout', async (req, res) => {
  try {
    console.log('👋 User signed out');
    res.status(200).json({ message: "User signed out" });
  } catch (error) {
    console.error('❌ Sign out failed:', error);
    res.status(500).json({
      success: false,
      error: 'Sign out failed'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start HTTP server for development
app.listen(PORT, () => {
  console.log(`🚀 Flappy Pi Server running on http://localhost:${PORT}`);
  console.log(`📱 Pi Browser compatible`);
  console.log(`🔧 Development mode - HTTP server`);
  console.log(`🔐 Pi authentication API ready at /api/pi/user/signin`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
