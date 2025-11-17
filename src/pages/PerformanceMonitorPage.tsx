import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceOptimizer } from '@/utils/performanceOptimizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/context/LanguageContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import BackgroundDecoration from '@/components/home/BackgroundDecoration';
import FooterNPC from '@/components/FooterNPC';
import EnhancedFooter from '@/components/EnhancedFooter';
import { ResponsiveContainer } from '@/components/game/ResponsiveGrid';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { 
  ArrowLeft, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings
} from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  deviceScore: number;
  isLowPowerDevice: boolean;
  performanceWarnings: string[];
}

interface PerformanceSettings {
  targetFPS: number;
  enableFrameSkip: boolean;
  reduceParticleEffects: boolean;
  limitBackgroundObjects: boolean;
  useLowQualityAssets: boolean;
  skipRenderFrames: boolean;
  reduceAnimations: boolean;
  enableLowGraphicsMode: boolean;
  collisionDetectionLevel: 'basic' | 'optimized' | 'full';
  renderQuality: 'low' | 'medium' | 'high';
}

interface DeviceCapabilities {
  isLowPowerDevice: boolean;
  isMobileDevice: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasHighPerformanceGPU: boolean;
  memoryAvailable: number;
  cpuCores: number;
  deviceScore: number;
  screenResolution: string;
  pixelRatio: number;
}

const PerformanceMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings: appSettings, updateSettings } = useSettings();
  const { t } = useLanguage();
  const { soundEnabled } = useSoundEffects();
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  // Get theme based on settings
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 7) ? 'night' : 'light';
  };
  
  const theme = appSettings.theme === 'night' ? 'night' : 'light';
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    deviceScore: 0,
    isLowPowerDevice: false,
    performanceWarnings: []
  });
  const [settings, setSettings] = useState<PerformanceSettings>({
    targetFPS: 60,
    enableFrameSkip: false,
    reduceParticleEffects: false,
    limitBackgroundObjects: false,
    useLowQualityAssets: false,
    skipRenderFrames: false,
    reduceAnimations: false,
    enableLowGraphicsMode: false,
    collisionDetectionLevel: 'full',
    renderQuality: 'high'
  });
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    isLowPowerDevice: false,
    isMobileDevice: false,
    isTablet: false,
    isDesktop: false,
    hasHighPerformanceGPU: false,
    memoryAvailable: 0,
    cpuCores: 0,
    deviceScore: 0,
    screenResolution: '',
    pixelRatio: 1
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [npcDialogIndex, setNpcDialogIndex] = useState(0);
  
  const performanceDialogs = [
    "Performance monitoring is crucial for smooth gameplay! 📊",
    "Your device is performing excellently! Keep it up! 🚀",
    "I can see all your system metrics in real-time! 🔍",
    "Let me know if you need any performance tips! 💡",
    "Your FPS looks great! Smooth gaming ahead! 🎮",
    "Memory usage is optimal! No bottlenecks detected! ⚡",
    "GPU performance is excellent for this game! 🎯",
    "Keep monitoring these metrics for the best experience! 📈",
    "Your device tier is perfect for Flappy Pi! 🏆",
    "Performance optimization is working perfectly! ✨",
    "Frame rate analysis shows excellent stability! 📊",
    "Your CPU cores are handling the load beautifully! 🧠",
    "No thermal throttling detected! Your device is cool! ❄️",
    "Graphics rendering is smooth and efficient! 🎨",
    "Input latency is minimal! Responsive controls! ⚡",
    "Background processes aren't interfering! Clean system! 🧹",
    "Your device memory is well-managed! 💾",
    "Network performance is optimal for online features! 🌐",
    "Audio processing is smooth and clear! 🎵",
    "Battery optimization is working perfectly! 🔋",
    "Your screen refresh rate is ideal! 📱",
    "No memory leaks detected! Stable performance! 🛡️",
    "Cache management is efficient! Fast loading! ⚡",
    "Your device handles multitasking well! 🔄",
    "Graphics drivers are up to date! 🎮",
    "System resources are balanced perfectly! ⚖️",
    "No background apps are consuming resources! 🚫",
    "Your device temperature is optimal! 🌡️",
    "Storage read/write speeds are excellent! 💿",
    "Network latency is minimal! Fast connections! 🌐",
    "Your device supports all game features! ✅",
    "Performance scaling is working correctly! 📈",
    "No performance degradation over time! 📊",
    "Your device meets all recommended specs! 🎯",
    "Graphics quality settings are optimal! 🎨",
    "Audio quality is crystal clear! 🎵",
    "Input responsiveness is excellent! ⚡",
    "No frame drops detected! Smooth gameplay! 🎮",
    "Your device handles particle effects well! ✨",
    "Background animations are smooth! 🌟",
    "Loading times are minimal! Fast startup! 🚀",
    "Your device supports high refresh rates! 📱",
    "No performance bottlenecks found! 🛡️",
    "System optimization is working perfectly! ⚙️",
    "Your device handles complex scenes well! 🎭",
    "Graphics rendering is efficient! 🎨",
    "Memory allocation is optimal! 💾",
    "No performance spikes detected! 📊",
    "Your device supports advanced features! 🚀",
    "Performance monitoring is comprehensive! 📈",
    "System stability is excellent! 🛡️",
    "Your device is performance-ready! ✅"
  ];

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = performanceOptimizer.getPerformanceMetrics();
      const newSettings = performanceOptimizer.getOptimizedSettings();
      const newDeviceCapabilities = performanceOptimizer.getDeviceCapabilities();
      const newRecommendations = performanceOptimizer.getPerformanceRecommendations();
      
      setMetrics(newMetrics);
      setSettings(newSettings);
      setDeviceCapabilities(newDeviceCapabilities);
      setRecommendations(newRecommendations);
    };

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = () => {
    if (metrics.fps >= 55) return { status: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-100' };
    if (metrics.fps >= 45) return { status: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-100' };
    if (metrics.fps >= 30) return { status: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-500', bgColor: 'bg-red-100' };
  };

  const getDeviceTier = () => {
    if (deviceCapabilities.deviceScore >= 80) return { tier: 'High-End', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (deviceCapabilities.deviceScore >= 50) return { tier: 'Mid-Range', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { tier: 'Low-End', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  };

  const performanceStatus = getPerformanceStatus();
  const deviceTier = getDeviceTier();

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
      theme === 'night' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800'
    }`}>
      {/* Background Decoration */}
      <BackgroundDecoration />
      
      <div className="relative z-10">
        <ResponsiveContainer maxWidth="1200px">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home')}
                className={`hover:bg-opacity-20 ${
                  theme === 'night' 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  theme === 'night' ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <Monitor className={`w-6 h-6 ${
                    theme === 'night' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <h1 className={`text-3xl font-bold ${
                  theme === 'night' ? 'text-white' : 'text-gray-800'
                }`}>
                  Performance Monitor
                </h1>
              </div>
            </div>
            <Badge variant="outline" className={`text-sm ${
              theme === 'night' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'
            }`}>
              Real-time Monitoring
            </Badge>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <Card className={`shadow-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            theme === 'night' 
              ? 'bg-gray-800/90 border-gray-600 text-white backdrop-blur-sm hover:border-gray-500' 
              : 'bg-white/90 border-gray-200 text-gray-800 backdrop-blur-sm hover:border-gray-300'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-3 rounded-lg ${
                  theme === 'night' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl font-bold text-blue-600">{metrics.fps}</div>
                  <div className={`text-sm ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                  }`}>FPS</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  theme === 'night' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="text-2xl font-bold text-green-600">{Math.round(metrics.frameTime)}ms</div>
                  <div className={`text-sm ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Frame Time</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Performance Status</span>
                  <Badge className={`${performanceStatus.bgColor} ${performanceStatus.color}`}>
                    {performanceStatus.status}
                  </Badge>
                </div>
                <Progress value={(metrics.fps / settings.targetFPS) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Device Tier</span>
                  <Badge className={`${deviceTier.bgColor} ${deviceTier.color}`}>
                    {deviceTier.tier}
                  </Badge>
                </div>
                <Progress value={deviceCapabilities.deviceScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card className={`shadow-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            theme === 'night' 
              ? 'bg-gray-800/90 border-gray-600 text-white backdrop-blur-sm hover:border-gray-500' 
              : 'bg-white/90 border-gray-200 text-gray-800 backdrop-blur-sm hover:border-gray-300'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-500" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm font-medium ${
                      theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Memory</span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    theme === 'night' ? 'text-white' : 'text-gray-800'
                  }`}>{deviceCapabilities.memoryAvailable}GB</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-green-500" />
                    <span className={`text-sm font-medium ${
                      theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                    }`}>CPU Cores</span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    theme === 'night' ? 'text-white' : 'text-gray-800'
                  }`}>{deviceCapabilities.cpuCores}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Screen Resolution</span>
                </div>
                <div className={`text-sm ${
                  theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                }`}>{deviceCapabilities.screenResolution}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Device Type</span>
                  <div className="flex gap-2">
                    {deviceCapabilities.isMobileDevice && <Badge variant="secondary">Mobile</Badge>}
                    {deviceCapabilities.isTablet && <Badge variant="secondary">Tablet</Badge>}
                    {deviceCapabilities.isDesktop && <Badge variant="secondary">Desktop</Badge>}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>GPU Performance</span>
                  <Badge variant={deviceCapabilities.hasHighPerformanceGPU ? "default" : "secondary"}>
                    {deviceCapabilities.hasHighPerformanceGPU ? 'High' : 'Standard'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card className={`shadow-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            theme === 'night' 
              ? 'bg-gray-800/90 border-gray-600 text-white backdrop-blur-sm hover:border-gray-500' 
              : 'bg-white/90 border-gray-200 text-gray-800 backdrop-blur-sm hover:border-gray-300'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Performance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Target FPS</span>
                  <div className={`text-lg font-semibold ${
                    theme === 'night' ? 'text-white' : 'text-gray-800'
                  }`}>{settings.targetFPS}</div>
                </div>
                <div className="space-y-2">
                  <span className={`text-sm font-medium ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Frame Skip</span>
                  <Badge variant={settings.enableFrameSkip ? "destructive" : "secondary"}>
                    {settings.enableFrameSkip ? 'ON' : 'OFF'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Particle Effects</span>
                  <Badge variant={settings.reduceParticleEffects ? "secondary" : "default"}>
                    {settings.reduceParticleEffects ? 'Reduced' : 'Full'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Background Objects</span>
                  <Badge variant={settings.limitBackgroundObjects ? "secondary" : "default"}>
                    {settings.limitBackgroundObjects ? 'Limited' : 'Full'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Render Quality</span>
                  <Badge variant="outline" className="capitalize">
                    {settings.renderQuality}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    theme === 'night' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Collision Detection</span>
                  <Badge variant="outline" className="capitalize">
                    {settings.collisionDetectionLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings & Recommendations */}
          <Card className={`shadow-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            theme === 'night' 
              ? 'bg-gray-800/90 border-gray-600 text-white backdrop-blur-sm hover:border-gray-500' 
              : 'bg-white/90 border-gray-200 text-gray-800 backdrop-blur-sm hover:border-gray-300'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Warnings & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warnings */}
              {metrics.performanceWarnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Warnings</span>
                  </div>
                  <div className="space-y-1">
                    {metrics.performanceWarnings.map((warning, index) => (
                      <div key={index} className={`text-sm p-2 rounded ${
                        theme === 'night' 
                          ? 'text-orange-400 bg-orange-900/20' 
                          : 'text-orange-600 bg-orange-50'
                      }`}>
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Recommendations</span>
                  </div>
                  <div className="space-y-1">
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className={`text-sm p-2 rounded ${
                        theme === 'night' 
                          ? 'text-green-400 bg-green-900/20' 
                          : 'text-green-600 bg-green-50'
                      }`}>
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metrics.performanceWarnings.length === 0 && recommendations.length === 0 && (
                <div className={`text-center py-4 ${
                  theme === 'night' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No issues detected. Performance is optimal!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Test Button */}
        <div className="mt-8 text-center mb-8">
          <Button 
            onClick={() => {
              // Run a quick performance test
              const testStart = performance.now();
              let testFrames = 0;
              const testDuration = 1000; // 1 second
              
              const testLoop = () => {
                testFrames++;
                if (performance.now() - testStart < testDuration) {
                  requestAnimationFrame(testLoop);
                } else {
                  const testFPS = Math.round(testFrames);
                  alert(`Performance Test Results:\nFPS: ${testFPS}\nStatus: ${testFPS >= 50 ? 'Excellent' : testFPS >= 30 ? 'Good' : 'Needs Improvement'}`);
                }
              };
              
              requestAnimationFrame(testLoop);
            }}
            className={`${
              theme === 'night' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Run Performance Test
          </Button>
        </div>
        </ResponsiveContainer>
      </div>
      
      {/* Performance NPC */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 0 0 0',
            cursor: 'pointer',
          }}
          onClick={() => {
            console.log('Performance NPC clicked!');
            setNpcDialogIndex((prev) => (prev + 1) % performanceDialogs.length);
          }}
        >
          {/* Dialog bubble above NPC */}
          <div
            className="npc-dialog-bubble"
            style={{
              background: theme === 'night' ? '#1f2937' : '#fff',
              borderRadius: 16,
              padding: '10px 18px',
              boxShadow: theme === 'night' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
              fontWeight: 500,
              fontSize: 16,
              color: theme === 'night' ? '#ffffff' : '#333',
              textAlign: 'center',
              maxWidth: 320,
              marginBottom: 8,
              border: '2px solid #fbbf24',
              userSelect: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {performanceDialogs[npcDialogIndex]}
          </div>
          {/* NPC Sprite below dialog */}
          <img
            src="/npc gif/npc-6.gif.gif"
            alt="Performance NPC"
            className="animate-bounce-slow"
            style={{ 
              width: 88, 
              height: 'auto', 
              display: 'block', 
              margin: '0 auto',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
          {/* NPC Name below sprite */}
          <div className="npc-name-text" style={{ 
            fontSize: 15, 
            color: theme === 'night' ? '#e5e7eb' : '#888', 
            fontWeight: 500, 
            textAlign: 'center', 
            marginTop: 4,
            transition: 'color 0.2s ease-in-out'
          }}>
            Performance NPC
            <div className="npc-subtitle-text" style={{ 
              fontSize: 12, 
              color: theme === 'night' ? '#d1d5db' : '#aaa', 
              marginTop: 2,
              opacity: 0.7
            }}>
              Click to chat! 💬
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Footer */}
      <EnhancedFooter 
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={soundEnabled}
        setSoundEnabled={() => {}}
        piUser={null}
        fixed={false}
      />
    </div>
  );
};

export default PerformanceMonitorPage; 