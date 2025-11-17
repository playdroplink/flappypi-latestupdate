import React from 'react';

interface FloatingCoin {
  x: number;
  y: number;
  collected: boolean;
  id: number;
  animationFrame: number;
  value: number;
}

interface FloatingCoinProps {
  coins: FloatingCoin[];
  canvasWidth: number;
  canvasHeight: number;
}

export const renderFloatingCoins = (
  ctx: CanvasRenderingContext2D,
  coins: FloatingCoin[]
) => {
  coins.forEach(coin => {
    if (coin.collected) return;

    const { x, y, animationFrame, value } = coin;
    
    // Create floating animation with improved bobbing effect
    const bobOffset = Math.sin(animationFrame * 0.08) * 2;
    const coinY = y + bobOffset;
    
    // Draw coin shadow for depth (positioned relative to world coordinates)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + 2, coinY + 18, 12, 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Save context for coin rendering
    ctx.save();
    
    // Translate to coin center for proper rotation origin
    ctx.translate(x, coinY);
    
    // Add smooth rotation animation
    const rotationAngle = animationFrame * 0.05;
    ctx.rotate(rotationAngle);
    
    // Draw outer coin ring (golden) - centered on origin
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.7, '#FFA500');
    gradient.addColorStop(1, '#FF8C00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw inner coin details - centered on origin
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw Pi symbol in the center
    ctx.fillStyle = '#8B4513';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('π', 0, 0);
    
    // Restore context (back to world coordinates)
    ctx.restore();
    
    // Add sparkle effect (in world coordinates for proper positioning)
    ctx.save();
    const sparkleOffset = animationFrame * 0.12;
    for (let i = 0; i < 3; i++) {
      const angle = (sparkleOffset + i * 120) * Math.PI / 180;
      const sparkleX = x + Math.cos(angle) * 22;
      const sparkleY = coinY + Math.sin(angle) * 22;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(sparkleOffset + i) * 0.4})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
    
    // Draw value indicator for high-value coins (in world coordinates)
    if (value > 1) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const valueText = `+${value}`;
      ctx.strokeText(valueText, x, coinY - 30);
      ctx.fillText(valueText, x, coinY - 30);
      ctx.restore();
    }
    
    // Add glowing effect for rare coins (in world coordinates)
    if (value >= 3) {
      ctx.save();
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, coinY, 18, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  });
};

const FloatingCoin: React.FC<FloatingCoinProps> = ({ coins, canvasWidth, canvasHeight }) => {
  // This component is mainly for type definition and could render debug info
  return null;
};

export default FloatingCoin; 