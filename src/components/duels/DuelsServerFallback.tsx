import React from 'react';

interface DuelsServerFallbackProps {
  onRetry: () => void;
  onBack: () => void;
}

export const DuelsServerFallback: React.FC<DuelsServerFallbackProps> = ({ onRetry, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold text-white dark:text-gray-100 mb-4">Duels Server Offline</h1>
        <p className="text-gray-300 dark:text-gray-400 mb-6">
          The multiplayer duels server is not running. To start playing duels, you need to start the server first.
        </p>
        
        <div className="space-y-4">
          <div className="bg-yellow-900/30 dark:bg-yellow-800/30 border border-yellow-500/50 dark:border-yellow-400/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 dark:text-yellow-300 mb-2">How to Start the Server:</h3>
            <div className="text-sm text-yellow-200 dark:text-yellow-100 space-y-1">
              <p>1. Open terminal/command prompt</p>
              <p>2. Navigate to the project directory</p>
              <p>3. Run: <code className="bg-black/50 px-2 py-1 rounded">cd duels-server && ./start-duels.sh</code></p>
              <p>4. Or on Windows: <code className="bg-black/50 px-2 py-1 rounded">cd duels-server && start-duels.bat</code></p>
            </div>
          </div>
          
          <div className="bg-blue-900/30 dark:bg-blue-800/30 border border-blue-500/50 dark:border-blue-400/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 dark:text-blue-300 mb-2">Server Status:</h3>
            <div className="text-sm text-blue-200 dark:text-blue-100">
              <p>• Health Check: <span className="text-red-400">Failed</span></p>
              <p>• Connection: <span className="text-red-400">Disconnected</span></p>
              <p>• Server URL: <code className="bg-black/50 px-2 py-1 rounded">http://localhost:3009</code></p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-6">
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            🔄 Retry Connection
          </button>
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
          >
            ← Back to Home
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          <p>Need help? Check the <code className="bg-black/50 px-2 py-1 rounded">DUELS_MULTIPLAYER_README.md</code> file for detailed setup instructions.</p>
        </div>
      </div>
    </div>
  );
};
