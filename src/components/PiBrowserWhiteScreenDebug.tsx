import React, { useState, useEffect } from 'react';

interface DebugInfo {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
  details?: any;
}

const PiBrowserWhiteScreenDebug: React.FC = () => {
  const [debugLogs, setDebugLogs] = useState<DebugInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTime, setLoadTime] = useState<number>(0);
  const [errorCount, setErrorCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);

  const addLog = (message: string, type: 'info' | 'error' | 'warning' | 'success', details?: any) => {
    const log: DebugInfo = {
      timestamp: new Date().toISOString(),
      message,
      type,
      details
    };
    setDebugLogs(prev => [...prev, log]);
    
    if (type === 'error') setErrorCount(prev => prev + 1);
    if (type === 'warning') setWarningCount(prev => prev + 1);
  };

  useEffect(() => {
    const startTime = performance.now();
    
    // Override console methods to capture logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    console.log = (...args) => {
      addLog(args.join(' '), 'info', args);
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog(args.join(' '), 'error', args);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog(args.join(' '), 'warning', args);
      originalConsoleWarn.apply(console, args);
    };

    console.info = (...args) => {
      addLog(args.join(' '), 'info', args);
      originalConsoleInfo.apply(console, args);
    };

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      addLog(`Unhandled Error: ${event.message}`, 'error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog(`Unhandled Promise Rejection: ${event.reason}`, 'error', {
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Test critical dependencies
    const testDependencies = () => {
      addLog('🔍 Testing critical dependencies...', 'info');
      
      // Test React
      try {
        if (typeof React !== 'undefined') {
          addLog('✅ React is available', 'success');
        } else {
          addLog('❌ React is not available', 'error');
        }
      } catch (e) {
        addLog(`❌ React test failed: ${e}`, 'error');
      }

      // Test DOM
      try {
        if (typeof document !== 'undefined') {
          addLog('✅ DOM is available', 'success');
        } else {
          addLog('❌ DOM is not available', 'error');
        }
      } catch (e) {
        addLog(`❌ DOM test failed: ${e}`, 'error');
      }

      // Test window
      try {
        if (typeof window !== 'undefined') {
          addLog('✅ Window is available', 'success');
        } else {
          addLog('❌ Window is not available', 'error');
        }
      } catch (e) {
        addLog(`❌ Window test failed: ${e}`, 'error');
      }

      // Test Pi SDK
      try {
        if (typeof window !== 'undefined' && window.Pi) {
          addLog('✅ Pi SDK is available', 'success');
          const methods = Object.keys(window.Pi);
          addLog(`Pi SDK methods: ${methods.join(', ')}`, 'info');
        } else {
          addLog('⚠️ Pi SDK is not available (this is normal in non-Pi browsers)', 'warning');
        }
      } catch (e) {
        addLog(`❌ Pi SDK test failed: ${e}`, 'error');
      }
    };

    // Test network connectivity
    const testNetwork = async () => {
      addLog('🌐 Testing network connectivity...', 'info');
      
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          addLog('✅ Network connectivity is working', 'success');
        } else {
          addLog(`⚠️ Network response: ${response.status}`, 'warning');
        }
      } catch (e) {
        addLog(`❌ Network test failed: ${e}`, 'error');
      }
    };

    // Test localStorage
    const testStorage = () => {
      addLog('💾 Testing storage access...', 'info');
      
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        addLog('✅ localStorage is working', 'success');
      } catch (e) {
        addLog(`❌ localStorage test failed: ${e}`, 'error');
      }
    };

    // Test CSS loading
    const testCSS = () => {
      addLog('🎨 Testing CSS loading...', 'info');
      
      const styles = getComputedStyle(document.body);
      if (styles.fontFamily) {
        addLog('✅ CSS is loaded', 'success');
      } else {
        addLog('⚠️ CSS may not be loaded properly', 'warning');
      }
    };

    // Run all tests
    const runTests = async () => {
      addLog('🚀 Starting Pi Browser White Screen Debug...', 'info');
      
      testDependencies();
      await testNetwork();
      testStorage();
      
      // Wait a bit for CSS to load
      setTimeout(() => {
        testCSS();
        setIsLoading(false);
        setLoadTime(performance.now() - startTime);
        addLog(`✅ Debug complete. Load time: ${Math.round(performance.now() - startTime)}ms`, 'success');
      }, 1000);
    };

    runTests();

    // Cleanup
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    setErrorCount(0);
    setWarningCount(0);
  };

  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      loadTime,
      errorCount,
      warningCount,
      logs: debugLogs,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pi-browser-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🐛 Pi Browser White Screen Debug</h2>
      
      {/* Status Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Status:</span>
            <span className={`ml-2 ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
              {isLoading ? '🔄 Running...' : '✅ Complete'}
            </span>
          </div>
          <div>
            <span className="font-medium">Load Time:</span>
            <span className="ml-2 text-gray-600">{Math.round(loadTime)}ms</span>
          </div>
          <div>
            <span className="font-medium">Errors:</span>
            <span className={`ml-2 ${errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {errorCount}
            </span>
          </div>
          <div>
            <span className="font-medium">Warnings:</span>
            <span className={`ml-2 ${warningCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {warningCount}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear Logs
        </button>
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Logs
        </button>
      </div>

      {/* Debug Logs */}
      <div className="max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Debug Logs</h3>
        <div className="space-y-2">
          {debugLogs.map((log, index) => (
            <div key={index} className={`p-3 rounded-lg ${getLogColor(log.type)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{log.message}</div>
                  <div className="text-xs opacity-75">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  {log.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">Show Details</summary>
                      <pre className="text-xs mt-1 bg-black/10 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="ml-2 text-xs opacity-75">
                  {log.type.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Troubleshooting Tips</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• <strong>White Screen:</strong> Usually caused by JavaScript errors or missing dependencies</p>
          <p>• <strong>Network Issues:</strong> Check if the app can reach external APIs</p>
          <p>• <strong>Pi SDK Issues:</strong> Ensure you're using Pi Browser mobile app</p>
          <p>• <strong>Storage Issues:</strong> Pi Browser may block localStorage in some cases</p>
          <p>• <strong>CSS Issues:</strong> Check if styles are loading properly</p>
          <p>• <strong>Export Logs:</strong> Share the debug logs with developers for analysis</p>
        </div>
      </div>
    </div>
  );
};

export default PiBrowserWhiteScreenDebug; 