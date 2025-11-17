import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CommunityGuidelinesModal from '@/components/CommunityGuidelinesModal';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const FlappyPiCommunityPage = () => {
  const { settings } = useSettings();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const { isPlaying, currentTrack } = useGlobalMusic(true);
  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        {/* ...existing content... */}
        <Button
          variant="outline"
          className="font-bold mt-4"
          onClick={() => setShowGuidelines(true)}
        >
          Community Guidelines
        </Button>
        <CommunityGuidelinesModal isOpen={showGuidelines} onClose={() => setShowGuidelines(false)} />
      </div>
    </SkyBackground>
  );
};

export default FlappyPiCommunityPage; 