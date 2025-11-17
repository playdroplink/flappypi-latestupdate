import React from 'react';
import Pipe from './Pipe';

const PipePair = ({
  x,
  gap = 140,
  color = '#4CAF50',
  height = 320,
  effect = '',
}: {
  x: number;
  gap?: number;
  color?: string;
  height?: number;
  effect?: string;
}) => {
  const topPipeHeight = Math.floor(Math.random() * 100) + 100;

  return (
    <>
      <Pipe isTop x={x} height={topPipeHeight} color={color} effect={effect} />
      <Pipe isTop={false} x={x} height={height} color={color} effect={effect} />
    </>
  );
};

export default PipePair; 