import React, { useState, useEffect, useCallback } from 'react';
import { performanceOptimizer } from '../../utils/gamePerformanceOptimizer';

interface PerformanceMonitorProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
  onPerformanceWarning?: (metrics: any) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  show = true,
  position = 'top-right',
  showDetails = false,
  onPerformanceWarning
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const currentMetrics = performanceOptimizer.getPerformanceMetrics();
    const currentSettings = performanceOptimizer.getOptimizedSettings();
    
    setMetrics(currentMetrics);
    setSettings(currentSettings);

    // Check for performance warnings
    if (currentMetrics.currentFPS < 30 && !showWarning) {
      setShowWarning(true);
      onPerformanceWarning?.(currentMetrics);
    } else if (currentMetrics.currentFPS >= 45) {
      setShowWarning(false);
    }
  }, [showWarning, onPerformanceWarning]);

  // Update metrics periodically
  useEffect(() => {
    if (!show) return;

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [show, updateMetrics]);

  if (!show) return null;

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '120px'
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: '10px', left: '10px' };
      case 'top-right':
        return { ...baseStyle, top: '10px', right: '10px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '10px', left: '10px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '10px', right: '10px' };
      default:
        return { ...baseStyle, top: '10px', right: '10px' };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#00ff00'; // Green
    if (fps >= 45) return '#ffff00'; // Yellow
    if (fps >= 30) return '#ff8800'; // Orange
    return '#ff0000'; // Red
  };

  const getPerformanceStatus = () => {
    if (!metrics) return 'Unknown';
    
    if (metrics.emergencyMode) return 'Emergency';
    if (metrics.isLowPerformanceMode) return 'Low Performance';
    if (metrics.currentFPS >= 55) return 'Excellent';
    if (metrics.currentFPS >= 45) return 'Good';
    if (metrics.currentFPS >= 30) return 'Fair';
    return 'Poor';
  };

  const getStatusColor = () => {
    const status = getPerformanceStatus();
    switch (status) {
      case 'Emergency':
      case 'Poor':
        return '#ff0000';
      case 'Low Performance':
      case 'Fair':
        return '#ff8800';
      case 'Good':
        return '#ffff00';
      case 'Excellent':
        return '#00ff00';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      style={getPositionStyle()}
      onClick={() => setIsExpanded(!isExpanded)}
      title="Click to expand/collapse performance details"
    >
      {/* Main FPS Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: getFPSColor(metrics?.currentFPS || 0) }}>
          {metrics?.currentFPS || 0} FPS
        </span>
        {showWarning && (
          <span style={{ color: '#ff0000', fontSize: '14px' }}>⚠️</span>
        )}
        <span style={{ color: getStatusColor() }}>
          {getPerformanceStatus()}
        </span>
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', paddingTop: '8px' }}>
          <div>Frame Time: {metrics?.avgFrameTime || 0}ms</div>
          <div>Low FPS Frames: {metrics?.consecutiveLowFpsFrames || 0}</div>
          <div>Device: {metrics?.deviceCapabilities?.isLowEndDevice ? 'Low-end' : 'High-end'}</div>
          <div>Mobile: {metrics?.deviceCapabilities?.isMobile ? 'Yes' : 'No'}</div>
          <div>Memory: {metrics?.deviceCapabilities?.memory || 0}GB</div>
          <div>Cores: {metrics?.deviceCapabilities?.cores || 0}</div>
          
          {/* Optimization Settings */}
          <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', paddingTop: '8px' }}>
            <div>Quality: {settings?.renderQuality || 'Unknown'}</div>
            <div>Particles: {settings?.particleCount || 0}</div>
            <div>Stars: {settings?.starCount || 0}</div>
            <div>Shadows: {settings?.enableShadows ? 'On' : 'Off'}</div>
            <div>Effects: {settings?.enableBackgroundEffects ? 'On' : 'Off'}</div>
          </div>

          {/* Performance Actions */}
          <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', paddingTop: '8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                performanceOptimizer.reset();
                updateMetrics();
              }}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                marginRight: '4px'
              }}
            >
              Reset
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Performance Metrics:', metrics);
                console.log('Optimization Settings:', settings);
              }}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Log
            </button>
          </div>
        </div>
      )}

      {/* Performance Warning Banner */}
      {showWarning && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '0',
            right: '0',
            backgroundColor: '#ff0000',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            textAlign: 'center',
            animation: 'pulse 2s infinite'
          }}
        >
          ⚠️ Low Performance Detected
        </div>
      )}
    </div>
  );
};

// CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

export default PerformanceMonitor; 