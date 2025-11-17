import React, { useEffect, useState } from 'react';

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