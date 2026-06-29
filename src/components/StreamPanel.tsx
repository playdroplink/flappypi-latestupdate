import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

interface StreamPanelProps {
  className?: string;
}

interface StreamData {
  username: string;
  score: number;
  is_live: boolean;
  stream_url?: string;
  viewer_count?: number;
  started_at: string;
}

const StreamPanel: React.FC<StreamPanelProps> = ({ className = "" }) => {
  const { isPiAuth, piUser } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamResult, setStreamResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeStreams, setActiveStreams] = useState<StreamData[]>([]);

  const handleStartStream = async () => {
    if (!isPiAuth || !piUser) {
      setStreamResult({ success: false, message: 'Please sign in with Pi Network first' });
      return;
    }

    setIsStreaming(true);
    setStreamResult(null);

    try {
      // Mock stream functionality - in production this would connect to streaming service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStreamResult({ success: true, message: 'Stream started successfully' });
      setIsStreaming(true);
    } catch (error) {
      setStreamResult({ success: false, message: error instanceof Error ? error.message : 'Stream failed' });
      setIsStreaming(false);
    }
  };

  const handleStopStream = async () => {
    setIsStreaming(false);
    setStreamResult({ success: true, message: 'Stream stopped' });
  };

  const loadActiveStreams = async () => {
    try {
      // Mock loading active streams - in production this would fetch from backend
      const mockStreams: StreamData[] = [
        {
          username: 'ProPlayer123',
          score: 9999,
          is_live: true,
          viewer_count: 156,
          started_at: new Date().toISOString()
        },
        {
          username: 'FlappyMaster',
          score: 8500,
          is_live: true,
          viewer_count: 89,
          started_at: new Date().toISOString()
        }
      ];
      setActiveStreams(mockStreams);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  useEffect(() => {
    // Load active streams on mount
    loadActiveStreams();
    
    // Refresh streams every 30 seconds
    const interval = setInterval(loadActiveStreams, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isPiAuth) {
    return (
      <div className={`p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="font-semibold text-red-900 mb-2">🔐 Authentication Required</h3>
          <p className="text-sm text-red-700">
            Please sign in with Pi Network to access streaming features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold text-red-900 mb-4">📺 Stream Your Gameplay</h2>
      
      {/* Stream Controls */}
      <div className="mb-6">
        {!isStreaming ? (
          <button
            onClick={handleStartStream}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🎥 Start Streaming
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ⏹️ Stop Streaming
          </button>
        )}
      </div>

      {/* Stream Result */}
      {streamResult && (
        <div className={`mb-4 p-3 rounded-lg ${
          streamResult.success
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {streamResult.success ? (
            <p>✅ {streamResult.message}</p>
          ) : (
            <p>❌ {streamResult.message}</p>
          )}
        </div>
      )}

      {/* Active Streams */}
      <div className="mt-6">
        <h3 className="font-semibold text-red-900 mb-3">🔴 Live Streams</h3>
        {activeStreams.length === 0 ? (
          <p className="text-sm text-red-700">No active streams right now</p>
        ) : (
          <div className="space-y-3">
            {activeStreams.map((stream, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-red-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="font-medium text-red-900">{stream.username}</span>
                  </div>
                  <span className="text-sm text-red-700">
                    👀 {stream.viewer_count} viewers
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Score: {stream.score}</span>
                  <span className="text-gray-600">
                    Started: {new Date(stream.started_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="mt-4 p-3 bg-red-100 rounded-lg">
        <p className="text-sm text-red-800">
          Signed in as: <span className="font-medium">{piUser?.username}</span>
        </p>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-red-600">
        <div>🎥 Stream your gameplay live to the community</div>
        <div>🎯 Build your audience and showcase your skills</div>
        <div>🏆 Compete with other players in real-time</div>
      </div>
    </div>
  );
};

export default StreamPanel;