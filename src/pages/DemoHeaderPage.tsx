import React from 'react';
import HeaderWithPiAuth from '../components/HeaderWithPiAuth';
import { useAuth } from '../context/AuthContext';

const DemoHeaderPage: React.FC = () => {
  const { isAuthenticated, piUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header with Pi Authentication */}
      <HeaderWithPiAuth title="Flappy Pi" showNavigation={true} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Flappy Pi Demo
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              This page demonstrates the new header with Pi Network authentication, similar to the demo.pi example.
            </p>
            
            {/* Authentication Status */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Authentication Status
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isAuthenticated 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </div>
                {isAuthenticated && piUser && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">User:</span>
                    <span className="text-blue-600 font-medium">{piUser.username}</span>
                    <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  🔐 Pi Network Authentication
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Sign in with Pi Network account</li>
                  <li>• Secure authentication flow</li>
                  <li>• User profile integration</li>
                  <li>• Payment capabilities</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  🎮 Game Features
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Play Flappy Pi game</li>
                  <li>• Shop for items</li>
                  <li>• View leaderboard</li>
                  <li>• Manage inventory</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              How to Use
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Open in Pi Browser</h3>
                  <p className="text-gray-600">
                    Make sure you're using the official Pi Browser app to access Pi Network features.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Click "Sign in"</h3>
                  <p className="text-gray-600">
                    Click the blue "Sign in" button in the header to authenticate with your Pi Network account.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Grant Permissions</h3>
                  <p className="text-gray-600">
                    Allow the app to access your username and payment capabilities when prompted.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Start Playing</h3>
                  <p className="text-gray-600">
                    Once authenticated, you can access all game features and make purchases with Pi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Technical Implementation
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto">
              <pre>{`// Pi Network Authentication Flow
const authResult = await window.Pi.authenticate(
  ['payments', 'username'], 
  (payment) => {
    console.log('Incomplete payment:', payment);
  }
);

// Store user data
localStorage.setItem('flappypi-username', authResult.user.username);
localStorage.setItem('flappypi-pi-user', JSON.stringify(authResult.user));
localStorage.setItem('flappypi-pi-auth', 'true');

// Update app state
loginWithPi(authResult.user);`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoHeaderPage;
