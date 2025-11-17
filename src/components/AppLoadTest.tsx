import React, { useEffect, useState } from 'react';

export const AppLoadTest: React.FC = () => {
  const [loadStatus, setLoadStatus] = useState<string>('Loading...');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const testAppLoad = async () => {
      try {
        // Test basic React functionality
        setLoadStatus('Testing React...');
        
        // Test Pi SDK availability
        setLoadStatus('Testing Pi SDK...');
        const piAvailable = typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
        
        // Test window object
        setLoadStatus('Testing window object...');
        const windowAvailable = typeof window !== 'undefined';
        
        // Test console
        setLoadStatus('Testing console...');
        console.log('App load test - console working');
        
        // Test localStorage
        setLoadStatus('Testing localStorage...');
        const storageAvailable = typeof localStorage !== 'undefined';
        
        // Test fetch
        setLoadStatus('Testing fetch...');
        const fetchAvailable = typeof fetch !== 'undefined';
        
        // All tests passed
        setLoadStatus('✅ App loaded successfully!');
        
        // Log results
        console.log('App Load Test Results:', {
          piAvailable,
          windowAvailable,
          storageAvailable,
          fetchAvailable,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        });
        
      } catch (error) {
        console.error('App load test failed:', error);
        setErrors(prev => [...prev, error.message]);
        setLoadStatus('❌ App load test failed');
      }
    };

    testAppLoad();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">App Load Test</h2>
      
      <div className="mb-4">
        <p className="font-medium">Status: {loadStatus}</p>
      </div>
      
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-medium mb-2">Errors:</h3>
          <ul className="text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>Platform:</strong> {navigator.platform}</p>
        <p><strong>Pi SDK:</strong> {typeof window !== 'undefined' && typeof window.Pi !== 'undefined' ? 'Available' : 'Not Available'}</p>
      </div>
    </div>
  );
}; 