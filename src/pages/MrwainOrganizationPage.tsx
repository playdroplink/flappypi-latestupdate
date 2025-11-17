import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { ArrowLeft, Globe, Users, Award, Zap, Heart, Star, Building2, User, Mail, Phone, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

const MrwainOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isPlaying, currentTrack } = useGlobalMusic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Mrwain Organization</h1>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 overflow-hidden">
                <img 
                  src="/mrwainorganization.png" 
                  alt="Mrwain Organization Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Mrwain Organization
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Pioneering the future of gaming technology and digital innovation. 
                Founded by visionary entrepreneur Mrwain, we're building the next generation 
                of interactive entertainment experiences.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-white">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Global Innovation</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Team Excellence</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>Quality First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About Mrwain Organization
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2024, Mrwain Organization is a cutting-edge technology company 
                  specializing in game development, digital innovation, and interactive entertainment. 
                  Our mission is to create immersive gaming experiences that bring people together 
                  and push the boundaries of what's possible in digital entertainment.
                </p>
                <p>
                  Based in the heart of the tech industry, we combine creativity with technical 
                  excellence to deliver products that millions of users love and trust. Our team 
                  of passionate developers, designers, and innovators work tirelessly to create 
                  the next generation of gaming experiences.
                </p>
                <p>
                  From our flagship Flappy Pi game to innovative voice-controlled experiences 
                  like Scream Pi, we're constantly exploring new technologies and pushing the 
                  limits of interactive entertainment.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-yellow-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Innovation</h4>
                    <p className="text-gray-600 text-sm">Pushing boundaries and exploring new technologies</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="w-6 h-6 text-red-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Passion</h4>
                    <p className="text-gray-600 text-sm">Creating experiences we love and users adore</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="w-6 h-6 text-blue-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Excellence</h4>
                    <p className="text-gray-600 text-sm">Delivering quality in everything we do</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Community</h4>
                    <p className="text-gray-600 text-sm">Building connections through gaming</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Founder
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The visionary behind Mrwain Organization, driving innovation and excellence in gaming technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="w-48 h-48 mx-auto lg:mx-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 overflow-hidden">
                <img 
                  src="/mrwain.png" 
                  alt="Mrwain - Founder & CEO" 
                  className="w-40 h-40 object-cover rounded-full"
                />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Mrwain</h3>
              <p className="text-xl text-blue-600 font-semibold mb-6">Founder & CEO</p>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Mrwain is a visionary entrepreneur and technology innovator with a passion 
                  for creating exceptional gaming experiences. With years of experience in 
                  software development and digital innovation, Mrwain founded the organization 
                  with a clear vision: to revolutionize the gaming industry through cutting-edge 
                  technology and creative excellence.
                </p>
                <p>
                  As the driving force behind Mrwain Organization, Mrwain leads a team of 
                  talented developers and designers in creating immersive gaming experiences 
                  that millions of users enjoy worldwide. From the innovative Flappy Pi game 
                  to the groundbreaking voice-controlled Scream Pi, Mrwain's vision continues 
                  to push the boundaries of what's possible in interactive entertainment.
                </p>
                <p>
                  Under Mrwain's leadership, the organization has grown from a small startup 
                  to a respected name in the gaming industry, known for quality, innovation, 
                  and user-focused design.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Leadership Philosophy</h4>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Innovation First</h5>
                  <p className="text-gray-600 text-sm">Always exploring new technologies and pushing creative boundaries</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h5 className="font-semibold text-gray-900 mb-2">User-Centric Design</h5>
                  <p className="text-gray-600 text-sm">Creating experiences that users love and want to share</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Quality Excellence</h5>
                  <p className="text-gray-600 text-sm">Maintaining the highest standards in every product we create</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Team Collaboration</h5>
                  <p className="text-gray-600 text-sm">Fostering a culture of creativity, respect, and mutual growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Innovative gaming experiences that bring joy to millions of players worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Flappy Pi */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="/flappy-logo.png" 
                  alt="Flappy Pi Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flappy Pi</h3>
              <p className="text-gray-600 mb-4">
                Our flagship game that revolutionized the classic Flappy Bird experience 
                with Pi Network integration and innovative gameplay mechanics.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="w-4 h-4 mr-1" />
                <span>Millions of players worldwide</span>
              </div>
            </div>
            
            {/* Scream Pi */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="/npc gif/npc-5.gif.gif" 
                  alt="Scream Pi NPC Character" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scream Pi</h3>
              <p className="text-gray-600 mb-4">
                The world's first voice-controlled Flappy Pi game, where your screams 
                power your character's jumps in this innovative gaming experience.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Zap className="w-4 h-4 mr-1" />
                <span>Voice-controlled innovation</span>
              </div>
            </div>
            
            {/* Dino Pi */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <img 
                  src="/dino pi/dinopi logo.png" 
                  alt="Dino Pi Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dino Pi</h3>
              <p className="text-gray-600 mb-4">
                The epic Pi-powered dinosaur adventure! Run, evolve, and collect ancient 
                Pi fossils while surviving catastrophic events in this revolutionary game.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Globe className="w-4 h-4 mr-1" />
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interested in our work? Want to collaborate? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">mrwainorganization@gmail.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600"></p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600"></p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Website</h3>
              <p className="text-gray-600">www.mrwain.xyz</p>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Follow Us</h3>
            <div className="flex justify-center space-x-6">
              <a 
                href="https://www.linkedin.com/in/wainfoundation-9a30b9367/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                title="Follow us on LinkedIn"
              >
                <Linkedin className="w-6 h-6 text-white" />
              </a>
              <a 
                href="https://x.com/wainfoundation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                title="Follow us on X (Twitter)"
              >
                <Twitter className="w-6 h-6 text-white" />
              </a>
              <a 
                href="https://github.com/Mrwain-Organization" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
                title="Check out our GitHub"
              >
                <Github className="w-6 h-6 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400">
                © 2025 Mrwain Organization. All rights reserved. 
                Building the future of gaming technology.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/team')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Our Team</span>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/careers')}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Careers</span>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/contact')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MrwainOrganizationPage; 