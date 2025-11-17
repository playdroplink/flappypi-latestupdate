import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Menu, Home, Play, ShoppingCart, Trophy, Settings, HelpCircle, Mail, Shield, FileText, Crown, Info, Shirt, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export interface NavigationMenuRef {
  openMenu: () => void;
}

// Define the props for NavigationMenu
interface NavigationMenuProps {
  onNavigate: (path: string) => void;
  piUser: any; // Assuming piUser has a type, if not, consider defining one
  onLogout: () => void;
}

const NavigationMenu = forwardRef<NavigationMenuRef, NavigationMenuProps>(({ onNavigate, piUser, onLogout }, ref) => {
  const { playSwoosh } = useSoundEffects();
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    openMenu: () => {
      console.log("Navigation Menu: openMenu triggered");
      setIsOpen(true);
    }
  }));

  const handleNavigationInternal = (path: string) => { 
    playSwoosh();
    setIsOpen(false);
    onNavigate(path); // Use the passed onNavigate prop
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Play, label: 'Play Game', path: '/play' },
    { icon: ShoppingCart, label: 'Shop', path: '/shop' },
    { icon: Shirt, label: 'Flappy Pi Merch', path: '/merch' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: History, label: 'Game History', path: '/game-history' },
    { icon: FileText, label: 'Blog & Announcements', path: '/flappy-pi-blog' },
    { icon: Crown, label: t('socialChallenge'), path: '/social-challenge' },
    { icon: Crown, label: t('flappyPiCommunity'), path: '/community' },
    { icon: Shield, label: 'Partnerships', path: '/partnership' },
    { icon: FileText, label: 'Whitepaper', path: '/whitepaper' },
    { icon: FileText, label: 'Flappy Wiki', path: '/flappy-wiki' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Crown, label: 'Subscription Plans', path: '/subscription-plans' },
    { icon: Shield, label: 'Status', path: '/status' },
  ];

  const supportItems = [
    { icon: HelpCircle, label: 'Help & Tutorial', path: '/help' },
    { icon: Mail, label: 'Contact Us', path: '/contact' },
    { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
    { icon: FileText, label: 'Terms of Service', path: '/terms' },
    { icon: Info, label: 'About', path: '/about' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-80 bg-gradient-to-b from-blue-700 to-blue-900 border-0 z-50">
        <SheetHeader className="pb-6 border-b border-blue-600">
          <SheetTitle className="text-white text-2xl font-bold flex items-center gap-3">
            <img 
              src="/lovable-uploads/616a87a7-bd9c-414f-a05b-09c6f7a38ef9.png" 
              alt="Flappy Pi" 
              className="w-8 h-8"
            />
            Flappy Pi
          </SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu for Flappy Pi application</SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-full pb-20">
          <div className="space-y-6 pt-4">
            {/* Main Navigation */}
            <div>
              <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3 px-4">
                Main Menu
              </h3>
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => handleNavigationInternal(item.path)}
                      variant="ghost"
                      className="w-full justify-start h-10 text-white hover:bg-blue-600 rounded-none text-base font-medium px-4"
                    >
                      <IconComponent className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-blue-600 my-4" />

            {/* Support & Legal */}
            <div>
              <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3 px-4">
                Support & Legal
              </h3>
              <div className="space-y-1">
                {supportItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => handleNavigationInternal(item.path)}
                      variant="ghost"
                      className="w-full justify-start h-10 text-white hover:bg-blue-600 rounded-none text-base font-medium px-4"
                    >
                      <IconComponent className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-blue-600 my-4" />

            {/* Quick Actions */}
            <div>
              <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3 px-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleNavigationInternal('/play')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl h-12 font-bold px-4"
                >
                  🎮 Start Playing
                </Button>
                <Button
                  onClick={() => handleNavigationInternal('/shop')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl h-12 font-bold px-4"
                >
                  💰 Visit Shop
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu;
