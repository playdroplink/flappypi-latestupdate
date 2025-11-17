import React, { useState } from 'react';

const PiAuthLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = async () => {
        if (window.Pi) {
            try {
                const authResponse = await window.Pi.authenticate();
                if (authResponse) {
                    setUsername(authResponse.username);
                    setWalletAddress(authResponse.walletAddress);
                    setIsAuthenticated(true);
                    // Redirect to /home after successful login
                    window.location.href = '/home';
                }
            } catch (error) {
                console.error('Authentication failed:', error);
            }
        } else {
            console.error('Pi Network not detected');
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