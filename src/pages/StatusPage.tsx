import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const vercelStatusUrl = 'https://www.vercel-status.com/';
const githubRepoUrl = 'https://github.com/playdroplink/Flappy-Pi-Latest-';

// Vercel environment variables
const commitTime = import.meta.env.VERCEL_GIT_COMMIT_TIMESTAMP;
const branch = import.meta.env.VERCEL_GIT_COMMIT_REF;
const commit = import.meta.env.VERCEL_GIT_COMMIT_SHA;
const env = import.meta.env.FLAPPY_PI_ENV || branch || 'unknown';

// Status logic
let status = 'Operational';
let statusColorClass = 'bg-green-400 text-green-900';
if (env.toLowerCase().includes('dev')) {
  status = 'Development';
  statusColorClass = 'bg-yellow-400 text-yellow-900';
} else if (env.toLowerCase().includes('maint')) {
  status = 'Updating / Maintenance';
  statusColorClass = 'bg-orange-400 text-orange-900';
} else if (env === 'unknown') {
  status = 'Unknown / Local';
  statusColorClass = 'bg-gray-400 text-gray-900';
}

const commitUrl = commit ? `${githubRepoUrl}/commit/${commit}` : githubRepoUrl;
const formattedTime = commitTime ? new Date(Number(commitTime)).toLocaleString() : 'Unknown';

const footerLinks = [
  { href: '/home', label: 'Home' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
  { href: '/help', label: 'Help' },
  { href: '/status', label: 'Status' },
];

const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-none p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback 
          src="/flappy pi gif/flappy-2.gif.gif" 
          alt="Flappy Pi Logo" 
          className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" 
          lazy={true}
          fallbackSrc="/flappy-logo.png"
        />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Flappy Pi App Status</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Current status and deployment info for the Flappy Pi game platform.</p>

        <div className="bg-white/60 shadow-lg p-8 w-full text-blue-900 text-center">
          <div className={`flex items-center justify-center gap-3 mb-4`}>
            <span className={`w-3 h-3 rounded-none animate-pulse ${statusColorClass.split(' ')[0]}`}></span>
            <span className={`text-xl font-bold ${statusColorClass.split(' ')[1]}`}>{status}</span>
          </div>
          <div className="flex flex-col gap-2 text-blue-800">
            <div><span className="font-semibold">Environment:</span> {env}</div>
            <div><span className="font-semibold">Branch:</span> {branch || 'Unknown'}</div>
            <div><span className="font-semibold">Commit:</span> {commit ? <a href={commitUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">{commit.slice(0, 8)}</a> : 'Unknown'}</div>
            <div><span className="font-semibold">Last Deployment:</span> {formattedTime}</div>
          </div>
          {env === 'unknown' && (
            <div className="mt-4 text-orange-700 text-sm text-center">Note: Running locally or missing Vercel environment variables.</div>
          )}
          <div className="flex gap-4 justify-center mt-8">
            <a href={vercelStatusUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-100 px-4 py-2 rounded-none font-semibold hover:bg-blue-200 transition text-blue-700">Vercel Status</a>
            <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-100 px-4 py-2 rounded-none font-semibold hover:bg-blue-200 transition text-blue-700">GitHub Repo</a>
          </div>
        </div>
      </div>
    </SkyBackground>
  );
};

export default StatusPage; 