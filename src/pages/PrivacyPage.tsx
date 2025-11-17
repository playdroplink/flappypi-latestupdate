import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Game
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Privacy Policy Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1.1 Pi Network Authentication</h3>
              <p className="text-gray-700">
                When you authenticate with Pi Network, we collect:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Your Pi Network username</li>
                <li>Your Pi Network user ID (UID)</li>
                <li>Authentication tokens for secure API access</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">1.2 Game Data</h3>
              <p className="text-gray-700">
                We collect game-related information including:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Game scores and achievements</li>
                <li>In-game purchases and transactions</li>
                <li>Game preferences and settings</li>
                <li>Device information for optimal gameplay</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">1.3 Technical Information</h3>
              <p className="text-gray-700">
                We automatically collect technical data such as:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device type and operating system</li>
                <li>Game performance metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">2.1 Game Functionality</h3>
              <p className="text-gray-700">
                We use your information to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Provide and maintain the Flappy Pi game</li>
                <li>Process Pi Network payments and transactions</li>
                <li>Display personalized game content and rewards</li>
                <li>Track your progress and achievements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2.2 Communication</h3>
              <p className="text-gray-700">
                We may use your information to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Send important game updates and notifications</li>
                <li>Respond to your support requests</li>
                <li>Provide customer service and technical support</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2.3 Analytics and Improvement</h3>
              <p className="text-gray-700">
                We analyze game data to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Improve game performance and user experience</li>
                <li>Identify and fix bugs and issues</li>
                <li>Develop new features and content</li>
                <li>Ensure fair gameplay and prevent cheating</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">3.1 Pi Network Integration</h3>
              <p className="text-gray-700">
                We share necessary information with Pi Network for:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Payment processing and verification</li>
                <li>User authentication and security</li>
                <li>Ad verification and rewards</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.2 Service Providers</h3>
              <p className="text-gray-700">
                We may share data with trusted third-party services for:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Hosting and infrastructure services</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support tools</li>
                <li>Payment processing (through Pi Network)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.3 Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose your information if required by law or to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Comply with legal obligations</li>
                <li>Protect our rights and property</li>
                <li>Prevent fraud or security threats</li>
                <li>Ensure user safety and fair gameplay</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">4. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication through Pi Network</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
              <li>Secure payment processing</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Export your data in a portable format</li>
              <li>Contact us with privacy concerns</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">6. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@flappypi.fun
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong> https://flappypi.fun
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2024 Flappy Pi. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
