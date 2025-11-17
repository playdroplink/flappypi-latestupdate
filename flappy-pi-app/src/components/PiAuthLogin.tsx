import React, { useState, useEffect } from 'react';
import supabase from '../../../src/integrations/supabase/client';
import NPCGuide from '../../../src/components/NPCGuide1';
import LoginNPCModal from './LoginNPCModal';

// Move this function to top-level (outside useEffect)
function onIncompletePaymentFound(payment: any) {
    console.log('Incomplete payment found:', payment);
}

const PiAuthLogin: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [user, setUser] = useState<{ username: string; uid: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [meData, setMeData] = useState<any>(null);
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [piAvailable, setPiAvailable] = useState(false);

    const handleNPCClick = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Robust Pi Browser detection
    function detectPiBrowser() {
        if (typeof window === 'undefined') return false;
        const Pi = (window as any).Pi;
        const ua = navigator.userAgent.toLowerCase();
        return (
            Pi && typeof Pi.authenticate === 'function' &&
            (ua.includes('pibrowser') || ua.includes('pi browser') || ua.includes('minepi'))
        );
    }

    useEffect(() => {
        const available = detectPiBrowser();
        setPiAvailable(available);
        if (!available) {
            setError('Not in Pi Browser. Please open this page in the official Pi Browser app.');
        } else {
            setError(null);
            // Auto-login if in Pi Browser and not already authenticated
            if (!user && !loading) {
                setLoading(true);
                const Pi = (window as any).Pi;
                const scopes = ['username', 'payments'];
                if (Pi && typeof Pi.authenticate === 'function') {
                    Pi.authenticate(scopes, onIncompletePaymentFound)
                        .then((auth: any) => {
                            setUser({ username: auth.user.username, uid: auth.user.uid });
                            setAccessToken(auth.accessToken);
                            // Step 2: Verify with /me endpoint
                            fetch('https://api.minepi.com/v2/me', {
                                headers: { 'Authorization': `Bearer ${auth.accessToken}` }
                            })
                                .then(meRes => {
                                    if (!meRes.ok) throw new Error('Access token invalid or expired');
                                    return meRes.json();
                                })
                                .then(userData => {
                                    setMeData(userData);
                                    console.log('Verified user with /me:', userData);
                                })
                                .catch((meErr: any) => {
                                    setError('Failed to verify user with /me: ' + (meErr?.message || meErr));
                                    setMeData(null);
                                });
                            setError(null);
                        })
                        .catch((err: any) => {
                            setError('Pi login error: ' + (err?.message || err));
                            console.error('❌ Pi login error:', err);
                        })
                        .finally(() => setLoading(false));
                } else {
                    setError('Pi SDK not loaded. Please use the Pi Browser.');
                    setLoading(false);
                }
            }
        }
    }, [user, loading]);

    // Official Pi SDK login handler
    const handleLogin = async () => {
        setError(null);
        setLoading(true);
        const Pi = (window as any).Pi;
        const scopes = ['username', 'payments'];
        if (Pi && typeof Pi.authenticate === 'function') {
            try {
                const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
                setUser({ username: auth.user.username, uid: auth.user.uid });
                setAccessToken(auth.accessToken);
                // Step 2: Verify with /me endpoint
                try {
                    const meRes = await fetch('https://api.minepi.com/v2/me', {
                        headers: { 'Authorization': `Bearer ${auth.accessToken}` }
                    });
                    if (!meRes.ok) {
                        throw new Error('Access token invalid or expired');
                    }
                    const userData = await meRes.json();
                    setMeData(userData);
                    console.log('Verified user with /me:', userData);
                } catch (meErr: any) {
                    setError('Failed to verify user with /me: ' + (meErr?.message || meErr));
                    setMeData(null);
                }
                setError(null);
            } catch (err: any) {
                setError('Pi login error: ' + (err?.message || err));
                console.error('❌ Pi login error:', err);
            }
        } else {
            setError('Pi SDK not loaded. Please use the Pi Browser.');
            console.error('❌ Pi SDK not loaded. window.Pi:', Pi);
        }
        setLoading(false);
    };

    // Supabase Google login handler
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) {
                setError('Google login error: ' + error.message);
            }
        } catch (err: any) {
            setError('Google login error: ' + (err.message || err));
        }
        setLoading(false);
    };

    // Test payment handler
    const handleTestPayment = async () => {
        setPaymentError(null);
        setPaymentResult(null);
        const Pi = (window as any).Pi;
        const paymentData = {
            amount: 1,
            memo: 'Test payment',
            metadata: { test: true }
        };
        const paymentCallbacks = {
            onReadyForServerApproval: function(paymentId: string) {
                console.log('Ready for server approval:', paymentId);
            },
            onReadyForServerCompletion: function(paymentId: string, txid: string) {
                console.log('Ready for server completion:', paymentId, txid);
                setPaymentResult({ paymentId, txid });
            },
            onCancel: function(paymentId: string) {
                console.log('Payment cancelled:', paymentId);
                setPaymentError('Payment cancelled by user');
            },
            onError: function(error: any, payment: any) {
                setPaymentError('Payment error: ' + (error?.message || error));
                console.error('Payment error:', error, payment);
            }
        };
        if (Pi && typeof Pi.createPayment === 'function') {
            try {
                Pi.createPayment(paymentData, paymentCallbacks);
            } catch (err: any) {
                setPaymentError('Payment error: ' + (err?.message || err));
            }
        } else {
            setPaymentError('Pi SDK not loaded. Please use the Pi Browser.');
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen w-full h-full bg-gradient-to-b from-blue-100 to-blue-300 px-4 overflow-x-auto ${isMobile ? 'text-sm' : 'text-base'}`} style={{ minHeight: '100vh' }}>
            <div className="flex flex-col items-center justify-center w-full h-full" style={{ minHeight: '100vh', minWidth: 400, width: 'max-content' }}>
                <div className="cursor-pointer flex items-center justify-center w-full h-full" style={{ minHeight: '60vh' }} onClick={handleNPCClick}>
                    <NPCGuide npcName="Nicolas" npcType="nicolas" initialMood="happy" dialogStyle={{ display: 'none' }} />
                </div>
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center mt-4">
                    <img src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-16 h-16 mb-4" />
                    <h2 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Sign in to Flappy Pi with Pi Network</h2>
                    <p className="text-gray-600 text-center mb-4">Connect with your Pi Network account for secure authentication and access to Pi payments, rewards, and more.</p>
                    {user ? (
                        <div className="mt-2 p-4 bg-green-100 rounded shadow w-full">
                            <div>Logged in as: <b>{user.username}</b></div>
                            <div>UID: <b>{user.uid}</b></div>
                            <div className="break-all text-xs mt-2">Access Token: <b>{accessToken}</b></div>
                            {meData && <div className="mt-2 text-xs bg-blue-50 p-2 rounded">Verified with /me: <pre>{JSON.stringify(meData, null, 2)}</pre></div>}
                            <button className="mt-4 px-6 py-2 bg-blue-400 rounded shadow hover:bg-blue-500 text-white font-bold" onClick={handleTestPayment}>
                                Test Pi Payment (1 Test-Pi)
                            </button>
                            {paymentResult && (
                                <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                                    <div>Payment Result:</div>
                                    <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
                                </div>
                            )}
                            {paymentError && <div className="mt-2 text-red-600">{paymentError}</div>}
                        </div>
                    ) : (
                        <>
                            {piAvailable ? (
                                <button
                                    onClick={handleLogin}
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-xl py-3 px-10 rounded-full shadow-lg border-4 border-yellow-600 mb-2 transition-all duration-200 disabled:opacity-60"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign in with Pi Network'}
                                </button>
                            ) : (
                                <div className="mt-4 p-4 bg-red-100 rounded shadow text-red-700 font-bold w-full text-center">
                                    {error || 'Not in Pi Browser. Please open this page in the official Pi Browser app.'}
                                </div>
                            )}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-3 px-8 rounded-full shadow-lg border-4 border-red-700 mt-4 transition-all duration-200 disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in with Gmail'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <LoginNPCModal open={modalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default PiAuthLogin;