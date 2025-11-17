import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  Star, 
  TrendingUp, 
  Shield, 
  Zap, 
  Gift,
  ExternalLink,
  Sparkles,
  Crown,
  Diamond
} from 'lucide-react';

interface NFTNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NFTNoteModal: React.FC<NFTNoteModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white border-2 border-purple-500">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Diamond className="w-8 h-8 text-yellow-400 mr-2" />
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              🚀 Future NFT Integration
            </DialogTitle>
            <Diamond className="w-8 h-8 text-yellow-400 ml-2" />
          </div>
          <DialogDescription className="text-lg text-blue-200">
            Your Flappy skins will become valuable NFTs in future updates!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Announcement */}
          <Card className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 border-purple-400">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-yellow-300">
                <Sparkles className="w-6 h-6 mr-2" />
                Limited Edition NFT Skins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 leading-relaxed">
                All Flappy skins you purchase today will be converted to <strong className="text-yellow-300">limited edition NFTs</strong> in future updates. 
                These will be <strong className="text-green-300">tradable on the marketplace</strong> and could become valuable collectibles!
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-green-800/50 to-emerald-800/50 border-green-400">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-300 mr-2" />
                  <h3 className="font-semibold text-green-200">Marketplace Trading</h3>
                </div>
                <p className="text-sm text-green-100">
                  Sell your skins on the marketplace based on their rarity and demand
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-400">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-purple-300 mr-2" />
                  <h3 className="font-semibold text-purple-200">Limited Supply</h3>
                </div>
                <p className="text-sm text-purple-100">
                  Each skin has a limited quantity - first buyers get the rarest editions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-800/50 to-cyan-800/50 border-blue-400">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Crown className="w-5 h-5 text-blue-300 mr-2" />
                  <h3 className="font-semibold text-blue-200">Rarity System</h3>
                </div>
                <p className="text-sm text-blue-100">
                  Early purchases and special editions will have higher rarity values
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-800/50 to-orange-800/50 border-yellow-400">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-yellow-300 mr-2" />
                  <h3 className="font-semibold text-yellow-200">Future Value</h3>
                </div>
                <p className="text-sm text-yellow-100">
                  Your skins could become valuable as the game grows in popularity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rarity Badges */}
          <Card className="bg-gradient-to-r from-indigo-800/50 to-purple-800/50 border-indigo-400">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-200">Rarity Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-600 text-white">Common</Badge>
                <Badge className="bg-blue-600 text-white">Uncommon</Badge>
                <Badge className="bg-purple-600 text-white">Rare</Badge>
                <Badge className="bg-orange-600 text-white">Epic</Badge>
                <Badge className="bg-red-600 text-white">Legendary</Badge>
                <Badge className="bg-yellow-600 text-black">Mythic</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-gradient-to-r from-red-800/50 to-pink-800/50 border-red-400">
            <CardHeader>
              <CardTitle className="text-lg text-red-200 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start">
                <Gift className="w-4 h-4 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-100">
                  <strong>Limited Time:</strong> Only skins purchased before NFT launch will be converted
                </p>
              </div>
              <div className="flex items-start">
                <Star className="w-4 h-4 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-100">
                  <strong>No Duplicates:</strong> Each NFT will be unique and cannot be replicated
                </p>
              </div>
              <div className="flex items-start">
                <ExternalLink className="w-4 h-4 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-100">
                  <strong>Marketplace Ready:</strong> Trade with other players worldwide
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-lg text-yellow-200 mb-4">
              <strong>Don't miss out!</strong> Get your limited edition skins now before they become NFTs!
            </p>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg"
            >
              Start Collecting Now! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NFTNoteModal;
