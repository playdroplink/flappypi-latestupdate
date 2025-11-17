import React, { useState, useEffect } from 'react';
import { testPiSDK, PiSDKTestSuite, PiSDKTestResult } from '../utils/piSDKTest';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';

interface TestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PiSDKTestPanel: React.FC<TestPanelProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<PiSDKTestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testReport, setTestReport] = useState<string>('');
  const { isPiBrowser, isMobile } = usePiBrowserDetection();

  const runCompleteTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    setTestReport('');
    
    try {
      console.log('🚀 Starting Pi SDK Test Suite...');
      const results = await testPiSDK.complete();
      setTestResults(results);
      
      // Generate report
      const report = testPiSDK.report();
      setTestReport(report);
      
      console.log('✅ Pi SDK Test Suite completed');
    } catch (error) {
      console.error('❌ Pi SDK Test Suite failed:', error);
      setTestReport(`❌ Test Suite Error: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runIndividualTest = async (testName: string, testFunction: () => Promise<PiSDKTestResult>) => {
    setCurrentTest(testName);
    try {
      const result = await testFunction();
      console.log(`${testName} result:`, result);
      
      // Update test results if we have them
      if (testResults) {
        setTestResults(prev => prev ? {
          ...prev,
          [testName.toLowerCase()]: result
        } : null);
      }
      
      return result;
    } catch (error) {
      console.error(`${testName} failed:`, error);
      return { testName, success: false, error: error.message };
    } finally {
      setCurrentTest('');
    }
  };

  const TestResultItem: React.FC<{ result: PiSDKTestResult }> = ({ result }) => (
    <div className={`p-3 rounded-lg border ${
      result.success 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{result.testName}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {result.success ? 'PASS' : 'FAIL'}
        </span>
      </div>
      {result.error && (
        <p className="text-sm mt-1 text-red-600">{result.error}</p>
      )}
      {result.details && (
        <details className="mt-2">
          <summary className="text-sm cursor-pointer text-blue-600">Details</summary>
          <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(result.details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🧪 Pi SDK Test Panel</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 text-sm opacity-90">
            Environment: {isPiBrowser ? 'Pi Browser' : 'Other Browser'} | 
            Mobile: {isMobile ? 'Yes' : 'No'}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Test Controls */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={runCompleteTest}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '🔄 Running Tests...' : '🚀 Run Complete Test Suite'}
              </button>
              
              <button
                onClick={() => runIndividualTest('Authentication', testPiSDK.authentication)}
                disabled={isRunning}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔐 Test Auth
              </button>
              
              <button
                onClick={() => runIndividualTest('Ads', testPiSDK.ads)}
                disabled={isRunning}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📺 Test Ads
              </button>
              
              <button
                onClick={() => runIndividualTest('Banner', testPiSDK.banner)}
                disabled={isRunning}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎯 Test Banner
              </button>
            </div>
            
            {currentTest && (
              <div className="text-sm text-blue-600">
                🔄 Currently running: {currentTest}
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TestResultItem result={testResults.authentication} />
                <TestResultItem result={testResults.payment} />
                <TestResultItem result={testResults.ads} />
                <TestResultItem result={testResults.banner} />
                <TestResultItem result={testResults.nativeFeatures} />
                <TestResultItem result={testResults.overall} />
              </div>
            </div>
          )}

          {/* Test Report */}
          {testReport && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Report</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {testReport}
                </pre>
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Environment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Pi Browser:</strong> {isPiBrowser ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Mobile:</strong> {isMobile ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Pi SDK Available:</strong> {typeof window !== 'undefined' && window.Pi ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'Unknown'}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Testing Instructions</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• <strong>Pi Browser Required:</strong> Tests work best in Pi Browser mobile app</p>
              <p>• <strong>Authentication:</strong> Will prompt for Pi login</p>
              <p>• <strong>Ads Test:</strong> Checks ad network support and availability</p>
              <p>• <strong>Banner Test:</strong> Banner ads removed from application</p>
              <p>• <strong>Native Features:</strong> Lists all available Pi features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiSDKTestPanel; 