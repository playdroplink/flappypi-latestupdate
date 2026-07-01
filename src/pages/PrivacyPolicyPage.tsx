import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, Home, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-blue-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-0 overflow-hidden max-w-2xl w-full">
        <div className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-2xl font-bold text-purple-700 mb-1">Privacy Policy</h1>
          <div className="text-gray-500 text-center mb-2">
            Your privacy is important to us. Please review our policy below.
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <Shield className="w-4 h-4 mr-1" /> Privacy Protected
          </Badge>
        </div>
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4">
          <p><b>1. Data Collection:</b> Flappy Pi collects only the minimum data required to provide game services, such as your username, game progress, and Pi Network ID.</p>
          <p><b>2. Payment Data:</b> When you make Pi payments, we process transaction details through the Pi Network. In mainnet, real Pi transactions are processed securely by the Pi Network.</p>
          <p><b>3. Cookies & Local Storage:</b> We use local storage to save your game progress and preferences. No third-party tracking cookies are used.</p>
          <p><b>4. Data Sharing:</b> We do not sell or share your personal data with third parties, except as required by law or to process Pi Network payments.</p>
          <p><b>5. Security:</b> We use industry-standard security measures to protect your data. However, no system is 100% secure.</p>
          <p><b>6. Children's Privacy:</b> Flappy Pi is not intended for children under 13. We do not knowingly collect data from children under 13.</p>
          <p><b>7. Changes to Policy:</b> We may update this policy. Continued use of the app means you accept the new policy.</p>
          <p><b>8. Contact:</b> For privacy questions, contact <a href="mailto:support@www.flappypi.xyz" className="text-blue-600 underline">support@www.flappypi.xyz</a>.</p>
        </div>
        <div className="px-8 pb-4 flex gap-2">
          <Button onClick={() => navigate(ROUTES.HOME)} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate(ROUTES.TERMS)} variant="outline" className="flex-1">
            Terms of Service
          </Button>
        </div>
        <div className="text-center text-xs text-gray-400 pb-1">Powered by Pi Network</div>
        <div className="text-center text-xs text-gray-500 pb-4">Flappy Pi is a Project of <b>Mrwain Organization</b></div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 