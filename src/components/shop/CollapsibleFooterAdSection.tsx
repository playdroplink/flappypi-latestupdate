import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import PaymentButton from '@/components/ui/PaymentButton';

interface CollapsibleFooterAdSectionProps {
  onWatchAd: () => void;
  rewardAmount?: number;
  recordAdImpression?: (piUserId: string, rewardAmount: number) => Promise<boolean>;
  isWatchingAd: boolean;
  adNetworkSupported: boolean;
  isPiBrowser: boolean;
}

const CollapsibleFooterAdSection: React.FC<CollapsibleFooterAdSectionProps> = ({
  onWatchAd,
  rewardAmount = 10,
  recordAdImpression,
  isWatchingAd,
  adNetworkSupported,
  isPiBrowser
}) => {
  const [open, setOpen] = useState(false);

  if (!adNetworkSupported || !isPiBrowser) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center pointer-events-none">
      <div
        className={`transition-all duration-500 pointer-events-auto ${open ? 'translate-y-0' : '-translate-y-full'} w-full max-w-xl`}
        style={{ minHeight: open ? 0 : 0 }}
      >
        <div className="flex flex-col items-center">
          {/* Toggle bar */}
          <button
            className="w-full flex items-center justify-center gap-2 bg-yellow-300 text-yellow-900 font-bold py-2 rounded-t-2xl shadow-lg hover:bg-yellow-400 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Hide Earn Flappy Coins' : 'Show Earn Flappy Coins'}
            style={{ borderBottomLeftRadius: open ? 0 : 16, borderBottomRightRadius: open ? 0 : 16 }}
          >
            <img src="/flappycoins.png" alt="Flappy Coin" className="h-6 w-6 mr-2" />
            Earn Flappy Coins
            {open ? <ChevronDown className="ml-2 w-5 h-5" /> : <ChevronUp className="ml-2 w-5 h-5" />}
          </button>

          {/* Collapsible content */}
          <div
            className={`overflow-hidden bg-white w-full rounded-b-2xl shadow-xl border-2 border-yellow-300 transition-all duration-500 ${open ? 'max-h-[300px] p-6' : 'max-h-0 p-0'}`}
            style={{ transitionProperty: 'max-height, padding' }}
          >
            {open && (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img src="/flappycoins.png" alt="Flappy Coin" className="w-20 h-20 object-contain drop-shadow-lg" />
                <div className="flex-1 flex flex-col items-center md:items-start">
                  <h2 className="text-2xl font-bold text-yellow-600 mb-1">Earn Flappy Coins</h2>
                  <p className="text-md text-gray-700 mb-3">Watch a Pi Ad Network ad and get <span className="font-bold text-yellow-700">{rewardAmount} Flappy Coins</span> instantly!</p>
                  <PaymentButton 
                    type="coins" 
                    price={rewardAmount} 
                    onClick={onWatchAd}
                    disabled={isWatchingAd}
                  >
                    {isWatchingAd ? "Loading Ad..." : `Watch Ad for ${rewardAmount} Coins`}
                  </PaymentButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleFooterAdSection; 