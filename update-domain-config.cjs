#!/usr/bin/env node

/**
 * Update Domain Configuration for Flappy Pi
 * Updates the .env file with the actual domain and PiNet subdomain
 */

const fs = require('fs');
const path = require('path');

function updateDomainConfiguration() {
  console.log('🌐 Updating Domain Configuration...');
  console.log('================================================');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return;
  }
  
  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Create backup
  const backupPath = path.join(process.cwd(), '.env.domain.backup');
  fs.writeFileSync(backupPath, envContent);
  console.log('💾 Created backup: .env.domain.backup');
  
  // Update domain configurations
  const updates = [
    // App Configuration
    {
      from: 'APP_SUBDOMAIN="flappypi2807.pinet.com"',
      to: 'APP_SUBDOMAIN="flappypi6856.pinet.com"'
    },
    {
      from: 'APP_BASE_URL="http://localhost:3000"',
      to: 'APP_BASE_URL="https://www.flappypi.fun"'
    },
    {
      from: 'APP_DOMAIN="localhost:3000"',
      to: 'APP_DOMAIN="www.flappypi.fun"'
    },
    
    // Flappy Pi Domain Configuration
    {
      from: 'FLAPPY_PI_DOMAIN="localhost:3000"',
      to: 'FLAPPY_PI_DOMAIN="www.flappypi.fun"'
    },
    {
      from: 'FLAPPY_PI_PI_DOMAIN="flappypi2807.pinet.com"',
      to: 'FLAPPY_PI_PI_DOMAIN="flappypi6856.pinet.com"'
    },
    {
      from: 'FLAPPY_PI_SUBDOMAIN="flappypi2807"',
      to: 'FLAPPY_PI_SUBDOMAIN="flappypi6856"'
    },
    
    // Frontend and Backend URLs
    {
      from: 'FRONTEND_URL=http://localhost:3000',
      to: 'FRONTEND_URL=https://www.flappypi.fun'
    },
    {
      from: 'FRONTEND_DOMAIN_NAME=localhost:3000',
      to: 'FRONTEND_DOMAIN_NAME=www.flappypi.fun'
    },
    {
      from: 'BACKEND_URL=http://localhost:3000',
      to: 'BACKEND_URL=https://www.flappypi.fun'
    },
    {
      from: 'BACKEND_DOMAIN_NAME=localhost:3000',
      to: 'BACKEND_DOMAIN_NAME=www.flappypi.fun'
    },
    
    // CORS Origins
    {
      from: 'ALLOWED_ORIGINS="http://localhost:3000,https://flappypi2807.pinet.com,https://*.pinet.com,https://testnet.minepi.com,https://*.minepi.com,https://pinet.com,https://minepi.com"',
      to: 'ALLOWED_ORIGINS="https://www.flappypi.fun,https://flappypi6856.pinet.com,https://*.pinet.com,https://testnet.minepi.com,https://*.minepi.com,https://pinet.com,https://minepi.com"'
    }
  ];
  
  // Apply updates
  let updatedCount = 0;
  updates.forEach(update => {
    if (envContent.includes(update.from)) {
      envContent = envContent.replace(update.from, update.to);
      updatedCount++;
      console.log(`✅ Updated: ${update.from.split('=')[0]}`);
    } else {
      console.log(`⚠️  Not found: ${update.from.split('=')[0]}`);
    }
  });
  
  // Write updated content
  fs.writeFileSync(envPath, envContent);
  
  console.log('================================================');
  console.log('🎉 DOMAIN CONFIGURATION UPDATED!');
  console.log('================================================');
  console.log(`✅ Updated ${updatedCount} configurations`);
  console.log('✅ Domain: https://www.flappypi.fun');
  console.log('✅ PiNet Subdomain: flappypi6856.pinet.com');
  console.log('✅ Frontend URL: https://www.flappypi.fun');
  console.log('✅ Backend URL: https://www.flappypi.fun');
  console.log('✅ CORS Origins: Updated for production domains');
  console.log('================================================');
  
  console.log('📋 Next Steps:');
  console.log('1. Deploy your application to https://www.flappypi.fun');
  console.log('2. Update Pi Network app configuration with new domain');
  console.log('3. Test Pi Network integration on production domain');
  console.log('4. Verify PiNet subdomain: flappypi6856.pinet.com');
  
  console.log('🔧 Domain Configuration Summary:');
  console.log('- Production Domain: https://www.flappypi.fun');
  console.log('- PiNet Subdomain: flappypi6856.pinet.com');
  console.log('- App ID: flappypi2807');
  console.log('- API Key: yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu');
  console.log('- Validation Key: 312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156');
}

updateDomainConfiguration();
