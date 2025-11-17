#!/usr/bin/env node

/**
 * FLPY Token Distribution Script
 * Send FLPY tokens to Pi Network users
 */

const StellarSdk = require('stellar-sdk');
require('dotenv').config();

// Pi Network Testnet Configuration
const server = new StellarSdk.Horizon.Server('https://api.testnet.minepi.com');
StellarSdk.Network.use(new StellarSdk.Network('Pi Testnet'));

const FLPY_CODE = 'FLPY';
const FLPY_ISSUER = process.env.FLPY_TOKEN_ISSUER;
const DISTRIBUTION_SEED = process.env.FLPY_DISTRIBUTION_SEED;

/**
 * Send FLPY tokens to a user
 * @param {string} userWalletAddress - User's Pi wallet address
 * @param {string} amount - Amount of FLPY to send
 * @param {string} memo - Optional memo for the transaction
 */
async function sendFLPYToUser(userWalletAddress, amount, memo = '') {
    try {
        console.log('🚀 Sending FLPY tokens...');
        console.log(`👤 To: ${userWalletAddress}`);
        console.log(`💰 Amount: ${amount} FLPY`);
        
        // Load distributor account
        const distributorKeypair = StellarSdk.Keypair.fromSecret(DISTRIBUTION_SEED);
        const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
        
        // Create FLPY asset
        const flpyAsset = new StellarSdk.Asset(FLPY_CODE, FLPY_ISSUER);
        
        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(distributorAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: 'Pi Testnet'
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: userWalletAddress,
            asset: flpyAsset,
            amount: amount.toString()
        }))
        .setTimeout(30);
        
        // Add memo if provided
        if (memo) {
            transaction.addMemo(StellarSdk.Memo.text(memo));
        }
        
        const builtTransaction = transaction.build();
        builtTransaction.sign(distributorKeypair);
        
        // Submit transaction
        const result = await server.submitTransaction(builtTransaction);
        
        console.log('✅ FLPY tokens sent successfully!');
        console.log(`🔗 Transaction: ${result.hash}`);
        console.log(`📊 Ledger: ${result.ledger}`);
        
        return {
            success: true,
            hash: result.hash,
            ledger: result.ledger
        };
        
    } catch (error) {
        console.log('❌ Error sending FLPY tokens:', error.message);
        
        // Common error handling
        if (error.response) {
            const details = error.response.data.extras?.result_codes;
            if (details) {
                console.log('🔍 Error details:', details);
                
                if (details.transaction === 'tx_no_destination') {
                    console.log('💡 Solution: User needs to create Pi wallet first');
                } else if (details.operations?.includes('op_no_trust')) {
                    console.log('💡 Solution: User needs to add FLPY trustline first');
                } else if (details.operations?.includes('op_underfunded')) {
                    console.log('💡 Solution: Distributor needs more FLPY tokens');
                }
            }
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if user has FLPY trustline
 * @param {string} userWalletAddress - User's Pi wallet address
 */
async function checkUserTrustline(userWalletAddress) {
    try {
        console.log(`🔍 Checking FLPY trustline for: ${userWalletAddress}`);
        
        const account = await server.loadAccount(userWalletAddress);
        const flpyBalance = account.balances.find(balance => 
            balance.asset_code === FLPY_CODE && 
            balance.asset_issuer === FLPY_ISSUER
        );
        
        if (flpyBalance) {
            console.log(`✅ User has FLPY trustline`);
            console.log(`💰 Current balance: ${flpyBalance.balance} FLPY`);
            console.log(`📊 Limit: ${flpyBalance.limit || 'No limit'}`);
            return {
                hasTrustline: true,
                balance: parseFloat(flpyBalance.balance),
                limit: flpyBalance.limit
            };
        } else {
            console.log(`❌ User does not have FLPY trustline`);
            return { hasTrustline: false };
        }
        
    } catch (error) {
        console.log('❌ Error checking trustline:', error.message);
        return { hasTrustline: false, error: error.message };
    }
}

/**
 * Example usage and testing
 */
async function testDistribution() {
    console.log('🧪 Testing FLPY Distribution System');
    console.log('='.repeat(40));
    
    // Example user wallet (replace with real address)
    const testUserWallet = 'EXAMPLE_USER_WALLET_ADDRESS_HERE';
    const testAmount = '100';
    
    console.log('⚠️  To test distribution:');
    console.log('1. Replace testUserWallet with real Pi wallet address');
    console.log('2. Ensure user has created FLPY trustline');
    console.log('3. Run: node distribute-flpy-tokens.cjs');
    
    // Uncomment below to test with real wallet address
    /*
    const trustlineCheck = await checkUserTrustline(testUserWallet);
    
    if (trustlineCheck.hasTrustline) {
        const result = await sendFLPYToUser(testUserWallet, testAmount, 'Welcome to FLPY!');
        console.log('Distribution result:', result);
    } else {
        console.log('❌ User needs to add FLPY trustline first');
    }
    */
}

// Export functions for use in other scripts
module.exports = {
    sendFLPYToUser,
    checkUserTrustline
};

// Run test if called directly
if (require.main === module) {
    testDistribution();
}