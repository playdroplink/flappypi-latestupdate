import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Terms Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              By accessing and playing Flappy Pi ("the Game"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use the Game.
            </p>
            <p className="text-gray-700">
              These Terms apply to all users of the Game, including without limitation users who are browsers, vendors, 
              customers, merchants, and/or contributors of content.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Flappy Pi is a blockchain-based game that integrates with the Pi Network platform. The Game allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Play the classic Flappy Bird game with Pi Network integration</li>
              <li>Earn rewards and achievements</li>
              <li>Make in-game purchases using Pi cryptocurrency</li>
              <li>Participate in leaderboards and competitions</li>
              <li>Access exclusive content and features</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">3. Pi Network Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">3.1 Authentication</h3>
              <p className="text-gray-700">
                The Game requires Pi Network authentication to access certain features. By using the Game, you agree to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Comply with Pi Network's terms of service</li>
                <li>Provide accurate authentication information</li>
                <li>Maintain the security of your Pi Network account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.2 Payments and Transactions</h3>
              <p className="text-gray-700">
                All in-game purchases and transactions are processed through Pi Network:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Payments are made using Pi cryptocurrency</li>
                <li>All transactions are final and non-refundable</li>
                <li>Transaction fees may apply as determined by Pi Network</li>
                <li>We are not responsible for Pi Network payment processing issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">4. User Conduct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Cheating, hacking, or using unauthorized third-party software</li>
              <li>Exploiting bugs or glitches for unfair advantage</li>
              <li>Creating multiple accounts to manipulate leaderboards</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Attempting to reverse engineer or modify the Game</li>
              <li>Using automated bots or scripts</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">5. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">5.1 Game Content</h3>
              <p className="text-gray-700">
                The Game and its content, including but not limited to graphics, text, software, music, sound, 
                and game mechanics, are owned by Flappy Pi and are protected by copyright, trademark, and other 
                intellectual property laws.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5.2 User-Generated Content</h3>
              <p className="text-gray-700">
                By submitting content to the Game, you grant us a worldwide, non-exclusive, royalty-free license 
                to use, reproduce, modify, and distribute your content in connection with the Game.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5.3 Third-Party Content</h3>
              <p className="text-gray-700">
                The Game may contain content from third parties, including Pi Network. Such content is subject 
                to the respective third-party terms and conditions.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">6. Virtual Currency and Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">6.1 Virtual Currency</h3>
              <p className="text-gray-700">
                The Game may feature virtual currency and items that can be earned or purchased:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Virtual currency has no real-world value</li>
                <li>Virtual items are licensed, not sold</li>
                <li>We may modify or discontinue virtual currency at any time</li>
                <li>Virtual currency is non-transferable and non-refundable</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">6.2 Account Termination</h3>
              <p className="text-gray-700">
                Upon account termination, all virtual currency and items will be forfeited without compensation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">7. Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">7.1 Service Availability</h3>
              <p className="text-gray-700">
                The Game is provided "as is" and "as available" without warranties of any kind. We do not 
                guarantee that the Game will be uninterrupted, secure, or error-free.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">7.2 Limitation of Liability</h3>
              <p className="text-gray-700">
                To the maximum extent permitted by law, Flappy Pi shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages arising from your use of the Game.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">7.3 Third-Party Services</h3>
              <p className="text-gray-700">
                The Game integrates with Pi Network and other third-party services. We are not responsible 
                for the availability, accuracy, or content of such services.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">8. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We may terminate or suspend your access to the Game immediately, without prior notice, for any 
              reason, including breach of these Terms. Upon termination:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Your right to use the Game will cease immediately</li>
              <li>All virtual currency and items will be forfeited</li>
              <li>Your account data may be deleted</li>
              <li>Provisions of these Terms that should survive termination will remain in effect</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting. Your continued use of the Game after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">10. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              where Flappy Pi operates, without regard to conflict of law principles.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">11. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> terms@flappypi.fun
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

export default TermsPage;
