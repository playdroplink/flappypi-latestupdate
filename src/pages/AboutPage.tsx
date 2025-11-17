import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/context/LanguageContext';
import { useGlobalMusic } from '@/hooks/useGlobalMusic';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isPlaying, currentTrack } = useGlobalMusic();

  return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-blue-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-0 overflow-hidden max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img 
            src="/flappy pi gif/flappy-2.gif.gif" 
            alt="Flappy Pi Logo" 
            className="w-16 h-16 mb-2"
            onError={(e) => {
              console.warn('❌ Flappy Pi GIF failed to load in AboutPage, using fallback');
              e.currentTarget.src = '/flappy-logo.png';
            }}
          />
          <h1 className="text-2xl font-bold text-purple-700 mb-1">{t('aboutTitle')}</h1>
          <div className="text-gray-500 text-center mb-2">
            {t('aboutDescription')}
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <Info className="w-4 h-4 mr-1" /> About Us
          </Badge>
        </div>
        
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-6">
          <div>
            <p className="text-gray-700 mb-4">{t('aboutGameDescription')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-green-800 mb-2">{t('aboutFeatures')}</h3>
            <ul className="text-green-700 space-y-1 list-disc pl-4">
              <li>{t('aboutMultipleModes')}</li>
              <li>{t('aboutPowerUps')}</li>
              <li>{t('aboutBirdSkins')}</li>
              <li>{t('aboutLeaderboards')}</li>
              <li>{t('aboutPiIntegration')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">{t('aboutTeam')}</h3>
            <p className="text-blue-700">{t('aboutTeamDescription')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">{t('aboutTechnology')}</h3>
            <ul className="text-purple-700 space-y-1 list-disc pl-4">
              <li>{t('aboutReact')}</li>
              <li>{t('aboutPiNetwork')}</li>
              <li>{t('aboutResponsive')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">{t('aboutLicenses')}</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">📋 MIT License</h4>
                <p className="text-yellow-700">{t('aboutMITLicense')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">📋 PiOS License</h4>
                <p className="text-yellow-700">{t('aboutPiOSLicense')}</p>
                <a href="/PiOS%20License" className="text-yellow-700 underline font-semibold text-sm" target="_blank" rel="noopener noreferrer">{t('aboutViewPiOSLicense')}</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-8 pb-4 flex gap-2">
          <Button onClick={() => navigate(ROUTES.HOME)} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate(ROUTES.CONTACT)} variant="outline" className="flex-1">
            Contact Us
          </Button>
        </div>
        <div className="text-center text-xs text-gray-400 pb-1">Powered by Pi Network</div>
        <div className="text-center text-xs text-gray-500 pb-4">Flappy Pi is a Project of <b>Mrwain Organization</b></div>
      </div>
    </div>
  );
};

export default AboutPage; 