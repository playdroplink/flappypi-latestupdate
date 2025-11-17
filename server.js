import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced CORS configuration for Pi Browser
const corsOptions = {
  origin: [
    'https://flappypi.fun',
    'https://flappypi.fun/flappypiofficial',
    'https://flappypiofficial-gsiesfbgc-flappypis-projects.vercel.app',
    'https://flappypiofficial-gvxqbrplm-flappypis-projects.vercel.app',
    'https://flappypiofficial.vercel.app',
    'https://flappypi4340.pinet.com',
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

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API routes - Import as ES module
import piRoutes from './api/pi/index.js';
app.use('/api/pi', piRoutes);

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
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
}); 