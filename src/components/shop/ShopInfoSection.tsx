
import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const ShopInfoSection: React.FC = () => {
  return (    <Card className="p-4 bg-white border">
      <div className="flex items-start space-x-3">
        <Zap className="h-6 w-6 text-gray-600 mt-1" />
        <div>
          <h4 className="font-semibold text-gray-800">Earning & Spending Coins</h4>
          <p className="text-gray-700 text-sm mt-1">
            Earn 1 coin for every pipe you pass! Premium skins cost 10,000 coins or 10 Pi.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Pi purchases support the Pi Network ecosystem and unlock exclusive content instantly.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ShopInfoSection;
