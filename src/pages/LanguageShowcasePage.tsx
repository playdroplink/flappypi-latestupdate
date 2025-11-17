import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { 
  Globe, 
  Users, 
  Star, 
  Award, 
  Languages, 
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Users as UsersIcon,
  Globe as GlobeIcon,
  Heart,
  Share2,
  Play,
  X
} from 'lucide-react';
import { FaTwitter, FaTelegram, FaDiscord, FaFacebook, FaTiktok, FaInstagram, FaYoutube } from 'react-icons/fa';
import Flag from 'react-flagkit';

const LanguageShowcasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState<any>(null);
  const { isPlaying, currentTrack } = useGlobalMusic();

  const regions = [
    { id: 'all', name: 'All Regions', icon: <Globe className="w-4 h-4" /> },
    { id: 'major', name: 'Major Languages', icon: <Star className="w-4 h-4" /> },
    { id: 'asia', name: 'Asia-Pacific', icon: <MapPin className="w-4 h-4" /> },
    { id: 'europe', name: 'Europe', icon: <MapPin className="w-4 h-4" /> },
    { id: 'africa', name: 'Africa', icon: <MapPin className="w-4 h-4" /> },
    { id: 'regional', name: 'Regional', icon: <MapPin className="w-4 h-4" /> },
  ];

  const languages = [
    // Major World Languages
    { code: 'en', name: 'English', nativeName: 'English', region: 'major', speakers: '1.5B+', flag: 'GB', description: 'Global standard language' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'major', speakers: '1.3B+', flag: 'CN', description: 'Most spoken language worldwide' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'major', speakers: '600M+', flag: 'IN', description: 'Official language of India' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'major', speakers: '500M+', flag: 'ES', description: 'Second most spoken language' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'major', speakers: '400M+', flag: 'SA', description: 'Semitic language family' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'major', speakers: '258M+', flag: 'RU', description: 'Slavic language family' },
    { code: 'fr', name: 'French', nativeName: 'Français', region: 'major', speakers: '280M+', flag: 'FR', description: 'Romance language family' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'major', speakers: '95M+', flag: 'DE', description: 'Germanic language family' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'major', speakers: '125M+', flag: 'JP', description: 'Island nation language' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'major', speakers: '77M+', flag: 'KR', description: 'Koreanic language family' },

    // Asian Languages
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'asia', speakers: '270M+', flag: 'ID', description: 'Austronesian language' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'asia', speakers: '69M+', flag: 'TH', description: 'Tai-Kadai language family' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'asia', speakers: '95M+', flag: 'VN', description: 'Austroasiatic language' },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino', region: 'asia', speakers: '100M+', flag: 'PH', description: 'Austronesian language' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'asia', speakers: '230M+', flag: 'BD', description: 'Indo-Aryan language' },
    { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာဘာသာ', region: 'asia', speakers: '38M+', flag: 'MM', description: 'Sino-Tibetan language' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', region: 'asia', speakers: '110M+', flag: 'IR', description: 'Indo-Iranian language' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'asia', speakers: '80M+', flag: 'TR', description: 'Turkic language family' },

    // European Languages
    { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'europe', speakers: '67M+', flag: 'IT', description: 'Romance language family' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'europe', speakers: '40M+', flag: 'PL', description: 'Slavic language family' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', region: 'europe', speakers: '40M+', flag: 'UA', description: 'Slavic language family' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'europe', speakers: '24M+', flag: 'NL', description: 'Germanic language family' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'europe', speakers: '10M+', flag: 'SE', description: 'North Germanic language' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', region: 'europe', speakers: '5M+', flag: 'FI', description: 'Uralic language family' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', region: 'europe', speakers: '5M+', flag: 'NO', description: 'North Germanic language' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'europe', speakers: '10M+', flag: 'CZ', description: 'Slavic language family' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'europe', speakers: '13M+', flag: 'GR', description: 'Hellenic language family' },
    { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', region: 'europe', speakers: '5M+', flag: 'SK', description: 'Slavic language family' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'europe', speakers: '13M+', flag: 'HU', description: 'Uralic language family' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', region: 'europe', speakers: '24M+', flag: 'RO', description: 'Romance language family' },
    { code: 'sr', name: 'Serbian', nativeName: 'Српски', region: 'europe', speakers: '12M+', flag: 'RS', description: 'Slavic language family' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'Български', region: 'europe', speakers: '8M+', flag: 'BG', description: 'Slavic language family' },

    // African Languages
    { code: 'ha', name: 'Hausa', nativeName: 'Hausa', region: 'africa', speakers: '50M+', flag: 'NG', description: 'Chadic language family' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'africa', speakers: '100M+', flag: 'TZ', description: 'Bantu language family' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'africa', speakers: '22M+', flag: 'ET', description: 'Semitic language family' },

    // Regional Languages
    { code: 'ps', name: 'Pashto', nativeName: 'پښتو', region: 'regional', speakers: '50M+', flag: 'AF', description: 'Iranian language family' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'regional', speakers: '16M+', flag: 'NP', description: 'Indo-Aryan language' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: 'regional', speakers: '290M+', flag: 'MY', description: 'Austronesian language' },
  ];

  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lang.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || lang.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleLanguageSelect = (language: any) => {
    setSelectedLanguage(language);
  };

  const handleCloseModal = () => {
    setSelectedLanguage(null);
  };

  const handleShare = async () => {
    const shareText = `🌍 Flappy Pi supports 50 languages worldwide! Check out the complete language showcase and join our global community! #FlappyPi #PiNetwork #GlobalGaming`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Flappy Pi - 50 Languages Global Support',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getRegionStats = () => {
    const stats = {
      total: languages.length,
      major: languages.filter(l => l.region === 'major').length,
      asia: languages.filter(l => l.region === 'asia').length,
      europe: languages.filter(l => l.region === 'europe').length,
      africa: languages.filter(l => l.region === 'africa').length,
      regional: languages.filter(l => l.region === 'regional').length,
    };
    return stats;
  };

  const stats = getRegionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-pink-100 to-yellow-100 animate-gradient-x">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 text-white p-4 sm:p-6 rounded-b-2xl sm:rounded-b-3xl shadow-xl mb-4 sm:mb-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/home')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <Globe className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-2xl" />
                <div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl mb-1 sm:mb-2 animate-gradient-x">
                    Global Language Support
                  </h1>
                  <p className="text-base sm:text-xl text-blue-100 font-semibold mb-0.5 sm:mb-1">50 Languages, One Global Community</p>
                  <p className="text-sm sm:text-lg text-blue-200 italic">Experience Flappy Pi in your language!</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={handleShare}
              >
                <Share2 className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90">Total Languages</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.major}</div>
              <div className="text-sm opacity-90">Major Languages</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.asia}</div>
              <div className="text-sm opacity-90">Asia-Pacific</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.europe}</div>
              <div className="text-sm opacity-90">Europe</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.africa}</div>
              <div className="text-sm opacity-90">Africa</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.regional}</div>
              <div className="text-sm opacity-90">Regional</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {regions.map((region) => (
              <Button
                key={region.id}
                variant={selectedRegion === region.id ? "default" : "outline"}
                onClick={() => setSelectedRegion(region.id)}
                className="whitespace-nowrap"
              >
                {region.icon}
                <span className="ml-2">{region.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {filteredLanguages.map((language) => (
            <Card 
              key={language.code} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => handleLanguageSelect(language)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-gray-200 shadow-md text-4xl">
                    {language.flag && <Flag country={language.flag} />}
                  </div>
                  <Badge className={`${
                    language.region === 'major' ? 'bg-purple-500' :
                    language.region === 'asia' ? 'bg-green-500' :
                    language.region === 'europe' ? 'bg-red-500' :
                    language.region === 'africa' ? 'bg-yellow-500' :
                    'bg-indigo-500'
                  } text-white`}>
                    {language.region.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-gray-800">{language.name}</CardTitle>
                <p className="text-sm text-gray-700 font-medium">{language.nativeName}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4" />
                    <span className="text-gray-800">{language.speakers} speakers</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{language.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardContent className="p-4 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Join the Global Flappy Pi Community!</h2>
            <p className="text-lg sm:text-xl mb-4 sm:mb-6 opacity-90">
              Experience gaming without language barriers. Choose your language and start playing today!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white font-extrabold text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 hover:from-yellow-500 hover:to-purple-600 transition-transform duration-200"
                onClick={() => navigate('/home')}
              >
                <Play className="mr-2" />
                Play Now
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-blue-900 hover:bg-white/20"
                onClick={() => navigate('/blog')}
              >
                <GlobeIcon className="mr-2" />
                Read Blog
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-base sm:text-lg">Connect with Flappy Pi Global Community</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaTwitter className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaTelegram className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaDiscord className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaFacebook className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaTiktok className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaInstagram className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12">
                <FaYoutube className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Detail Modal */}
      {selectedLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-4xl sm:text-6xl">{selectedLanguage.flag && <Flag country={selectedLanguage.flag} />}</div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold">{selectedLanguage.name}</h2>
                    <p className="text-base sm:text-xl text-gray-600">{selectedLanguage.nativeName}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 text-sm sm:text-base">Speakers</h3>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{selectedLanguage.speakers}</p>
                  </div>
                  <div className="bg-green-50 p-2 sm:p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 text-sm sm:text-base">Region</h3>
                    <p className="text-lg sm:text-2xl font-bold text-green-600 capitalize">{selectedLanguage.region}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Description</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{selectedLanguage.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Language Family</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{selectedLanguage.description.split('language')[0].trim()} language family</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Globe className="mr-2" />
                    Set as Language
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageShowcasePage; 