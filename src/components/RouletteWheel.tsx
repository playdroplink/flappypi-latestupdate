import React, { useRef, useEffect, useState } from 'react';

interface Reward {
  type: string;
  id?: string;
  name: string;
  image: string;
  amount?: number;
}

interface RouletteWheelProps {
  rewards: Reward[];
  selectedIndex: number;
  spinning: boolean;
  onSpinEnd: () => void;
}

const WHEEL_SIZE = 320;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 16;
const SEGMENT_ANGLE = (2 * Math.PI) / 8; // up to 8 segments for now

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ rewards, selectedIndex, spinning, onSpinEnd }) => {
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalAngle, setFinalAngle] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (spinning && !isSpinning) {
      setIsSpinning(true);
      // Calculate the final angle so the selectedIndex lands at the top
      const seg = 2 * Math.PI / rewards.length;
      const target = (3 * Math.PI / 2) - (selectedIndex * seg) + (Math.random() - 0.5) * (seg * 0.3); // add a little randomness
      setFinalAngle(target + 6 * 2 * Math.PI); // 6 full spins
      setAngle(0);
    }
  }, [spinning, selectedIndex, rewards.length, isSpinning]);

  useEffect(() => {
    if (!isSpinning) return;
    let start: number | null = null;
    let duration = 3500 + Math.random() * 500;
    let startAngle = angle;
    let endAngle = finalAngle;
    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAngle(startAngle + (endAngle - startAngle) * eased);
      if (t < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setTimeout(onSpinEnd, 600);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line
  }, [isSpinning, finalAngle, onSpinEnd]);

  // Draw segments
  const segs = rewards.length;
  const segAngle = 2 * Math.PI / segs;
  const colors = ["#FFD700", "#FF6B6B", "#6BCB77", "#4D96FF", "#A66CFF", "#FFB84C", "#FF6F91", "#43C6AC"];

  return (
    <div style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, position: 'relative', margin: '0 auto' }}>
      <svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ transform: `rotate(${angle}rad)`, transition: isSpinning ? 'none' : 'transform 0.3s' }}>
        {rewards.map((reward, i) => {
          const start = i * segAngle;
          const end = start + segAngle;
          const x1 = CENTER + RADIUS * Math.cos(start);
          const y1 = CENTER + RADIUS * Math.sin(start);
          const x2 = CENTER + RADIUS * Math.cos(end);
          const y2 = CENTER + RADIUS * Math.sin(end);
          const largeArc = segAngle > Math.PI ? 1 : 0;
          const pathData = [
            `M ${CENTER} ${CENTER}`,
            `L ${x1} ${y1}`,
            `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z',
          ].join(' ');
          return (
            <g key={i}>
              <path d={pathData} fill={colors[i % colors.length]} stroke="#fff" strokeWidth={3} />
              {/* Reward image */}
              <image
                href={reward.image}
                x={CENTER + (RADIUS / 1.7) * Math.cos(start + segAngle / 2) - 28}
                y={CENTER + (RADIUS / 1.7) * Math.sin(start + segAngle / 2) - 28}
                width={56}
                height={56}
                style={{ pointerEvents: 'none' }}
              />
              {/* Reward name */}
              <text
                x={CENTER + (RADIUS / 1.2) * Math.cos(start + segAngle / 2)}
                y={CENTER + (RADIUS / 1.2) * Math.sin(start + segAngle / 2) + 8}
                textAnchor="middle"
                fontSize={14}
                fill="#222"
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {reward.name.length > 12 ? reward.name.slice(0, 11) + '…' : reward.name}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Pointer */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '18px solid transparent',
        borderRight: '18px solid transparent',
        borderBottom: '32px solid #FF3C3C',
        zIndex: 2,
      }} />
    </div>
  );
};

export default RouletteWheel; 