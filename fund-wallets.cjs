const https = require('https');

const wallets = [
  'GB6ZRJPW2Q64OCKJA5L2FY4K52PUIIQFCSXMN2FZ3HS4QGYP34TT6G75', // Distribution
  'GBV3KOBDQYKFYMOQJVFNY5HLQFX55EZXWYUM6VUS4FJWSS5ECCF4FQP7', // Game Wallet 2  
  'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'  // Merchant Wallet
];

async function fundWallet(address) {
  return new Promise((resolve) => {
    const url = `https://friendbot.stellar.org?addr=${address}`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${address}: FUNDED`);
        resolve(true);
      } else {
        console.log(`❌ ${address}: FAILED (${res.statusCode})`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ ${address}: ERROR - ${err.message}`);
      resolve(false);
    });
  });
}

async function fundAllWallets() {
  console.log('💰 Funding additional wallets...');
  for (const wallet of wallets) {
    await fundWallet(wallet);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
  console.log('✅ Wallet funding complete!');
}

fundAllWallets();