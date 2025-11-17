import React from 'react';
import './Pipe.css'; // Add animation classes here

const PIPE_TOP_IMG = '/assets/pipe.png';
const PIPE_BOTTOM_IMG = '/assets/pipe_red.png';

const Pipe = ({
  isTop = false,
  x = 0,
  height = 300,
  color = '#4CAF50', // Default: green
  effect = '', // animation class name
}: {
  isTop?: boolean;
  x: number;
  height: number;
  color?: string;
  effect?: string;
}) => {
  return (
    <>
      <img
        src={isTop ? PIPE_TOP_IMG : PIPE_BOTTOM_IMG}
        alt="Pipe"
        style={{
          position: 'absolute',
          left: `${x}px`,
          width: '80px',
          height: `${height}px`,
          top: isTop ? '0px' : 'auto',
          bottom: isTop ? 'auto' : '0px',
          zIndex: 2,
          objectFit: 'fill',
          transform: isTop ? 'scaleY(-1)' : 'none',
        }}
        className={effect}
        onError={(e) => {
          // fallback to div if image fails
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {/* Fallback: old div pipe if image fails */}
      <div
        className={`pipe-body ${effect}`}
        style={{
          position: 'absolute',
          left: `${x}px`,
          width: '80px',
          height: `${height}px`,
          backgroundColor: color,
          border: '4px solid #333',
          borderRadius: '8px',
          top: isTop ? '0px' : 'auto',
          bottom: isTop ? 'auto' : '0px',
          transform: isTop ? 'scaleY(-1)' : 'none',
          zIndex: 1,
          display: 'none', // Only show if image fails
        }}
      />
    </>
  );
};

export default Pipe;
