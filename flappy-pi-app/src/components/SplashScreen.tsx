import React, { useEffect, useState } from 'react';

// Properly declare Vite env typing for ImportMeta globally
// Place this in a .d.ts file in production, but for now, inline for linter fix

declare global {
    interface ImportMeta {
        env: {
            VITE_PI_REDIRECT_URI: string;
        };
    }
}

const SplashScreen: React.FC = () => {
    const [isPiBrowser, setIsPiBrowser] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPiBrowser = () => {
            const userAgent = window.navigator.userAgent;
            const isPi = userAgent.includes('PiBrowser');
            setIsPiBrowser(isPi);
        };

        checkPiBrowser();
    }, []);

    if (isPiBrowser === null) {
        return <div>Loading...</div>; // Loading UI while checking
    }

    return (
        <div>
            {isPiBrowser ? (
                <h1>Welcome to Flappy Pi!</h1>
            ) : (
                <h1>You are not using the Pi Browser.</h1>
            )}
        </div>
    );
};

export default SplashScreen;