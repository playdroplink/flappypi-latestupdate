import React from 'react';
import PiUserDisplay from '../components/PiUserDisplay';
import { usePiAuth } from '../context/PiAuthContext';

const PiAuthDemoPage: React.FC = () => {
  const { user, isAuthenticated } = usePiAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Pi Network Authentication Demo
          </h1>
          <p className="text-lg text-gray-600">
            Test Pi Network authentication and see your username
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Authentication Component */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Authentication Status
            </h2>
            <PiUserDisplay />
          </div>

          {/* User Info Display */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              User Information
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Welcome, {user.username}! 🎮
                    </h3>
                    <p className="text-sm text-gray-600">
                      You're now authenticated with Pi Network
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">User Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Username:</span>
                        <span className="ml-2 text-blue-600 font-semibold">{user.username}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">User ID:</span>
                        <span className="ml-2 font-mono text-gray-600">{user.uid}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Ready for Game</h4>
                    <p className="text-sm text-green-700">
                      Your Pi Network username is now available for use in Flappy Pi!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">👤</div>
                  <p className="text-gray-600">
                    Sign in with Pi Network to see your user information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            How to Use Pi Authentication
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">1. Sign In</h4>
              <p className="text-blue-700">
                Click "Sign in with Pi" to authenticate with your Pi Network account
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">2. Get Username</h4>
              <p className="text-green-700">
                Your Pi Network username will be available for use in the game
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">3. Play Game</h4>
              <p className="text-purple-700">
                Use your authenticated username in Flappy Pi for a personalized experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiAuthDemoPage;
