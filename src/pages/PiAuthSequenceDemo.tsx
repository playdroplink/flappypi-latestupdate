import React, { useState } from 'react';
import { PiAuthSequenceButton, PiAuthSequenceWrapper } from '../components/PiAuthSequenceButton';
import { usePiAuthSequence } from '../hooks/usePiAuthSequence';

const PiAuthSequenceDemo: React.FC = () => {
  const auth = usePiAuthSequence();
  const [logs, setLogs] = useState<string[]>([]);

  // Add log function
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Handle authentication success
  const handleAuthSuccess = (user: any) => {
    addLog(`✅ Authentication successful for user: ${user.username}`);
  };

  // Handle authentication error
  const handleAuthError = (error: string) => {
    addLog(`❌ Authentication error: ${error}`);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Pi Authentication Sequence Demo
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Sequence Diagram Implementation
            </h2>
            <p className="text-gray-600 mb-4">
              This demo implements the exact Pi authentication sequence diagram:
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Sequence Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                <li>User clicks "Connect with Pi Network"</li>
                <li>App calls Pi.authenticate(scopes)</li>
                <li>PiBrowser prompts for permissions</li>
                <li>User approves</li>
                <li>PiBrowser returns authResult (user, accessToken)</li>
                <li>App validates accessToken via /v2/me (Production)</li>
                <li>PiAPI returns user info</li>
                <li>App signs up/logs in user</li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Authentication Section */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Authentication Component
                </h3>
                
                <PiAuthSequenceButton
                  variant="primary"
                  size="lg"
                  showStatus={true}
                  showSteps={true}
                  onAuthSuccess={handleAuthSuccess}
                  onAuthError={handleAuthError}
                >
                  🔐 Connect with Pi Network
                </PiAuthSequenceButton>
              </div>

              {/* Status Display */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Authentication Status
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pi Browser:</span>
                    <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                      {auth.isAuthenticated ? '✅ Available' : '❌ Not Available'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Authentication Status:</span>
                    <span className={
                      auth.isAuthenticating ? 'text-yellow-600' : 
                      auth.isAuthenticated ? 'text-green-600' : 'text-red-600'
                    }>
                      {auth.isAuthenticating ? '🔄 Authenticating' : 
                       auth.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                    </span>
                  </div>
                  
                  {auth.user && (
                    <div className="flex justify-between">
                      <span>User:</span>
                      <span className="text-blue-600 font-medium">{auth.user.username}</span>
                    </div>
                  )}
                  
                  {auth.step && (
                    <div className="flex justify-between">
                      <span>Current Step:</span>
                      <span className="text-purple-600 font-medium">{auth.step}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logs Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Authentication Logs
                </h3>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Logs
                </button>
              </div>
              
              <div className="bg-gray-100 rounded p-3 h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No logs yet. Start authentication to see logs.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-gray-700">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auto-Authentication Demo */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Auto-Authentication Demo
            </h3>
            <p className="text-gray-600 mb-4">
              This section demonstrates automatic authentication when in Pi Browser:
            </p>
            
            <PiAuthSequenceWrapper autoAuth={true} showStatus={true}>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Auto-Authentication Active
                </h4>
                <p className="text-green-800 text-sm">
                  If you're in Pi Browser, authentication will start automatically.
                  Check the logs above to see the sequence in action.
                </p>
              </div>
            </PiAuthSequenceWrapper>
          </div>

          {/* Implementation Details */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Implementation Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Files Created:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">src/services/piAuthSequence.ts</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">src/hooks/usePiAuthSequence.ts</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">src/components/PiAuthSequenceButton.tsx</code></li>
                  <li>• <code className="bg-gray-100 px-1 rounded">src/pages/PiAuthSequenceDemo.tsx</code></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Key Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Exact sequence diagram implementation</li>
                  <li>• Production token validation</li>
                  <li>• Step-by-step logging</li>
                  <li>• Error handling and retry logic</li>
                  <li>• React hooks integration</li>
                  <li>• Auto-authentication support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiAuthSequenceDemo; 