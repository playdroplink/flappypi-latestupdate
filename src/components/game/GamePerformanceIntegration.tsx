import React from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { performanceOptimizer } from '../../utils/gamePerformanceOptimizer';

/**
 * Game Performance Integration Component
 * 
 * This component provides a simple way to integrate performance optimizations
 * into existing game components. Simply wrap your game component with this
 * and add the PerformanceMonitor.
 */

interface GamePerformanceIntegrationProps {
  children: React.ReactNode;
  showPerformanceMonitor?: boolean;
  performanceMonitorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onPerformanceWarning?: (metrics: any) => void;
}

export const GamePerformanceIntegration: React.FC<GamePerformanceIntegrationProps> = ({
  children,
  showPerformanceMonitor = typeof window !== 'undefined' && window.location.hostname === 'localhost',
  performanceMonitorPosition = 'top-right',
  onPerformanceWarning
}) => {
  // Initialize performance optimizer when component mounts
  React.useEffect(() => {
    // Reset performance state for new game session
    performanceOptimizer.reset();
    
    console.log('🎮 Game Performance Integration initialized');
    console.log('🔧 Device capabilities:', performanceOptimizer.getPerformanceMetrics().deviceCapabilities);
    console.log('⚙️ Optimized settings:', performanceOptimizer.getOptimizedSettings());
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Your game component */}
      {children}
      
      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <PerformanceMonitor
          show={true}
          position={performanceMonitorPosition}
          showDetails={true}
          onPerformanceWarning={onPerformanceWarning}
        />
      )}
    </div>
  );
};

/**
 * Hook for easy performance optimization integration
 */
export const useGamePerformance = () => {
  const [performanceMetrics, setPerformanceMetrics] = React.useState<any>(null);
  const [optimizedSettings, setOptimizedSettings] = React.useState<any>(null);

  React.useEffect(() => {
    const updateMetrics = () => {
      setPerformanceMetrics(performanceOptimizer.getPerformanceMetrics());
      setOptimizedSettings(performanceOptimizer.getOptimizedSettings());
    };

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const resetPerformance = React.useCallback(() => {
    performanceOptimizer.reset();
  }, []);

  const getPerformanceStatus = React.useCallback(() => {
    if (!performanceMetrics) return 'Unknown';
    
    if (performanceMetrics.emergencyMode) return 'Emergency';
    if (performanceMetrics.isLowPerformanceMode) return 'Low Performance';
    if (performanceMetrics.currentFPS >= 55) return 'Excellent';
    if (performanceMetrics.currentFPS >= 45) return 'Good';
    if (performanceMetrics.currentFPS >= 30) return 'Fair';
    return 'Poor';
  }, [performanceMetrics]);

  return {
    performanceMetrics,
    optimizedSettings,
    resetPerformance,
    getPerformanceStatus,
    isLowPerformance: performanceMetrics?.isLowPerformanceMode || false,
    isEmergencyMode: performanceMetrics?.emergencyMode || false,
    currentFPS: performanceMetrics?.currentFPS || 0
  };
};

/**
 * Example usage:
 * 
 * // In your game component:
 * 
 * import { GamePerformanceIntegration, useGamePerformance } from './GamePerformanceIntegration';
 * 
 * const MyGameComponent = () => {
 *   const { currentFPS, isLowPerformance, resetPerformance } = useGamePerformance();
 * 
 *   return (
 *     <GamePerformanceIntegration
 *       showPerformanceMonitor={true}
 *       onPerformanceWarning={(metrics) => {
 *         console.warn('Performance warning:', metrics);
 *       }}
 *     >
 *       {/* Your game content */}
 *       <div>Your game here</div>
 *       
 *       {/* Optional: Show performance info in your UI */}
 *       {isLowPerformance && (
 *         <div style={{ color: 'red' }}>
 *           Low Performance Mode Active - FPS: {currentFPS}
 *         </div>
 *       )}
 *     </GamePerformanceIntegration>
 *   );
 * };
 */

export default GamePerformanceIntegration;
