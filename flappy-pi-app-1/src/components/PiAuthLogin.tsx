
// Import Pi SDK type definitions
/// <reference path="../types/pi.d.ts" />
import React, { useState } from 'react';

const PiAuthLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = async () => {
        if (window.Pi && typeof window.Pi.authenticate === 'function') {
            try {
                const authResponse = await window.Pi.authenticate();
                if (authResponse && authResponse.username && authResponse.walletAddress) {
                    setUsername(authResponse.username);
                    setWalletAddress(authResponse.walletAddress);
                    setIsAuthenticated(true);
                    // Redirect to /home after successful login
                    window.location.href = '/home';
                } else {
                    throw new Error('Invalid Pi authentication response.');
                }
            } catch (error) {
                console.error('Authentication failed:', error);
            }
        } else {
            alert('Pi Network authentication is only available in the Pi Browser.');
            console.error('Pi Network not detected or not running in Pi Browser.');
        }
    };

    return (
        <div>
            {!isAuthenticated ? (
                <button onClick={handleLogin}>Login with Pi Network</button>
            ) : (
                <div>
                    <h2>Welcome, {username}!</h2>
                    <p>Your wallet address: {walletAddress}</p>
                </div>
            )}
        </div>
    );
};

export default PiAuthLogin;