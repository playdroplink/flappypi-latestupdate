import React from 'react';

const FullscreenIntegrationGuide: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Device-Adaptive Fullscreen Integration Guide</h1>
      
      <div className="space-y-6">
        {/* Mobile Recommendations */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">📱 Mobile Recommendations</h2>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li><strong>Auto-fullscreen:</strong> Automatically enters fullscreen when game starts</li>
            <li><strong>Hide browser UI:</strong> Removes address bar and browser chrome</li>
            <li><strong>Prevent zoom:</strong> Disables pinch-to-zoom during gameplay</li>
            <li><strong>Lock orientation:</strong> Locks to landscape for better gaming</li>
            <li><strong>Touch optimizations:</strong> Prevents context menu and scrolling</li>
            <li><strong>Hardware acceleration:</strong> Uses GPU for smooth performance</li>
          </ul>
        </div>

        {/* Tablet Recommendations */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-green-800">📱 Tablet Recommendations</h2>
          <ul className="list-disc list-inside space-y-2 text-green-700">
            <li><strong>Immersive mode:</strong> Hides browser UI but keeps system UI</li>
            <li><strong>Prevent zoom:</strong> Disables zoom during gameplay</li>
            <li><strong>Flexible orientation:</strong> Works in both portrait and landscape</li>
            <li><strong>Touch optimizations:</strong> Optimized for touch interactions</li>
            <li><strong>Performance monitoring:</strong> Tracks FPS and memory usage</li>
          </ul>
        </div>

        {/* Desktop Recommendations */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-purple-800">🖥️ Desktop Recommendations</h2>
          <ul className="list-disc list-inside space-y-2 text-purple-700">
            <li><strong>Optional fullscreen:</strong> User can choose to enter fullscreen</li>
            <li><strong>Keyboard shortcuts:</strong> F11 for fullscreen, Esc to exit</li>
            <li><strong>Hardware acceleration:</strong> GPU-accelerated rendering</li>
            <li><strong>Performance monitoring:</strong> Real-time FPS and memory tracking</li>
            <li><strong>Multi-monitor support:</strong> Works across multiple displays</li>
            <li><strong>Window management:</strong> Respects window state</li>
          </ul>
        </div>

        {/* Integration Code */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">🔧 Integration Code</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Basic Integration:</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import AdaptiveFullscreen from './components/adaptive/AdaptiveFullscreen';

<AdaptiveFullscreen isGameActive={gameState === 'playing'}>
  <YourGameComponent />
</AdaptiveFullscreen>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. With Custom Options:</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`<AdaptiveFullscreen 
  isGameActive={gameState === 'playing'}
  autoFullscreen={true}
  showControls={true}
>
  <YourGameComponent />
</AdaptiveFullscreen>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. CSS Import:</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import './styles/device-adaptive-fullscreen.css';`}
              </pre>
            </div>
          </div>
        </div>

        {/* Device Detection */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-yellow-800">🔍 Device Detection</h2>
          <p className="text-yellow-700 mb-3">
            The system automatically detects device type and applies appropriate optimizations:
          </p>
          <ul className="list-disc list-inside space-y-1 text-yellow-700">
            <li><strong>Mobile:</strong> Width ≤ 768px OR touch device</li>
            <li><strong>Tablet:</strong> Width 769px - 1024px AND touch device</li>
            <li><strong>Desktop:</strong> Width > 1024px AND no touch</li>
          </ul>
        </div>

        {/* Performance Tips */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-800">⚡ Performance Tips</h2>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            <li><strong>Mobile:</strong> Use hardware acceleration, prevent zoom, lock orientation</li>
            <li><strong>Tablet:</strong> Balance between mobile and desktop optimizations</li>
            <li><strong>Desktop:</strong> Enable hardware acceleration, monitor performance</li>
            <li><strong>All devices:</strong> Use CSS transforms instead of position changes</li>
            <li><strong>All devices:</strong> Minimize DOM manipulations during gameplay</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FullscreenIntegrationGuide;
