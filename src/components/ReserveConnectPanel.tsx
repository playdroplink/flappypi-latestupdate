import React, { useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

interface ReserveConnectPanelProps {
  className?: string;
}

const ReserveConnectPanel: React.FC<ReserveConnectPanelProps> = ({ className = "" }) => {
  const { isPiAuth, piUser } = useAuth();
  const [username, setUsername] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reserveResult, setReserveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [connectResult, setConnectResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleReserve = async () => {
    if (!username.trim()) {
      setReserveResult({ success: false, message: 'Please enter a username' });
      return;
    }

    if (!isPiAuth || !piUser) {
      setReserveResult({ success: false, message: 'Please sign in with Pi Network first' });
      return;
    }

    setIsReserving(true);
    setReserveResult(null);

    try {
      const result = await supabaseService.reserveUsername(username.trim(), piUser.uid);
      setReserveResult(result);
    } catch (error) {
      setReserveResult({ success: false, message: error instanceof Error ? error.message : 'Reservation failed' });
    } finally {
      setIsReserving(false);
    }
  };

  const handleConnect = async () => {
    if (!username.trim()) {
      setConnectResult({ success: false, message: 'Please enter a username' });
      return;
    }

    if (!isPiAuth || !piUser) {
      setConnectResult({ success: false, message: 'Please sign in with Pi Network first' });
      return;
    }

    setIsConnecting(true);
    setConnectResult(null);

    try {
      const result = await supabaseService.connectFlappy(username.trim(), piUser.uid);
      setConnectResult(result);
    } catch (error) {
      setConnectResult({ success: false, message: error instanceof Error ? error.message : 'Connection failed' });
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isPiAuth) {
    return (
      <div className={`p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="font-semibold text-purple-900 mb-2">🔐 Authentication Required</h3>
          <p className="text-sm text-purple-700">
            Please sign in with Pi Network to access reserve and connect features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold text-purple-900 mb-4">🎮 Reserve & Connect Flappy</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-800 mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your desired username"
          className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleReserve}
          disabled={isReserving}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isReserving ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Reserving...
            </span>
          ) : (
            '🔒 Reserve Username'
          )}
        </button>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isConnecting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </span>
          ) : (
            '🔗 Connect Flappy'
          )}
        </button>
      </div>

      {/* Reserve Result */}
      {reserveResult && (
        <div className={`mt-4 p-3 rounded-lg ${
          reserveResult.success
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {reserveResult.success ? (
            <p>✅ {reserveResult.message}</p>
          ) : (
            <p>❌ {reserveResult.message}</p>
          )}
        </div>
      )}

      {/* Connect Result */}
      {connectResult && (
        <div className={`mt-4 p-3 rounded-lg ${
          connectResult.success
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {connectResult.success ? (
            <p>✅ {connectResult.message}</p>
          ) : (
            <p>❌ {connectResult.message}</p>
          )}
        </div>
      )}

      {/* User Info */}
      <div className="mt-4 p-3 bg-purple-100 rounded-lg">
        <p className="text-sm text-purple-800">
          Signed in as: <span className="font-medium">{piUser?.username}</span>
        </p>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-purple-600">
        <div>🔒 Reserve your unique username to prevent others from using it</div>
        <div>🔗 Connect Flappy to enable cross-device synchronization</div>
        <div>🎮 Your game progress will be saved across devices</div>
      </div>
    </div>
  );
};

export default ReserveConnectPanel;