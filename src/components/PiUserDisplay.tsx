import React from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PiUserDisplay: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = usePiAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading Pi authentication...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button onClick={login} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Pi Network Authentication</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Sign in with your Pi Network account to play Flappy Pi
          </p>
          <Button onClick={login} className="w-full">
            Sign in with Pi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-green-600">Welcome, {user?.username}!</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Pi Network User</p>
            <p className="text-lg font-semibold text-blue-600">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">User ID</p>
            <p className="text-sm text-gray-600 font-mono">{user?.uid}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PiUserDisplay;
