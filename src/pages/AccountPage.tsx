import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="bg-white/90 shadow-xl p-4 sm:p-8 w-full flex flex-col items-center relative mx-auto max-w-md mt-10 sm:mt-20 rounded-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-2 sm:top-4 left-2 sm:left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 sm:mb-4 text-blue-700 text-center">Account</h1>
        <p className="text-base sm:text-lg mb-4 sm:mb-6 text-blue-800 text-center max-w-2xl">User profile coming soon!</p>
      </div>
    </SkyBackground>
  );
};

export default AccountPage;
