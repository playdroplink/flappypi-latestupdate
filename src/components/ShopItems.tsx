// Shop Items Component
// Displays all available shop items with Pi Network mainnet payments

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Star, 
  Crown, 
  Gift, 
  ShoppingCart, 
  ArrowRight,
  Clock,
  Package,
  Sparkles
} from 'lucide-react';
import { piMainnetWalletService, ShopItem } from '@/services/piMainnetWalletService';
import PiPaymentModal from './PiPaymentModal';

const ShopItems: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const items = piMainnetWalletService.getShopItems();
  const categories = ['all', 'powerup', 'cosmetic', 'boost', 'special'];

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleSelectItem = (itemId: string) => {
    setSelectedItem(itemId);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (order: any) => {
    console.log('Shop item payment completed:', order);
    setIsPaymentModalOpen(false);
    setSelectedItem(null);
  };

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'powerup': return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'cosmetic': return <Star className="w-6 h-6 text-pink-500" />;
      case 'boost': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'special': return <Gift className="w-6 h-6 text-green-500" />;
      default: return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'powerup': return 'border-yellow-200 bg-yellow-50';
      case 'cosmetic': return 'border-pink-200 bg-pink-50';
      case 'boost': return 'border-purple-200 bg-purple-50';
      case 'special': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Flappy Pi Shop
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enhance your gaming experience with powerups, cosmetics, and special items.
          All items are purchased with Pi Network mainnet payments.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Items' : category}
          </Button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${getCategoryColor(item.category)}`}
          >
            {item.isLimited && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-red-500 text-white px-2 py-1 text-xs">
                  Limited
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getItemIcon(item.category)}
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {item.name}
                  </CardTitle>
                </div>
                {item.rarity && (
                  <Badge className={getRarityColor(item.rarity)}>
                    {item.rarity}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {item.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Item Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>
                    Quantity: {typeof item.quantity === 'number' ? item.quantity : (typeof item.supply === 'number' ? item.supply : 'Unlimited')}
                  </span>
                </div>
                {item.category === 'boost' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {item.duration || 'N/A'}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-green-600">
                    {item.flappyCoinPrice ? item.flappyCoinPrice : item.piPrice}
                  </span>
                  <span className="text-sm text-gray-600">{item.flappyCoinPrice ? 'FC' : 'π'}</span>
                </div>
                {((typeof item.quantity === 'number' && item.quantity === 0) || (typeof item.supply === 'number' && item.supply === 0)) ? (
                  <Button size="sm" className="bg-gray-400 cursor-not-allowed" disabled>
                    Out of Stock
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSelectItem(item.id)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Buy
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-600">
            No items available in the {selectedCategory} category.
          </p>
        </div>
      )}

      {/* Special Offers */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Special Offers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Bundle Deals</h4>
            <p className="text-sm opacity-90">
              Save up to 30% when you buy multiple items together
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Daily Rewards</h4>
            <p className="text-sm opacity-90">
              Check back daily for special limited-time offers
            </p>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Secure Pi Network Payments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Instant Delivery</h4>
            <p>Items are delivered immediately after payment confirmation</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Secure Blockchain</h4>
            <p>All transactions are recorded on Pi Network's secure blockchain</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">24/7 Support</h4>
            <p>Get help anytime with our dedicated support team</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedItem && (
        <PiPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedItem(null);
          }}
          itemType="shop_item"
          itemId={selectedItem}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default ShopItems;
