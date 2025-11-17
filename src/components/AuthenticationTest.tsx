import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePiAuth } from '../context/PiAuthContext';
import AuthenticationUI from './AuthenticationUI';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, User, Shield } from 'lucide-react';

const AuthenticationTest: React.FC = () => {
  const { isAuthenticated, piUser, username } = useAuth();
  const { user: piAuthUser, isAuthenticated: isPiAuthenticated, isLoading, error } = usePiAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const runAuthTests = () => {
    const tests = [
      {
        name: 'AuthContext Authentication',
        status: isAuthenticated ? 'pass' : 'fail',
        details: `isAuthenticated: ${isAuthenticated}`
      },
      {
        name: 'PiAuthContext Authentication',
        status: isPiAuthenticated ? 'pass' : 'fail',
        details: `isPiAuthenticated: ${isPiAuthenticated}`
      },
      {
        name: 'PiUser Available',
        status: piUser ? 'pass' : 'fail',
        details: `piUser: ${piUser ? 'Available' : 'Not Available'}`
      },
      {
        name: 'PiAuthUser Available',
        status: piAuthUser ? 'pass' : 'fail',
        details: `piAuthUser: ${piAuthUser ? 'Available' : 'Not Available'}`
      },
      {
        name: 'Username Available',
        status: username ? 'pass' : 'fail',
        details: `username: ${username || 'Not Available'}`
      },
      {
        name: 'Loading State',
        status: isLoading ? 'warning' : 'pass',
        details: `isLoading: ${isLoading}`
      },
      {
        name: 'Error State',
        status: error ? 'fail' : 'pass',
        details: `error: ${error || 'None'}`
      }
    ];

    setTestResults(tests);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Authentication Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication UI Test */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Authentication UI Components</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium mb-2">Header Variant</h4>
                <AuthenticationUI variant="header" showUserInfo={true} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Page Variant</h4>
                <AuthenticationUI variant="page" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Modal Variant</h4>
                <AuthenticationUI variant="modal" />
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Authentication Status Tests</h3>
              <button
                onClick={runAuthTests}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Run Tests
              </button>
            </div>
            
            {testResults.length > 0 && (
              <div className="space-y-3">
                {testResults.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-gray-600">{test.details}</div>
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Auth State */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Authentication State</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    AuthContext
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>isAuthenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                  <div><strong>username:</strong> {username || 'Not Available'}</div>
                  <div><strong>piUser:</strong> {piUser ? 'Available' : 'Not Available'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    PiAuthContext
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>isPiAuthenticated:</strong> {isPiAuthenticated ? 'Yes' : 'No'}</div>
                  <div><strong>isLoading:</strong> {isLoading ? 'Yes' : 'No'}</div>
                  <div><strong>error:</strong> {error || 'None'}</div>
                  <div><strong>piAuthUser:</strong> {piAuthUser ? 'Available' : 'Not Available'}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationTest;
