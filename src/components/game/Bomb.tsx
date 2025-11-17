import React from 'react';
import './Bomb.css';

interface BombProps {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const Bomb: React.FC<BombProps> = ({ x, y, width, height, speed }) => {
  return (
    <div
      className="bomb"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: 10,
        transform: `translateY(${speed}px)`,
        transition: 'transform 0.1s linear'
      }}
    >
      <div className="bomb-body">
        <div className="bomb-fuse"></div>
        <div className="bomb-sparkle"></div>
      </div>
    </div>
  );
};

export default Bomb;
