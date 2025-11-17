// This component is now deprecated. Use only the footer power-up bar.
// export default PowerUps;

import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Zap, Star, Clock } from 'lucide-react';

interface PowerUp {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: number;
  active: boolean;
}

interface PowerUpsProps {
  powerUps: PowerUp[];
}

const powerUpGlowColors: { [key: string]: string } = {
  'extra-life': '#ef4444', // Red
  'coin-magnet': '#22d3ee', // Cyan
  '2x-coin-multiplier': '#fbbf24', // Gold
  'shield': '#6366f1', // Blue/Purple
  'turbo-start': '#a21caf', // Purple
};

const PowerUps: React.FC<PowerUpsProps> = ({ powerUps }) => {
  const activePowerUps = powerUps.filter(p => p.active);

  if (activePowerUps.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 space-y-2 pointer-events-none">
      {activePowerUps.map((powerUp) => {
        const glowColor = powerUpGlowColors[powerUp.id] || '#fff';
        return (
          <Card 
            key={powerUp.id}
            className="bg-transparent p-2 shadow-none animate-pulse"
            style={{ boxShadow: `0 0 16px 4px ${glowColor}, 0 0 32px 8px ${glowColor}80, 0 0 48px 16px ${glowColor}40` }}
          >
            <div className="flex items-center space-x-2 text-white">
              <span
                className="relative inline-flex items-center justify-center"
                style={{
                  boxShadow: `0 0 16px 4px ${glowColor}, 0 0 32px 8px ${glowColor}80, 0 0 48px 16px ${glowColor}40`,
                  animation: 'glow 1.5s infinite alternate',
                  background: 'none',
                  borderRadius: 0,
                  padding: 0,
                }}
              >
                {powerUp.icon}
              </span>
              <span className="text-xs font-bold">{typeof powerUp.description === 'string' ? powerUp.description : 'Power-up effect'}</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{powerUp.duration}s</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PowerUps;

<style jsx global>{`
@keyframes glow {
  0% { filter: brightness(1) drop-shadow(0 0 8px #fff); }
  100% { filter: brightness(1.3) drop-shadow(0 0 24px #fff); }
}
`}</style>
