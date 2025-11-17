import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '../context/WalletContext';
import { usePiAuth } from '../context/PiAuthContext';
import { Coins, Gift, Zap, Crown } from 'lucide-react';
import NewPiPaymentModal from '@/components/NewPiPaymentModal';
import WalletBalance from '@/components/WalletBalance';

// Shop items data
const shopItems = [
  {
    id: 'red-flappy',
    name: 'Red Flappy',
    description: 'A fiery red bird with passionate energy',
    price: 3.00,
    image: '/red-flappy.png',
    type: 'character',
    rarity: 'Common'
  },
  {
    id: 'blue-flappy',
    name: 'Blue Flappy',
    description: 'A cool blue bird with calm energy',
    price: 3.00,
    image: '/blue-flappy.png',
    type: 'character',
    rarity: 'Common'
  },
  {
    id: 'golden-flappy',
    name: 'Golden Flappy',
    description: 'A rare golden bird with special powers',
    price: 10.00,
    image: '/golden-flappy.png',
    type: 'character',
    rarity: 'Rare'
  }
];

const powerUpItems = [
  {
    id: 'shield-power',
    name: 'Shield Power',
    description: 'Protects you from one hit',
    price: 2.00,
    image: '/shield.png',
    type: 'powerup'
  },
  {
    id: 'magnet-power',
    name: 'Magnet Power',
    description: 'Attracts nearby coins',
    price: 2.50,
    image: '/magnet.png',
    type: 'powerup'
  },
  {
    id: 'speed-power',
    name: 'Speed Power',
    description: 'Increases your speed',
    price: 3.00,
    image: '/speed.png',
    type: 'powerup'
  }
];

const coinPackages = [
  {
    id: 'coin-pack-1',
    name: 'Coin Pack 1',
    description: '100 Flappy Coins',
    price: 1.00,
    image: '/flappycoins.png',
    type: 'coins',
    coinAmount: 100
  },
  {
    id: 'coin-pack-2',
    name: 'Coin Pack 2',
    description: '500 Flappy Coins',
    price: 4.00,
    image: '/flappycoins.png',
    type: 'coins',
    coinAmount: 500
  },
  {
    id: 'coin-pack-3',
    name: 'Coin Pack 3',
    description: '1000 Flappy Coins',
    price: 7.00,
    image: '/flappycoins.png',
    type: 'coins',
    coinAmount: 1000
  }
];

interface PaymentItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  type: string;
  quantity?: number;
}

const NewShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addCoins } = useWallet();
  const { user: piUser, isAuthenticated } = usePiAuth();
  
  const [activeTab, setActiveTab] = useState('characters');
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Handle payment success
  const handlePaymentSuccess = (item: PaymentItem) => {
    console.log('✅ Payment successful for:', item);
    
    // Add coins if it's a coin package
    if (item.type === 'coins') {
      const coinAmount = (item as any).coinAmount || 0;
      if (coinAmount > 0) {
        addCoins(coinAmount);
        toast({
          title: "Coins Added! 🎉",
          description: `You received ${coinAmount} Flappy Coins!`
        });
      }
    } else {
      // Handle other item types (characters, powerups, etc.)
      toast({
        title: "Purchase Successful! 🎉",
        description: `${item.name} has been added to your inventory!`
      });
    }

    // Close modal
    setShowPaymentModal(false);
    setSelectedItem(null);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error);
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  // Handle buy with Pi
  const handleBuyWithPi = (item: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Pi Network to make payments.",
        variant: "destructive"
      });
      return;
    }

    setSelectedItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      type: item.type,
      quantity: 1
    });
    setShowPaymentModal(true);
  };

  // Handle buy with coins
  const handleBuyWithCoins = (item: any) => {
    // This would handle Flappy Coin purchases
    toast({
      title: "Feature Coming Soon",
      description: "Flappy Coin purchases will be available soon!",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
              <p className="text-gray-600">Purchase items with Pi or Flappy Coins</p>
            </div>
            <div className="flex items-center space-x-4">
              <WalletBalance />
              {piUser && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                  <span>Signed in as {piUser.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="powerups">Power-ups</TabsTrigger>
            <TabsTrigger value="coins">Coins</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
          </TabsList>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.rarity === 'Rare' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.rarity}
                      </span>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                        <span className="text-lg font-semibold">{item.price.toFixed(2)} Pi</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleBuyWithPi(item)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!isAuthenticated}
                      >
                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4 mr-2" />
                        Buy with Pi
                      </Button>
                      <Button
                        onClick={() => handleBuyWithCoins(item)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Buy with FC
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Power-ups Tab */}
          <TabsContent value="powerups" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {powerUpItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                        <span className="text-lg font-semibold">{item.price.toFixed(2)} Pi</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleBuyWithPi(item)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!isAuthenticated}
                      >
                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4 mr-2" />
                        Buy with Pi
                      </Button>
                      <Button
                        onClick={() => handleBuyWithCoins(item)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Buy with FC
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Coins Tab */}
          <TabsContent value="coins" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coinPackages.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                        <span className="text-lg font-semibold">{item.price.toFixed(2)} Pi</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleBuyWithPi(item)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!isAuthenticated}
                      >
                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4 mr-2" />
                        Buy with Pi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles" className="space-y-6">
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Bundles Coming Soon</h3>
              <p className="text-gray-500">Special bundles will be available soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <NewPiPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        item={selectedItem}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};

export default NewShopPage;
