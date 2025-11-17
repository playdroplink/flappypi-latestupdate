import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Lock, Eye, CheckCircle, XCircle } from 'lucide-react';

const PiConsentInfo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Pi Network Third-Party App Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Flappy Pi</strong> is a third-party app on Pi Network. You've consented for Pi to share your:
            </p>
          </div>

          {/* Permissions Granted */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Permissions Granted
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <User className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Auth: Authenticate you on this app with your Pi account</div>
                  <div className="text-sm text-green-600">Allows Flappy Pi to verify your identity using your Pi Network account</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <User className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Username: Your Pi username</div>
                  <div className="text-sm text-green-600">Allows Flappy Pi to display your Pi username in the game</div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Privacy */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Data Privacy
            </h3>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Pi Network Privacy Protection</div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pi Network does <strong>NOT</strong> save any data unrelated to Pi that you decide to share with any third-party apps, e.g. location.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What Flappy Pi Uses Your Data For */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">How Flappy Pi Uses Your Data</h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">Game Progress</div>
                <div className="text-sm text-gray-600">Save your high scores and game achievements</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">Leaderboards</div>
                <div className="text-sm text-gray-600">Display your username on public leaderboards</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">In-Game Purchases</div>
                <div className="text-sm text-gray-600">Process Pi cryptocurrency payments for shop items</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">Social Features</div>
                <div className="text-sm text-gray-600">Enable social challenges and community features</div>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Legal Information</h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </a>
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <a href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </a>
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <a href="https://minepi.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Pi Network Privacy Policy
                </a>
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <a href="https://minepi.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Pi Network Terms
                </a>
              </Badge>
            </div>
          </div>

          {/* Security Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Security & Data Protection
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">Encrypted Storage</div>
                <div className="text-sm text-green-600">All user data is encrypted and securely stored</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">No Personal Data</div>
                <div className="text-sm text-green-600">We only store game-related data, no personal information</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">Pi Network Security</div>
                <div className="text-sm text-green-600">Authentication handled securely by Pi Network</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">Data Control</div>
                <div className="text-sm text-green-600">You can revoke access anytime through Pi Network</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Questions About Your Data?</h4>
            <p className="text-sm text-gray-600">
              If you have any questions about how Flappy Pi uses your data or want to revoke access, 
              you can contact us through the Pi Network app or visit our support page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiConsentInfo;
