import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePiAuth } from '../context/PiAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, User, RefreshCw } from 'lucide-react';

const UsernameDebug: React.FC = () => {
  const { isAuthenticated, piUser, username } = useAuth();
  const { user: piAuthUser, isAuthenticated: isPiAuthenticated } = usePiAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshDebugInfo = () => {
    setRefreshKey(prev => prev + 1);
    
    const info = {
      timestamp: new Date().toISOString(),
      authContext: {
        isAuthenticated,
        username,
        piUser: piUser ? {
          username: piUser.username,
          name: piUser.name,
          displayName: piUser.displayName,
          first_name: piUser.first_name,
          last_name: piUser.last_name
        } : null
      },
      piAuthContext: {
        isPiAuthenticated,
        piAuthUser: piAuthUser ? {
          username: piAuthUser.username,
          name: piAuthUser.name,
          displayName: piAuthUser.displayName,
          first_name: piAuthUser.first_name,
          last_name: piAuthUser.last_name
        } : null
      },
      localStorage: {
        flappypiPiUser: localStorage.getItem('flappypi-pi-user'),
        flappypiPiAuth: localStorage.getItem('flappypi-pi-auth'),
        flappypiUsername: localStorage.getItem('flappypi-username'),
        piUser: localStorage.getItem('pi_user'),
        piAccessToken: localStorage.getItem('pi_access_token')
      },
      windowPi: {
        exists: typeof window !== 'undefined' && !!window.Pi,
        currentUserType: typeof window !== 'undefined' && window.Pi ? typeof window.Pi.currentUser : 'undefined',
        userExists: typeof window !== 'undefined' && window.Pi ? !!window.Pi.user : false
      }
    };
    
    setDebugInfo(info);
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [isAuthenticated, piUser, username, isPiAuthenticated, piAuthUser, refreshKey]);

  const extractUsername = (user: any) => {
    if (!user) return null;
    
    if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
      return user.username.trim();
    }
    
    if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
      return user.name.trim();
    }
    
    if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
      return user.displayName.trim();
    }
    
    if (user.first_name || user.last_name) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName && fullName !== 'Player') {
        return fullName;
      }
    }
    
    return null;
  };

  const getBestUsername = () => {
    // Try AuthContext first
    if (username && username !== 'Player' && username.trim() !== '') {
      return { source: 'AuthContext.username', username: username.trim() };
    }
    
    if (piUser) {
      const extracted = extractUsername(piUser);
      if (extracted) {
        return { source: 'AuthContext.piUser', username: extracted };
      }
    }
    
    // Try PiAuthContext
    if (piAuthUser) {
      const extracted = extractUsername(piAuthUser);
      if (extracted) {
        return { source: 'PiAuthContext.user', username: extracted };
      }
    }
    
    // Try localStorage
    const storedPiUser = localStorage.getItem('flappypi-pi-user');
    if (storedPiUser) {
      try {
        const parsedUser = JSON.parse(storedPiUser);
        const extracted = extractUsername(parsedUser);
        if (extracted) {
          return { source: 'localStorage.flappypi-pi-user', username: extracted };
        }
      } catch (error) {
        console.error('Error parsing stored Pi user:', error);
      }
    }
    
    const piSDKUser = localStorage.getItem('pi_user');
    if (piSDKUser) {
      try {
        const parsedUser = JSON.parse(piSDKUser);
        const extracted = extractUsername(parsedUser);
        if (extracted) {
          return { source: 'localStorage.pi_user', username: extracted };
        }
      } catch (error) {
        console.error('Error parsing Pi SDK user:', error);
      }
    }
    
    return { source: 'fallback', username: 'Pi User' };
  };

  const bestUsername = getBestUsername();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-6 h-6" />
          Username Debug Panel
          <Button
            onClick={refreshDebugInfo}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Best Username */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Current Best Username</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">{bestUsername.username}</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {bestUsername.source}
            </Badge>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AuthContext</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span>isAuthenticated:</span>
                {isAuthenticated ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{isAuthenticated ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>username:</span>
                <span className="font-medium">{username || 'Not Available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>piUser:</span>
                {piUser ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{piUser ? 'Available' : 'Not Available'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PiAuthContext</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span>isPiAuthenticated:</span>
                {isPiAuthenticated ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{isPiAuthenticated ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>piAuthUser:</span>
                {piAuthUser ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span>{piAuthUser ? 'Available' : 'Not Available'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raw Debug Data */}
        {debugInfo && (
          <div>
            <h3 className="font-semibold mb-2">Raw Debug Data</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsernameDebug;
