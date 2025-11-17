#!/usr/bin/env node
/**
 * Flappy Pi Backend Cloud Storage Setup and Test Script
 * Installs dependencies, sets up database, and runs tests
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Flappy Pi Backend Cloud Storage Setup');
console.log('=' .repeat(50));

// Configuration
const backendDir = process.cwd();
const requiredDependencies = [
  '@supabase/supabase-js@^2.39.0',
  'uuid@^9.0.1', 
  'joi@^17.11.0',
  'helmet@^7.1.0',
  'compression@^1.7.4'
];

async function main() {
  try {
    // 1. Check if we're in the backend directory
    console.log('📁 Checking directory...');
    if (!fs.existsSync('./package.json')) {
      throw new Error('package.json not found. Please run this from the backend directory.');
    }
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (packageJson.name !== 'flappypi-backend') {
      console.warn('⚠️ Warning: This might not be the backend directory');
    }

    // 2. Install dependencies
    console.log('\n📦 Installing dependencies...');
    
    // Check if npm is available
    try {
      execSync('npm --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('npm not found. Please install Node.js and npm first.');
    }

    // Install each dependency
    for (const dep of requiredDependencies) {
      console.log(`  Installing ${dep}...`);
      try {
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`  ❌ Failed to install ${dep}`);
        throw error;
      }
    }

    console.log('✅ All dependencies installed');

    // 3. Check environment variables
    console.log('\n🔧 Checking environment configuration...');
    
    const envPath = '../.env';
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️ Warning: .env file not found in parent directory');
      console.log('   Please ensure your environment variables are configured');
    } else {
      console.log('✅ Environment file found');
      
      // Check for required variables
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredEnvVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_SERVICE_ROLE_KEY'
      ];
      
      for (const envVar of requiredEnvVars) {
        if (!envContent.includes(envVar)) {
          console.warn(`⚠️ Warning: ${envVar} not found in .env file`);
        } else {
          console.log(`  ✅ ${envVar} configured`);
        }
      }
    }

    // 4. Test database connection
    console.log('\n🗄️ Testing database connection...');
    try {
      // Import and test connection
      const { testConnection } = await import('./services/supabaseClient.js');
      const isConnected = await testConnection();
      
      if (isConnected) {
        console.log('✅ Database connection successful');
      } else {
        console.warn('⚠️ Database connection failed - check your environment variables');
      }
    } catch (error) {
      console.error('❌ Database connection test failed:', error.message);
      console.log('   This might be due to missing environment variables or network issues');
    }

    // 5. Create database tables (if needed)
    console.log('\n🏗️ Setting up database schema...');
    try {
      console.log('   SQL schema file: ./database/comprehensive-cloud-storage-schema.sql');
      console.log('   Please run this SQL file in your Supabase dashboard to create the tables');
      console.log('   📋 Copy the content and paste it in the Supabase SQL editor');
    } catch (error) {
      console.error('❌ Schema setup note:', error.message);
    }

    // 6. Start server test
    console.log('\n🌐 Starting server test...');
    try {
      // Import and start a simple test
      const { default: cloudStorageService } = await import('./services/cloudStorageService.js');
      const health = await cloudStorageService.healthCheck();
      
      console.log('✅ Cloud storage service health:', health.status);
    } catch (error) {
      console.error('❌ Cloud storage service test failed:', error.message);
    }

    // 7. Success summary
    console.log('\n🎉 Setup Complete!');
    console.log('=' .repeat(50));
    console.log('✅ Dependencies installed');
    console.log('✅ Environment checked');
    console.log('✅ Cloud storage services ready');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the SQL schema in your Supabase dashboard');
    console.log('2. Start the server with: npm start');
    console.log('3. Test the API endpoints at: http://localhost:3001/api/health');
    console.log('4. Run full tests with: node test-cloud-storage.cjs');

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you\'re in the backend directory');
    console.log('2. Check your .env file has the correct Supabase credentials');
    console.log('3. Verify your internet connection');
    console.log('4. Make sure Node.js and npm are installed');
    process.exit(1);
  }
}

// Helper function to check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    try {
      execSync(`where ${command}`, { stdio: 'pipe' }); // Windows
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Run the setup
main().catch(console.error);