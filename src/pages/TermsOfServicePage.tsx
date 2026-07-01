import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-blue-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-0 overflow-hidden max-w-2xl w-full">
        <div className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img 
            src="/flappy pi gif/flappy-2.gif.gif" 
            alt="Flappy Pi Logo" 
            className="w-16 h-16 mb-2"
            onError={(e) => {
              console.warn('❌ Flappy Pi GIF failed to load in TermsOfServicePage, using fallback');
              e.currentTarget.src = '/flappy-logo.png';
            }}
          />
          <h1 className="text-2xl font-bold text-purple-700 mb-1">Terms of Service</h1>
          <div className="text-gray-500 text-center mb-2">
            Please read these terms carefully before using Flappy Pi.
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <Lock className="w-4 h-4 mr-1" /> Secure & Trusted
          </Badge>
        </div>
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4">
          <p><b>1. Acceptance of Terms:</b> By using Flappy Pi, you agree to these Terms of Service. If you do not agree, please do not use the app.</p>
          <p><b>2. Pi Network Payments:</b> Flappy Pi integrates with the Pi Network for in-app payments. All Pi payments in test mode use the Pi Testnet and do not transfer real Pi. When switched to mainnet, real Pi transactions will occur. Always check the payment mode before confirming a transaction.</p>
          <p><b>3. User Accounts:</b> You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
          <p><b>4. Game Content:</b> All game assets, graphics, and content are the property of Flappy Pi and may not be used without permission.</p>
          <p><b>5. Limitation of Liability:</b> Flappy Pi is provided "as is" without warranties of any kind. We are not liable for any damages or losses resulting from your use of the app or Pi Network payments.</p>
          <p><b>6. Changes to Terms:</b> We may update these terms at any time. Continued use of the app means you accept the new terms.</p>
          <p><b>7. Contact:</b> For questions, contact <a href="mailto:support@www.flappypi.xyz" className="text-blue-600 underline">support@www.flappypi.xyz</a>.</p>
        </div>
        <div className="px-8 pb-4 flex gap-2">
          <Button onClick={() => navigate(ROUTES.HOME)} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate(ROUTES.PRIVACY)} variant="outline" className="flex-1">
            Privacy Policy
          </Button>
        </div>
        <div className="text-center text-xs text-gray-400 pb-1">Powered by Pi Network</div>
        <div className="text-center text-xs text-gray-500 pb-4">Flappy Pi is a Project of <b>Mrwain Organization</b></div>
      </div>
    </div>
  );
};

export default TermsOfServicePage; 