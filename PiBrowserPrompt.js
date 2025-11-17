import React, { useEffect, useState } from "react";

const PiBrowserPrompt = () => {
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Detect Pi Browser using user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (userAgent.toLowerCase().includes("pibrowser")) {
      setIsPiBrowser(true);
    }

    // Check login status (replace with actual Pi Network API logic)
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/check-login"); // Replace with actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch login status");
        }
        const data = await response.json();
        setIsLoggedIn(data.loggedIn || false);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLoginRedirect = () => {
    // Redirect to Pi authentication login
    window.location.href = "https://ecosystem.pinet.com/auth"; // Replace with actual Pi auth login URL
  };

  const handleDownloadRedirect = () => {
    // Redirect to Pi Browser download page
    window.location.href = "https://minepi.com/Wain2020";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 to-purple-900/70 backdrop-blur-sm transition-all duration-300">
      <div className="bg-gradient-to-b from-white to-purple-50 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transform transition-all duration-300 animate-fade-in">
        {/* Logo and Game Title */}
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <img
              src="/flappy-logo.png"
              alt="Flappy Pi Logo"
              className="w-24 h-24 animate-bounce-slow"
            />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Flappy Pi
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Open in Pi Browser
          </h2>
          <p className="text-gray-600">
            To access all features of Flappy Pi, including payments and rewards, please open this game in the official Pi Browser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isPiBrowser ? (
            isLoggedIn ? (
              <p className="mb-4 text-lg font-semibold text-gray-700">
                Welcome! You are logged in via Pi Browser.
              </p>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-xl active:scale-95 select-none touch-manipulation cursor-pointer shadow-blue-500/30 border-2 border-blue-400/50 hover:border-blue-300 h-12 sm:h-14 px-6 text-sm sm:text-base w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              >
                Log in with Pi Browser
              </button>
            )
          ) : (
            <div>
              <p className="mb-4 text-lg font-semibold text-gray-700">
                This application works best in the Pi Browser.
              </p>
              <button
                onClick={handleDownloadRedirect}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-xl active:scale-95 select-none touch-manipulation cursor-pointer shadow-blue-500/30 border-2 border-blue-400/50 hover:border-blue-300 h-12 sm:h-14 px-6 text-sm sm:text-base w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              >
                Download Pi Browser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PiBrowserPrompt;