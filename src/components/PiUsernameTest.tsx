import React from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PiUsernameTest: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = usePiAuth();

  // Check localStorage for main app integration
  const mainAppUsername = localStorage.getItem('flappypi-username');
  const mainAppPiUser = localStorage.getItem('flappypi-pi-user');
  const mainAppPiAuth = localStorage.getItem('flappypi-pi-auth');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pi Username Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pi Auth Context Status */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Pi Auth Context Status</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
            <div><strong>Username:</strong> {user?.username || 'Not set'}</div>
            <div><strong>User ID:</strong> {user?.uid || 'Not set'}</div>
            {error && <div><strong>Error:</strong> <span className="text-red-600">{error}</span></div>}
          </div>
        </div>

        {/* Main App Integration Status */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Main App Integration Status</h3>
          <div className="space-y-1 text-sm">
            <div><strong>flappypi-username:</strong> {mainAppUsername || 'Not set'}</div>
            <div><strong>flappypi-pi-auth:</strong> {mainAppPiAuth || 'Not set'}</div>
            <div><strong>flappypi-pi-user:</strong> {mainAppPiUser ? 'Set' : 'Not set'}</div>
            {mainAppPiUser && (
              <div className="mt-2 p-2 bg-white rounded border">
                <pre className="text-xs overflow-auto">{mainAppPiUser}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          {!isAuthenticated && (
            <Button onClick={login} className="bg-blue-600 hover:bg-blue-700">
              Sign in with Pi
            </Button>
          )}
        </div>

        {/* Success Message */}
        {isAuthenticated && user && mainAppUsername && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>✅ Success!</strong> Pi username "{user.username}" is now available in the main app.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PiUsernameTest;
