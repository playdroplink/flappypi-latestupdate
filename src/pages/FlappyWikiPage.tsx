import React, { useState, useEffect } from 'react';
import { shopItems } from '@/constants/shopItems';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Grid, Lock, HelpCircle, Info, X, Star, Crown, Zap, Heart, Coins, Users, Award, BookOpen, Search, Filter, List as ListIcon, ShoppingCart, Package, BookOpenText, Home, FileText, Star as StarIcon, Music, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WhitepaperModal from '@/components/WhitepaperModal';

import EnhancedFooter from '@/components/EnhancedFooter';
import FooterNPC from '../components/FooterNPC';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { wikiTranslations } from '../translations/wiki_translations';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

// SVG fallback for eggs
const EggSVG = ({ color = '#fffacd', border = '#e2c290', size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="60" rx="32" ry="38" fill={color} stroke={border} strokeWidth="6" />
  </svg>
);

// Add DoorSVG for locked skins in grid view
const DoorSVG = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="40" height="55" rx="6" fill="#ffe066" stroke="#e2c290" strokeWidth="5" />
    <rect x="18" y="40" width="8" height="15" rx="2" fill="#e2c290" />
    <circle cx="44" cy="55" r="3" fill="#e2c290" />
  </svg>
);

// Add QuestionMarkSVG for special skins
const QuestionMarkSVG = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" fill="#fef9c3" stroke="#e2c290" strokeWidth="6" />
    <text x="50%" y="54%" textAnchor="middle" fill="#e2c290" fontSize={size * 0.7} fontWeight="bold" dy=".3em">?</text>
  </svg>
);

// Function to get translated character stories
const getTranslatedStory = (characterName: string, selectedLanguage: string) => {
  const storyKeyMap: Record<string, string> = {
    'Sky Blue Flappy': 'story_skyBlueFlappy',
    'Red Flappy': 'story_redFlappy',
    'Green Flappy': 'story_greenFlappy',
    'Purple Flappy': 'story_purpleFlappy',
    'Elite Parrot': 'story_eliteParrot',
    'Elite Eagle': 'story_eliteEagle',
    'Golden Phoenix': 'story_goldenPhoenix',
    'Black Flappy': 'story_blackFlappy',
    'Pink Flappy': 'story_pinkFlappy',
    'Orange Flappy': 'story_orangeFlappy',
    'Golden Flappy': 'story_goldenFlappy',
    'Golden Dragon': 'story_goldenDragon',
    '🔥 Fire Phoenix': 'story_infernoPhoenix',
  };

  const storyKey = storyKeyMap[characterName];
  if (storyKey) {
    return wikiTranslations[selectedLanguage]?.[storyKey] || wikiTranslations['en'][storyKey] || 'A new story is being written...';
  }
  return 'A new story is being written...';
};

// Enhanced rarity information
const rarityInfo = {
  'Common': {
    color: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900',
    description: 'Basic characters available to all players',
    dropRate: 'Common',
    value: 'Low'
  },
  'Rare': {
    color: 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900',
    description: 'Uncommon characters with special abilities',
    dropRate: 'Uncommon',
    value: 'Medium'
  },
  'Epic': {
    color: 'bg-gradient-to-r from-purple-400 to-purple-600 text-purple-900',
    description: 'Powerful characters with enhanced abilities',
    dropRate: 'Rare',
    value: 'High'
  },
  'Special': {
    color: 'bg-gradient-to-r from-pink-400 to-pink-600 text-pink-900',
    description: 'Unique characters with exclusive features',
    dropRate: 'Very Rare',
    value: 'Very High'
  },
  'Legendary': {
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900',
    description: 'Ultimate characters with legendary powers',
    dropRate: 'Extremely Rare',
    value: 'Maximum'
  }
};

const getRarityColor = (rarity: string) => {
  return rarityInfo[rarity as keyof typeof rarityInfo]?.color || 'bg-gray-300 text-gray-700';
};

const FlappyWikiPage: React.FC<{ musicEnabled: boolean, setMusicEnabled: (enabled: boolean) => void, soundEnabled: boolean, setSoundEnabled: (enabled: boolean) => void }> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'storybook' | 'grid' | 'list'>('storybook');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showMusicDebug, setShowMusicDebug] = useState(false);
  const [isNightMode, setIsNightMode] = useState(() => {
    const saved = localStorage.getItem('wiki-night-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'ar', label: 'العربية' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'th', label: 'ไทย' },
    { code: 'pl', label: 'Polski' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'el', label: 'Ελληνικά' },
    { code: 'uk', label: 'Українська' },
  ];
  
  const characterList = shopItems.filter(item => (item.image && (item.image.startsWith('/birds/') || item.image.startsWith('/birds2/') || item.image.startsWith('/flappy pi gif/'))) || item.locked);
  const total = characterList.length;
  const character = total > 0 && page >= 0 ? characterList[page] : null;
  
  const handleBack = () => navigate(-1);
  const handleNext = () => setPage((p) => (p + 1) % total);
  const handlePrev = () => setPage((p) => (p - 1 + total) % total);
  const handleGrid = () => setViewMode('grid');
  const handleList = () => setViewMode('list');
  const handleStorybook = () => setViewMode('storybook');
  
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [rarityModalOpen, setRarityModalOpen] = useState(false);
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [supplyModalOpen, setSupplyModalOpen] = useState(false);

  // Filter characters based on search and rarity
  const filteredCharacters = characterList.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || char.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  // Storybook background style
  const storyBg: React.CSSProperties = {
    background: 'repeating-linear-gradient(135deg, #fdf6e3 0 40px, #f5e9d7 40px 80px)',
    border: '8px solid #e2c290',
    borderRadius: 32,
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    padding: '32px 24px',
    maxWidth: 420,
    margin: '0 auto',
    minHeight: 520,
    position: 'relative',
    fontFamily: 'serif',
  };
  const storyFont = { fontFamily: '"Dancing Script", cursive, serif', fontSize: 22, color: '#7c5e2a', lineHeight: 1.7, fontWeight: 'bold', textShadow: '0 1px 2px #fff8' };

  const { settings } = useSettings();
  const theme = isNightMode ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const { isPlaying, currentTrack } = useGlobalMusic(true);

  const t = (key: string) => wikiTranslations[selectedLanguage]?.[key] || wikiTranslations['en'][key] || key;

  // Handle night mode toggle
  const toggleNightMode = () => {
    const newMode = !isNightMode;
    setIsNightMode(newMode);
    localStorage.setItem('wiki-night-mode', JSON.stringify(newMode));
  };

  // Ensure music is properly initialized for this page
  useEffect(() => {
    // Force user gesture detection for music
    const handleUserInteraction = () => {
      if (typeof window !== 'undefined') {
        window.__musicUserGesture = true;
        console.log('[WIKI DEBUG] User gesture detected for music');
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    // Dispatch a custom event to trigger music for this route
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('route-changed', { 
        detail: { pathname: '/flappy-wiki' } 
      }));
    }, 100);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <ScrollArea className="flex-1 flex flex-col items-center justify-center p-4 w-full">
        <div className="max-w-2xl flex flex-col items-center justify-center relative mx-auto" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          <Button variant="ghost" size="icon" onClick={handleBack} className="absolute top-4 left-4 text-yellow-700 hover:bg-yellow-100 rounded-full p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          {/* Theme Toggle Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleNightMode} 
            className={`absolute top-4 right-16 rounded-full p-2 transition-all duration-300 ${
              isNightMode 
                ? 'text-yellow-300 hover:bg-yellow-900/20 hover:text-yellow-200' 
                : 'text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            {isNightMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>

          {/* Music Debug Button (only in development) */}
          {(typeof window !== 'undefined' && window.location.hostname === 'localhost') && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowMusicDebug(!showMusicDebug)} 
              className="absolute top-4 right-4 text-yellow-700 hover:bg-yellow-100 rounded-full p-2"
            >
              <Music className="h-6 w-6" />
            </Button>
          )}

          {/* Music Debug Panel */}
          {showMusicDebug && (
            <div className="absolute top-16 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Music Debug</h3>
                <button onClick={() => setShowMusicDebug(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Music Enabled:</strong> {musicEnabled ? 'Yes' : 'No'}</div>
                <div><strong>Sound Enabled:</strong> {soundEnabled ? 'Yes' : 'No'}</div>
                <div><strong>User Gesture:</strong> {typeof window !== 'undefined' && window.__musicUserGesture ? 'Yes' : 'No'}</div>
                <div><strong>Current Route:</strong> /flappy-wiki</div>
                <div><strong>Expected Track:</strong> wiki (Flappy Pi Shop Theme Song)</div>
                <div><strong>Music System Route:</strong> {window.location.pathname}</div>
              </div>
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.__musicUserGesture = true;
                      window.dispatchEvent(new CustomEvent('route-changed', { 
                        detail: { pathname: '/flappy-wiki' } 
                      }));
                    }
                  }}
                  className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm"
                >
                  Force Music Start
                </Button>
                <Button 
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm"
                >
                  Toggle Music ({musicEnabled ? 'Disable' : 'Enable'})
                </Button>
                <Button 
                  onClick={() => {
                    // Test if music files are accessible - use global music system
                    console.log('[WIKI DEBUG] Music test disabled - use global music system instead');
                  }}
                  className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm"
                >
                  Test Music File (Disabled)
                </Button>
              </div>
            </div>
          )}

          {/* Header */}
          <img 
            src="/flappy pi gif/flappy-2.gif.gif" 
            alt="Flappy Pi Logo" 
            className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" 
            loading="lazy"
            onError={(e) => {
              console.warn('❌ Flappy Pi GIF failed to load in FlappyWikiPage, using fallback');
              e.currentTarget.src = '/flappy-logo.png';
            }}
          />
          <h1 className={`text-4xl font-bold mb-2 text-center w-full transition-colors duration-300 ${
            isNightMode ? 'text-yellow-200' : 'text-yellow-800'
          }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.025em' }}>Flappy Pi Wiki</h1>
          <p className={`text-lg mb-8 text-center max-w-2xl w-full transition-colors duration-300 ${
            isNightMode ? 'text-yellow-100/90' : 'text-yellow-900'
          }`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', lineHeight: '1.6' }}>Discover the complete encyclopedia of Flappy Pi characters. Each has a unique story, rarity, and destiny!</p>

          {/* Search and Filter Controls */}
          <div className="w-full max-w-md mb-6 flex flex-col gap-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isNightMode ? 'text-yellow-200' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                  isNightMode 
                    ? 'bg-yellow-900/30 border-yellow-600 text-yellow-100 placeholder-yellow-300/60' 
                    : 'border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: '16px' }}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className={`px-4 py-2 rounded-lg border text-base font-semibold shadow focus:ring-2 focus:ring-yellow-400 transition-colors duration-300 ${
                  isNightMode 
                    ? 'bg-yellow-900/30 border-yellow-600 text-yellow-100' 
                    : 'border-gray-300 text-gray-800 bg-white'
                }`}
                style={{ minWidth: 180, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleStorybook}
              variant={viewMode === 'storybook' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" />
              {t('storybook')}
            </Button>
            <Button
              onClick={handleGrid}
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1"
            >
              <Grid className="w-4 h-4" />
              {t('grid')}
            </Button>
            <Button
              onClick={handleList}
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1"
            >
              <ListIcon className="w-4 h-4" />
              {t('list')}
            </Button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'storybook' && (
            <>
              {page >= 0 ? (
                total > 0 && character ? (
                  <div style={storyBg} className="mb-8 mx-auto animate-fade-in flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center w-full">
                      {/* Character image or fallback */}
                      {(character && (character.name === 'Shadow Phoenix' || character.name === 'Mystery Flappy')) ? (
                        <QuestionMarkSVG size={120} />
                      ) : character.locked && (!character.image || character.image === '') ? (
                        <Lock className="w-[120px] h-[120px] text-yellow-600 drop-shadow mb-4" />
                      ) : (
                        <img src={character.image || '/birds/locked_skin_1.png'} alt={character.name} className="w-40 h-40 object-contain mb-4 rounded-2xl border-4 border-yellow-200 shadow-lg bg-white relative" />
                      )}
                      <h2 className={`text-3xl font-bold mb-2 text-center drop-shadow ${theme === 'night' ? 'text-white' : 'text-yellow-900'}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.025em' }}>{character.name}</h2>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full mb-2 ${getRarityColor(character.rarity)}`}>Rarity: {character.rarity}</div>
                      {character.isLimited && (
                        <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold mb-2">Limited: {character.supply?.toLocaleString()}</div>
                      )}
                      <div className="flex gap-2 mb-3 text-xs">
                        {character.piPrice > 0 && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">{character.piPrice} Pi</span>}
                        {character.flappyCoinPrice > 0 && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{character.flappyCoinPrice.toLocaleString()} Coins</span>}
                        {character.piPrice === 0 && character.flappyCoinPrice === 0 && !character.locked && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">FREE</span>}
                      </div>
                      <div className={`text-center mt-2 mb-4`} style={{...storyFont, color: theme === 'night' ? '#fff' : '#7c5e2a', textShadow: theme === 'night' ? '0 1px 2px #0008' : '0 1px 2px #fff8', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', lineHeight: '1.6' }}>
                        {/* Show description if present */}
                        {character.description && (
                          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, whiteSpace: 'pre-line', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{character.description}</div>
                        )}
                        {/* Show story if present */}
                        <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', lineHeight: '1.6' }}>
                          {getTranslatedStory(character.name, selectedLanguage)}
                        </div>
                        {character.supply ? (
                          <span className={`block mt-2 text-sm font-semibold ${theme === 'night' ? 'text-white/80' : 'text-yellow-800'}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Supply: {character.supply.toLocaleString()}</span>
                        ) : null}
                      </div>
                      {/* Responsive button group: stack on mobile, row on desktop */}
                      <div className="flex flex-row flex-wrap justify-center items-center gap-4 mt-6 mb-8 w-full max-w-xl">
                        <Button
                          onClick={handlePrev}
                          variant="solid"
                          className="px-8 py-3 rounded-xl font-semibold text-lg min-h-[48px]"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', border: '2px solid #e2c290', boxShadow: '0 2px 8px #e2c29088' }}
                        >
                          <ArrowLeft className="w-6 h-6 mr-1" /> {t('previous')}
                        </Button>
                        <Button
                          onClick={handleGrid}
                          variant="solid"
                          className="px-8 py-3 rounded-xl font-semibold text-lg min-h-[48px]"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', border: '2px solid #e2c290', boxShadow: '0 2px 8px #e2c29088' }}
                        >
                          <Grid className="w-6 h-6 mr-1" /> {t('viewAll')}
                        </Button>
                        <Button
                          onClick={handleNext}
                          variant="solid"
                          className="px-8 py-3 rounded-xl font-semibold text-lg min-h-[48px]"
                          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', border: '2px solid #e2c290', boxShadow: '0 2px 8px #e2c29088' }}
                        >
                          {t('next')} <ArrowRight className="w-6 h-6 ml-1" />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 right-8 text-xs text-yellow-700 opacity-60" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t('page')} {page + 1} / {total}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-yellow-900 font-bold text-xl mt-12">{t('noCharacters')}</div>
                )
              ) : null}
            </>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 animate-fade-in w-full">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char, index) => (
                  <div
                    key={char.id}
                    onClick={() => { setPage(index); setViewMode('storybook'); }}
                    className={`relative cursor-pointer group transition-all duration-300 transform hover:scale-105 ${
                      theme === 'night' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    } rounded-xl p-4 shadow-lg border-2 border-transparent hover:border-yellow-300`}
                  >
                    {/* Character image */}
                    <div className="flex justify-center mb-3">
                      {char.locked && (!char.image || char.image === '') ? (
                        <Lock className="w-16 h-16 text-yellow-600" />
                      ) : (
                        <img
                          src={char.image || '/birds/locked_skin_1.png'}
                          alt={char.name}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                      )}
                    </div>
                    
                    {/* Character info */}
                    <h3 className="font-bold text-sm text-center mb-2">{char.name}</h3>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full mb-2 text-center ${getRarityColor(char.rarity)}`}>
                      {char.rarity}
                    </div>
                    
                    {/* Price info */}
                    <div className="text-xs text-center">
                      {char.piPrice > 0 && <span className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded mr-1">{char.piPrice} Pi</span>}
                      {char.flappyCoinPrice > 0 && <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded mr-1">{char.flappyCoinPrice.toLocaleString()}</span>}
                      {char.piPrice === 0 && char.flappyCoinPrice === 0 && !char.locked && <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded">FREE</span>}
                    </div>
                    
                    {/* Limited badge */}
                    {char.isLimited && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                        {char.supply?.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  {t('noMatch')}
                </div>
              )}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="w-full space-y-4 mb-8">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char, index) => (
                  <div
                    key={char.id}
                    onClick={() => { setPage(index); setViewMode('storybook'); }}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-yellow-50 ${
                      theme === 'night' ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900'
                    } shadow-md`}
                  >
                    {/* Character image */}
                    <div className="flex-shrink-0 mr-4">
                      {char.locked && (!char.image || char.image === '') ? (
                        <Lock className="w-12 h-12 text-yellow-600" />
                      ) : (
                        <img
                          src={char.image || '/birds/locked_skin_1.png'}
                          alt={char.name}
                          className="w-12 h-12 object-contain rounded-lg"
                        />
                      )}
                    </div>
                    
                    {/* Character info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{char.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRarityColor(char.rarity)}`}>
                          {char.rarity}
                        </span>
                        {char.isLimited && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                            Limited: {char.supply?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Price info */}
                    <div className="flex flex-col items-end">
                      {char.piPrice > 0 && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">{char.piPrice} Pi</span>}
                      {char.flappyCoinPrice > 0 && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">{char.flappyCoinPrice.toLocaleString()} Coins</span>}
                      {char.piPrice === 0 && char.flappyCoinPrice === 0 && !char.locked && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">FREE</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {t('noMatch')}
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className={`w-full max-w-md p-4 rounded-lg ${theme === 'night' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg mb-8`}>
            <h3 className="font-bold text-lg mb-3 text-center" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t('statistics')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{total}</div>
                <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t('totalCharacters')}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-purple-600" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{characterList.filter(c => c.rarity === 'Legendary').length}</div>
                <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t('legendary')}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-green-600" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{characterList.filter(c => c.isLimited).length}</div>
                <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t('limitedEdition')}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-yellow-600" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{characterList.filter(c => c.piPrice === 0 && c.flappyCoinPrice === 0).length}</div>
                <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{t('freeCharacters')}</div>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="w-full flex justify-center mb-4">
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-base font-semibold bg-white text-gray-800 shadow focus:ring-2 focus:ring-yellow-400"
              style={{ minWidth: 180, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* Modal Buttons Row - Original Design */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant="solid"
              className={`px-8 py-3 min-w-[160px] rounded-xl font-bold text-lg min-h-[48px] shadow-lg border-2 transition-all duration-300 ${
                isNightMode 
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-800 to-yellow-700 text-yellow-100 hover:from-yellow-700 hover:to-yellow-600' 
                  : 'border-yellow-400 bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-900 hover:from-yellow-300 hover:to-yellow-200'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxShadow: '0 2px 8px #e2c29088' }}
              onClick={() => setMarketModalOpen(true)}
            >
              {t('flappyMarketplace')}
            </Button>
            <Button
              variant="solid"
              className={`px-8 py-3 min-w-[160px] rounded-xl font-bold text-lg min-h-[48px] shadow-lg border-2 transition-all duration-300 ${
                isNightMode 
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-800/80 to-yellow-700/80 text-yellow-100 hover:from-yellow-700/90 hover:to-yellow-600/90' 
                  : 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-200 text-yellow-900 hover:from-yellow-100 hover:to-yellow-300'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxShadow: '0 2px 8px #e2c29088' }}
              onClick={() => setSupplyModalOpen(true)}
            >
              {t('flappySupply')}
            </Button>
            <Button
              variant="solid"
              className={`px-8 py-3 min-w-[160px] rounded-xl font-bold text-lg min-h-[48px] shadow-lg border-2 transition-all duration-300 ${
                isNightMode 
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-700/80 to-yellow-600/80 text-yellow-100 hover:from-yellow-600/90 hover:to-yellow-500/90' 
                  : 'border-yellow-400 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-900 hover:from-yellow-200 hover:to-yellow-100'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxShadow: '0 2px 8px #e2c29088' }}
              onClick={() => setStoryModalOpen(true)}
            >
              {t('storyBehind')}
            </Button>
            <Button
              variant="solid"
              className={`px-8 py-3 min-w-[160px] rounded-xl font-bold text-lg min-h-[48px] shadow-lg border-2 transition-all duration-300 ${
                isNightMode 
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-800/80 to-yellow-700/80 text-yellow-100 hover:from-yellow-700/90 hover:to-yellow-600/90' 
                  : 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-200 text-yellow-900 hover:from-yellow-100 hover:to-yellow-300'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxShadow: '0 2px 8px #e2c29088' }}
              onClick={() => navigate('/home')}
            >
              {t('home')}
            </Button>
            <Button
              variant="solid"
              onClick={() => setWhitepaperOpen(true)}
              className={`px-6 py-3 min-w-[160px] rounded-xl font-bold text-lg min-h-[48px] border-2 shadow-lg transition-all duration-300 ${
                isNightMode 
                  ? 'border-yellow-500 text-yellow-100 bg-yellow-900/50 hover:bg-yellow-800/70' 
                  : 'border-yellow-400 text-yellow-900 bg-white hover:bg-yellow-100'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxShadow: '0 2px 8px #e2c29088' }}
            >
              {t('whitepaper')}
            </Button>
            <Button
              variant="solid"
              className={`px-8 py-3 min-w-[160px] rounded-xl font-bold text-lg min-h-[48px] shadow-lg border-2 transition-all duration-300 ${
                isNightMode 
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-800/80 to-yellow-700/80 text-yellow-100 hover:from-yellow-700/90 hover:to-yellow-600/90' 
                  : 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-200 text-yellow-900 hover:from-yellow-100 hover:to-yellow-300'
              }`}
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxShadow: '0 2px 8px #e2c29088' }}
              onClick={() => setRarityModalOpen(true)}
            >
              <Info className="w-5 h-5 mr-2" /> {t('rarityInfo')}
            </Button>
            <Button
              variant="default"
              className="px-8 py-3 min-w-[180px] rounded-xl font-bold text-lg min-h-[48px] shadow-lg border-2 border-purple-400 bg-gradient-to-r from-purple-200 to-purple-100 text-purple-900 hover:from-purple-300 hover:to-purple-200 transition-all duration-200"
              style={{ fontFamily: 'serif', boxShadow: '0 2px 8px #a78bfa88' }}
              onClick={() => navigate('/full-flappy-wiki')}
            >
              {t('fullWiki')}
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Modals */}
      <WhitepaperModal isOpen={whitepaperOpen} onClose={() => setWhitepaperOpen(false)} />
      
      {/* Market Modal */}
      <Dialog open={marketModalOpen} onOpenChange={setMarketModalOpen}>
        <DialogContent className={`max-w-md w-full rounded-2xl shadow-2xl p-0 overflow-hidden transition-colors duration-300 ${
          isNightMode ? 'bg-yellow-900/95 border-yellow-600' : 'bg-white'
        }`}>
          <div className="p-8 text-center relative">
            <h2 className={`text-2xl font-extrabold mb-4 transition-colors duration-300 ${
              isNightMode ? 'text-yellow-200' : 'text-yellow-700'
            }`}>{t('flappyMarketplace')}</h2>
            <p className={`text-lg mb-2 transition-colors duration-300 ${
              isNightMode ? 'text-yellow-100' : 'text-yellow-900'
            }`}>Coming Soon!</p>
            <span className="text-4xl">🚀</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Modal */}
      <Dialog open={storyModalOpen} onOpenChange={setStoryModalOpen}>
        <DialogContent className={`max-w-lg w-full rounded-2xl shadow-2xl p-0 overflow-hidden transition-colors duration-300 ${
          isNightMode ? 'bg-yellow-900/95 border-yellow-600' : 'bg-white'
        }`}>
          <div className="p-8 text-center relative">
            <h2 className={`text-2xl font-extrabold mb-4 transition-colors duration-300 ${
              isNightMode ? 'text-yellow-200' : 'text-yellow-700'
            }`}>{t('storyBehind')}</h2>
            <div className="max-h-96 overflow-y-auto text-left px-2">
              <p className={`text-lg mb-4 font-serif transition-colors duration-300 ${
                isNightMode ? 'text-yellow-100' : 'text-yellow-900'
              }`}>
                In the mystical world of Pi, where innovation and community spirit soar, a little blue bird named Flappy was born. Flappy Pi is more than just a game character—it's a symbol of hope, resilience, and the boundless potential of the Pi Network community.<br/><br/>
                Legend has it that Flappy was the first bird to discover the magical Pi coins hidden among the clouds. With every flap, Flappy not only collects coins but also spreads the message of decentralization, freedom, and fun. The journey of Flappy Pi is filled with challenges—pipes, storms, and rivals—but with each fall, Flappy rises again, stronger and wiser.<br/><br/>
                The Flappy Pi universe grew as more birds joined the adventure, each with their own story, rarity, and dreams. Together, they represent the diversity and unity of the Pi community. The game's lore is ever-evolving, shaped by the players who believe in a future where everyone can fly.<br/><br/>
                So, every time you play, remember: Flappy Pi is not just about high scores—it's about the journey, the friends you make, and the dreams you chase. Keep flapping, pioneer!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supply Modal */}
      <Dialog open={supplyModalOpen} onOpenChange={setSupplyModalOpen}>
        <DialogContent className={`max-w-lg w-full rounded-2xl shadow-2xl p-0 overflow-hidden transition-colors duration-300 ${
          isNightMode ? 'bg-yellow-900/95 border-yellow-600' : 'bg-white'
        }`}>
          <div className="p-8 text-center relative">
            <h2 className={`text-2xl font-extrabold mb-4 transition-colors duration-300 ${
              isNightMode ? 'text-yellow-200' : 'text-yellow-700'
            }`}>{t('flappySupply')}</h2>
            <div className="max-h-96 overflow-y-auto text-left px-2">
              <p className={`text-lg mb-4 font-serif transition-colors duration-300 ${
                isNightMode ? 'text-yellow-100' : 'text-yellow-900'
              }`}>
                <b>What is Flappy Supply?</b><br/><br/>
                Each Flappy Pi character has a unique supply, representing how many of that character can ever exist in the game. Some are <b>unlimited</b> (common birds), while others are <b>limited edition</b>—once they're gone, they're gone forever!<br/><br/>
                <b>Legendary</b> and <b>Epic</b> birds are the rarest, with very low supply. For example, the Golden Dragon may have only 5,000 ever minted!<br/><br/>
                <b>Why does supply matter?</b><br/>
                - <b>Collectors</b> value low-supply birds for their rarity and future potential.
                - <b>Limited supply</b> birds may unlock special rewards, perks, or trading value in the future.
                - <b>Event</b> and <b>seasonal</b> birds often have a one-time supply—don't miss them!
                <br/><br/>
                <b>Check each character's story card for their supply and rarity. Legendary birds are the ultimate prize for true Flappy Pi collectors!</b>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rarity Modal */}
      <Dialog open={rarityModalOpen} onOpenChange={setRarityModalOpen}>
        <DialogContent className={`max-w-md w-full rounded-2xl shadow-2xl p-0 overflow-hidden transition-colors duration-300 ${
          isNightMode ? 'bg-yellow-900/95 border-yellow-600' : 'bg-white'
        }`}>
          <div className="p-8 text-center relative">
            <h2 className={`text-2xl font-extrabold mb-4 transition-colors duration-300 ${
              isNightMode ? 'text-yellow-200' : 'text-yellow-700'
            }`}>Rarity & Future Value</h2>
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2"><span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border border-yellow-400 px-3 py-1 rounded-full text-xs font-bold">Legendary</span> <span className={`text-xs transition-colors duration-300 ${
                isNightMode ? 'text-yellow-200' : 'text-yellow-800'
              }`}>Ultra rare, highest value, exclusive rewards</span></div>
              <div className="flex items-center gap-2"><span className="bg-gradient-to-r from-purple-400 to-purple-600 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">Epic</span> <span className={`text-xs transition-colors duration-300 ${
                isNightMode ? 'text-yellow-200' : 'text-purple-800'
              }`}>Very rare, premium perks</span></div>
              <div className="flex items-center gap-2"><span className="bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">Rare</span> <span className={`text-xs transition-colors duration-300 ${
                isNightMode ? 'text-yellow-200' : 'text-blue-800'
              }`}>Rare, special features</span></div>
              <div className="flex items-center gap-2"><span className="bg-gradient-to-r from-pink-400 to-pink-600 text-pink-900 px-3 py-1 rounded-full text-xs font-bold">Special</span> <span className={`text-xs transition-colors duration-300 ${
                isNightMode ? 'text-yellow-200' : 'text-pink-800'
              }`}>Event/seasonal, unique</span></div>
              <div className="flex items-center gap-2"><span className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 border border-gray-400 px-3 py-1 rounded-full text-xs font-bold">Common</span> <span className={`text-xs transition-colors duration-300 ${
                isNightMode ? 'text-yellow-200' : 'text-gray-700'
              }`}>Starter, easy to get</span></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Footer NPC */}
      <div className="w-full flex flex-col items-center mt-8 mb-4">
        <FooterNPC
          npcType="nicolas"
          npcName="Wiki NPC"
          dialogs={[
            "Welcome to the Flappy Wiki! I'm Nicolas, your guide!",
            "I know everything about Flappy Pi!",
            "Ask me about any game feature!",
            "I can explain power-ups and their effects!",
            "Skins change your bird's appearance!",
            "Mystery boxes contain random rewards!",
            "Rarity levels: Common, Rare, Epic, Legendary!",
            "The Wiki is your knowledge base!",
            "I'm here to help you understand the game!",
            "Check out the detailed item descriptions!",
            "Some items have special abilities!",
            "The Wiki is always up to date!",
            "I can explain game mechanics!",
            "Learn about different game modes!",
            "Understand scoring and rewards!",
            "Get tips for better gameplay!",
            "The Wiki helps you make informed decisions!",
            "I'm your friendly game encyclopedia!",
            "Knowledge is power in Flappy Pi!",
            "The Wiki is your best friend!",
            "I can answer any question!",
            "Explore all the game features!",
            "The Wiki is comprehensive and accurate!",
            "I'm always learning new things!",
            "Share the Wiki with friends!",
            "The Wiki makes you a better player!",
            "I'm proud to be your guide!",
            "The Wiki is your game companion!",
            "Let's explore Flappy Pi together!",
            "Happy learning and happy flapping!"
          ]}
        />
      </div>
      
      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </SkyBackground>
  );
};

export default FlappyWikiPage; 