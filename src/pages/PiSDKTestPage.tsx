import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testPiSDK, PiSDKTestSuite, PiSDKTestResult } from '../utils/piSDKTest';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import { ArrowLeft, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PiNetworkExample } from '../components/PiNetworkExample';
import { PiAdNetworkExample } from '../components/PiAdNetworkExample';
import { AppLoadTest } from '../components/AppLoadTest';
import { RealPiPaymentExample } from '../components/RealPiPaymentExample';
import PiBrowserDetectionTest from '../components/PiBrowserDetectionTest';
import PiBrowserDetectionDebug from '../components/PiBrowserDetectionDebug';
import PiBrowserWhiteScreenDebug from '../components/PiBrowserWhiteScreenDebug';
import LoadingScreen from '../components/LoadingScreen';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

export default function PiSDKTestPage() {
  const { settings } = useSettings();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-6 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 text-center w-full">Pi SDK Test Page</h1>
        <div className="w-full space-y-6 px-1 sm:px-0">
          {/* Pi Browser White Screen Debug - at top */}
          <div className="w-full">
            <div className="h-2 w-full bg-yellow-200 rounded-t mb-2" />
            <PiBrowserWhiteScreenDebug />
          </div>
          {/* App Load Test */}
          <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center text-base">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center w-full">App Load Test</h2>
            <p className="text-sm text-gray-600 mb-2 text-center w-full">
              This test verifies that the app loads correctly in Pi Browser mobile.
            </p>
            <AppLoadTest />
          </div>
          {/* Pi Browser Detection Debug */}
          <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center text-base">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center w-full">Pi Browser Detection Debug</h2>
            <PiBrowserDetectionDebug />
          </div>
          {/* Pi Browser Detection Test */}
          <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center text-base">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center w-full">Pi Browser Detection Test</h2>
            <p className="text-sm text-gray-600 mb-2 text-center w-full">
              This test provides detailed analysis of Pi Browser detection methods and their results.
            </p>
            <PiBrowserDetectionTest />
          </div>
          {/* Real Pi Payment Integration Example */}
          <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center text-base">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center w-full">Real Pi Payment Integration Example</h2>
            <p className="text-sm text-gray-600 mb-2 text-center w-full">
              This example demonstrates real Pi payments for shop items and subscription plans with automatic reward delivery.
            </p>
            <RealPiPaymentExample />
          </div>
        </div>
      </div>
    </SkyBackground>
  );
} 