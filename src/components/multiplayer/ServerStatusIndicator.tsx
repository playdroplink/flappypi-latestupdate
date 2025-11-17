import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface ServerStatusIndicatorProps {
  className?: string;
  status?: 'healthy' | 'unhealthy' | 'checking';
  onRetry?: () => void;
}

const ServerStatusIndicator: React.FC<ServerStatusIndicatorProps> = ({ 
  className = '', 
  status: externalStatus, 
  onRetry 
}) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkServerHealth = async () => {
    try {
      setStatus('checking');
      const response = await fetch('http://localhost:3009/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Server health check failed:', error);
      setStatus('disconnected');
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkServerHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    const currentStatus = externalStatus || status;
    switch (currentStatus) {
      case 'checking':
        return <AlertTriangle className="w-4 h-4 animate-pulse" />;
      case 'connected':
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
      case 'unhealthy':
        return <WifiOff className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    const currentStatus = externalStatus || status;
    switch (currentStatus) {
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
      case 'connected':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      case 'error':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = () => {
    const currentStatus = externalStatus || status;
    switch (currentStatus) {
      case 'checking':
        return 'Checking...';
      case 'connected':
      case 'healthy':
        return 'Server Online';
      case 'disconnected':
      case 'unhealthy':
        return 'Server Offline';
      case 'error':
        return 'Server Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {lastCheck && (
        <span className="text-xs opacity-75">
          ({lastCheck.toLocaleTimeString()})
        </span>
      )}
      {onRetry && (externalStatus === 'unhealthy' || status === 'disconnected') && (
        <button
          onClick={onRetry}
          className="ml-2 px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ServerStatusIndicator;
