import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FooterNPC from '../components/FooterNPC';
import EnhancedFooter from '../components/EnhancedFooter';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useLanguage } from '../context/LanguageContext';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const RESERVE_WALLET_ADDRESS = '';

const ReservePage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Local state for music and sound toggles
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-32 relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-yellow-700 hover:bg-yellow-100 rounded-full p-2 z-20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <img src="/reserve.png" alt={t('reserve')} className="w-24 h-24 mb-4 drop-shadow-xl" />
        <h1 className={`text-3xl font-extrabold mb-2 text-center ${theme === 'night' ? 'text-white' : 'text-yellow-800'}`}>{t('reserveTitle')}</h1>
        
        <div className="max-w-xl w-full bg-white/90 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t('reservePurposeTitle')}</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 font-medium">
            <li>{t('reservePurpose1')}</li>
            <li>{t('reservePurpose2')}</li>
            <li>{t('reservePurpose3')}</li>
            <li>{t('reservePurpose4')}</li>
          </ul>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t('reserveFundingTitle')}</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 font-medium">
            <li>{t('reserveFunding1')}</li>
            <li>{t('reserveFunding2')}</li>
            <li>{t('reserveFunding3')}</li>
            <li>{t('reserveFunding4')}</li>
          </ul>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t('reserveUsageTitle')}</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 font-medium">
            <li>{t('reserveUsage1')}</li>
            <li>{t('reserveUsage2')}</li>
            <li>{t('reserveUsage3')}</li>
            <li>{t('reserveUsage4')}</li>
          </ul>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t('reserveTransparencyTitle')}</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 font-medium">
            <li>{t('reserveTransparency1')}</li>
            <li>{t('reserveTransparency2')}</li>
            <li>{t('reserveTransparency3')}</li>
          </ul>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t('reserveCommunityTitle')}</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 font-medium">
            <li>{t('reserveCommunity1')}</li>
          </ul>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{t('reserveWalletTitle')}</h2>
          <div className="mb-4 text-gray-700 font-medium">
            Pi Reserve Wallet Address:<br />
            <span className={`font-mono px-2 py-1 rounded ${theme === 'night' ? 'text-white bg-white/20' : 'text-yellow-900 bg-yellow-100'}`}>Coming Soon</span><br />
            <span className="text-xs text-gray-600">Wallet address will be displayed here when available</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">✅ Closing Statement</h2>
          <p className="mb-4 text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: t('npcReserveDialog') }}></p>
          
          {/* Important Note Section */}
          <h2 className="text-xl font-bold mb-2 text-gray-900 mt-6">⚠️ {t('reserveNoteTitle')}</h2>
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-gray-700 font-medium">{t('reserveNoteText')}</p>
          </div>
          
          <div className={`text-center text-lg font-bold mt-6 ${theme === 'night' ? 'text-white' : 'text-yellow-700'}`}>Coming Soon</div>
          <div className="mt-4 flex flex-col items-center">
            <span className={`text-gray-700 font-semibold ${theme === 'night' ? 'text-white' : 'text-gray-700'}`}>Pi Reserve Wallet Balance:</span>
            <span className={`text-2xl font-mono px-4 py-2 rounded mt-2 ${theme === 'night' ? 'text-white bg-white/20' : 'text-yellow-900 bg-yellow-100'}`}>-- π</span>
          </div>
          

        </div>
        {/* FooterNPC above the footer */}
        <FooterNPC
          npcType="default"
          npcName="Reserve NPC"
          dialogs={[
            t('npcReserveDialog1'),
            t('npcReserveDialog2'),
            t('npcReserveDialog3'),
            t('npcReserveDialog4'),
            t('npcReserveDialog5'),
            t('npcReserveDialog6'),
            t('npcReserveDialog7'),
            t('npcReserveDialog8'),
            t('npcReserveDialog9'),
            t('npcReserveDialog10'),
            t('npcReserveDialog11'),
            t('npcReserveDialog12'),
            t('npcReserveDialog13'),
            t('npcReserveDialog14'),
            t('npcReserveDialog15'),
            t('npcReserveDialog16'),
            t('npcReserveDialog17'),
            t('npcReserveDialog18'),
            t('npcReserveDialog19'),
            t('npcReserveDialog20'),
            t('npcReserveDialog21'),
            t('npcReserveDialog22'),
            t('npcReserveDialog23'),
            t('npcReserveDialog24'),
            t('npcReserveDialog25'),
            t('npcReserveDialog26'),
            t('npcReserveDialog27'),
            t('npcReserveDialog28'),
            t('npcReserveDialog29'),
            t('npcReserveDialog30'),
            t('npcReserveDialog31'),
            t('npcReserveDialog32'),
            t('npcReserveDialog33'),
            t('npcReserveDialog34'),
            t('npcReserveDialog35'),
            t('npcReserveDialog36'),
            t('npcReserveDialog37'),
            t('npcReserveDialog38'),
            t('npcReserveDialog39'),
            t('npcReserveDialog40'),
            t('npcReserveDialog41'),
            t('npcReserveDialog42'),
            t('npcReserveDialog43'),
            t('npcReserveDialog44'),
            t('npcReserveDialog45'),
            t('npcReserveDialog46'),
            t('npcReserveDialog47'),
            t('npcReserveDialog48'),
            t('npcReserveDialog49'),
            t('npcReserveDialog50')
          ]}
        />
      </div>
      {/* Copyright text */}
      <EnhancedFooter 
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </SkyBackground>
  );
};

export default ReservePage; 