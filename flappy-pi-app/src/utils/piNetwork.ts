export const isPiBrowser = (): boolean => {
    const userAgent = window.navigator.userAgent;
    return /PiBrowser/i.test(userAgent);
};

export const authenticateWithPi = async (): Promise<{ username: string; walletAddress: string } | null> => {
    if (window.Pi && window.Pi.authenticate) {
        try {
            const result = await window.Pi.authenticate();
            return {
                username: result.username,
                walletAddress: result.walletAddress,
            };
        } catch (error) {
            console.error("Authentication failed:", error);
            return null;
        }
    }
    console.warn("Pi authentication is not available.");
    return null;
};