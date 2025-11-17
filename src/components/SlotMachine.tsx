import React, { useEffect, useRef, useState } from 'react';

interface SlotItem {
  image: string;
  name: string;
}

interface SlotMachineProps {
  items: SlotItem[];
  resultIndex: number; // The index of the winning item
  spinning: boolean;
  onSpinEnd: () => void;
}

const REEL_COUNT = 3;
const SPIN_DURATION = 1200; // base duration for first reel
const REEL_ITEM_COUNT = 18;

const SlotMachine: React.FC<SlotMachineProps> = ({ items, resultIndex, spinning, onSpinEnd }) => {
  const [reelPositions, setReelPositions] = useState(Array(REEL_COUNT).fill(0));
  const [isSpinning, setIsSpinning] = useState(false);
  const [showJackpot, setShowJackpot] = useState(false);
  const [stopped, setStopped] = useState([false, false, false]);
  const [showConfetti, setShowConfetti] = useState(false);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    if (spinning && !isSpinning) {
      setIsSpinning(true);
      setShowJackpot(false);
      setShowConfetti(false);
      setStopped([false, false, false]);
      // Animate each reel with a staggered delay
      for (let i = 0; i < REEL_COUNT; i++) {
        // Each reel spins for a bit longer than the previous
        const duration = SPIN_DURATION + i * 500;
        timeouts.current.push(
          window.setTimeout(() => {
            setReelPositions((prev) => {
              const newPos = [...prev];
              // Land on the resultIndex for all reels (for jackpot effect)
              newPos[i] = resultIndex;
              return newPos;
            });
            setStopped((prev) => {
              const arr = [...prev];
              arr[i] = true;
              return arr;
            });
            // When last reel stops, finish spin
            if (i === REEL_COUNT - 1) {
              setTimeout(() => {
                setIsSpinning(false);
                setShowJackpot(true);
                setShowConfetti(true);
                onSpinEnd();
              }, 600);
            }
          }, duration)
        );
      }
    }
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, [spinning, resultIndex, onSpinEnd, isSpinning]);

  // Generate a long list of items for each reel
  const getReelItems = (finalIndex: number) => {
    const arr = [];
    for (let i = 0; i < REEL_ITEM_COUNT; i++) {
      arr.push(items[i % items.length]);
    }
    // Ensure the last item is the result
    arr[REEL_ITEM_COUNT - 1] = items[finalIndex];
    return arr;
  };

  // Animation for each reel
  const getReelStyle = (reelIdx: number) => {
    const base = (reelPositions[reelIdx] / (REEL_ITEM_COUNT - 1)) * 100;
    return {
      transform: `translateY(-${base}%)`,
      transition: stopped[reelIdx]
        ? 'transform 0.9s cubic-bezier(0.23, 1.5, 0.32, 1)'
        : 'transform 0.3s linear',
    };
  };

  // Check for jackpot
  const isJackpot = stopped.every(Boolean) && reelPositions.every((pos) => pos === reelPositions[0]);

  return (
    <div className="flex flex-col items-center relative">
      <div className={`flex gap-2 bg-gray-100 rounded-2xl p-4 shadow-inner border-4 border-yellow-300 relative slotmachine-container ${isJackpot ? 'animate-bounce' : ''}`}
        style={isJackpot ? { boxShadow: '0 0 24px 6px gold' } : {}}>
        {Array(REEL_COUNT).fill(0).map((_, reelIdx) => {
          const reelItems = getReelItems(reelPositions[reelIdx]);
          return (
            <div key={reelIdx} className={`w-20 h-32 overflow-hidden rounded-xl bg-white border-2 border-yellow-400 flex flex-col items-center relative ${stopped[reelIdx] ? 'shadow-lg' : ''}`}>
              <div
                className="will-change-transform"
                style={getReelStyle(reelIdx)}
              >
                {reelItems.map((item, idx) => (
                  <div key={idx} className={`flex flex-col items-center py-2 slotmachine-item ${stopped[reelIdx] && idx === REEL_ITEM_COUNT - 1 ? 'slotmachine-item-win' : ''}`}>
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-contain mb-1" />
                    <span className="text-xs font-bold text-gray-700 text-center">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {/* Jackpot effect */}
        {showJackpot && isJackpot && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-4xl font-extrabold text-yellow-500 drop-shadow-lg animate-bounce">JACKPOT!</span>
          </div>
        )}
        {/* Confetti burst */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {[...Array(24)].map((_, i) => {
              const angle = (360 / 24) * i;
              const distance = 80 + Math.random() * 40;
              const color = [
                '#FFD700', '#FFA500', '#FF6B35', '#C0C0C0', '#9B59B6', '#43cea2', '#f9d423', '#f83600'
              ][i % 8];
              return (
                <div
                  key={i}
                  className="slotmachine-confetti"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: color,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                    opacity: 0.85,
                    animation: `confetti-burst 1.2s cubic-bezier(0.23, 1.5, 0.32, 1)`
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      {showJackpot && (
        <div className="mt-4 text-2xl font-bold text-green-600 animate-pulse">You won: {items[resultIndex].name}!</div>
      )}
      {/* Enhanced CSS for slot machine */}
      <style>{`
        .slotmachine-item-win {
          animation: slotmachine-flash 0.7s alternate 2;
          box-shadow: 0 0 16px 4px #ffd700cc, 0 0 0 0 #ffd70000;
          border-radius: 12px;
          background: rgba(255, 215, 0, 0.12);
        }
        @keyframes slotmachine-flash {
          0% { filter: brightness(1); }
          50% { filter: brightness(2.2) drop-shadow(0 0 12px #ffd700); }
          100% { filter: brightness(1); }
        }
        @keyframes confetti-burst {
          0% { opacity: 1; transform: scale(0.7) translate(-50%, -50%) rotate(var(--angle,0deg)) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.2) translate(-50%, -50%) rotate(var(--angle,0deg)) translateY(-120px); }
        }
        .slotmachine-confetti {
          pointer-events: none;
        }
        .slotmachine-container {
          transition: box-shadow 0.3s cubic-bezier(0.23, 1.5, 0.32, 1);
        }
      `}</style>
    </div>
  );
};

export default SlotMachine; 