/**
 * Get Pi Testnet Secret Key Helper
 * This script helps you get your secret key from Pi SDK
 */

// Function to get secret key from Pi SDK
async function getPiSecretKey() {
    console.log('🔑 Getting Pi Testnet Secret Key...');
    
    try {
        // Check if Pi SDK is available
        if (typeof window === 'undefined' || !window.Pi) {
            console.error('❌ Pi SDK not available. Make sure you\'re running this in Pi Browser.');
            return null;
        }

        console.log('✅ Pi SDK found');

        // Initialize Pi SDK for testnet
        await window.Pi.init({
            version: "2.0",
            sandbox: true // Testnet mode
        });

        console.log('✅ Pi SDK initialized for testnet');

        // Get current user
        const user = window.Pi.currentUser();
        console.log('👤 Current user:', user);

        // Get account details
        if (user && user.uid) {
            console.log('🔍 User ID:', user.uid);
            
            // Try to get account information
            try {
                // This might not be available in all Pi SDK versions
                if (window.Pi.getAccount) {
                    const account = await window.Pi.getAccount();
                    console.log('📊 Account details:', account);
                    return account;
                } else {
                    console.log('⚠️ getAccount method not available');
                    console.log('💡 You may need to get your secret key manually from Pi Browser');
                    return null;
                }
            } catch (error) {
                console.error('❌ Error getting account:', error);
                return null;
            }
        } else {
            console.error('❌ No user found. Please authenticate first.');
            return null;
        }

    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

// Function to display instructions
function showInstructions() {
    console.log('📋 Instructions to get your Pi Testnet Secret Key:');
    console.log('');
    console.log('1. Open Pi Browser');
    console.log('2. Go to Pi Testnet (testnet.minepi.com)');
    console.log('3. Log in to your account');
    console.log('4. Look for "Account Details" or "Export Keys"');
    console.log('5. Copy the secret key (starts with S, 56 characters)');
    console.log('');
    console.log('Your public key is: SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I');
    console.log('You need the corresponding secret key to create the FPT token.');
}

// Run the function
if (typeof window !== 'undefined') {
    // We're in a browser environment
    getPiSecretKey().then(result => {
        if (result) {
            console.log('✅ Secret key obtained:', result);
        } else {
            showInstructions();
        }
    });
} else {
    // We're in Node.js environment
    showInstructions();
}
