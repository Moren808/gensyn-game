import React, { useState, useRef } from 'react';
import { Vector2D } from '../types';

interface VirtualJoystickProps {
  onMove: (vector: Vector2D) => void;
  onEnd: () => void;
  size?: number;
  nubSize?: number;
  baseColor?: string;
  nubColor?: string;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onEnd,
  size = 120,
  nubSize = 50,
  baseColor = 'rgba(255, 255, 255, 0.2)',
  nubColor = 'rgba(255, 255, 255, 0.4)',
}) => {
  const [isActive, setIsActive] = useState(false);
  const [nubPosition, setNubPosition] = useState<Vector2D>({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchId.current !== null) return;
    const touch = e.changedTouches[0];
    touchId.current = touch.identifier;
    setIsActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isActive) return;
    
    // FIX: Explicitly type the argument `t` as `Touch`. The type was previously inferred as `unknown`, causing errors when accessing `t.identifier` and properties of `touch`.
    const touch = Array.from(e.changedTouches).find((t: Touch) => t.identifier === touchId.current);
    if (!touch || !baseRef.current) return;

    const { left, top, width, height } = baseRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    let x = touch.clientX - centerX;
    let y = touch.clientY - centerY;

    const mag = Math.sqrt(x * x + y * y);
    const maxRadius = (size - nubSize) / 2;

    if (mag > maxRadius) {
      x = (x / mag) * maxRadius;
      y = (y / mag) * maxRadius;
    }
    
    setNubPosition({ x, y });
    
    const moveVector = {
      x: x / maxRadius,
      y: y / maxRadius,
    };
    onMove(moveVector);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    // FIX: Explicitly type the argument `t` as `Touch`. The type was previously inferred as `unknown`, causing an error when accessing `t.identifier`.
    const touch = Array.from(e.changedTouches).find((t: Touch) => t.identifier === touchId.current);
    if (!touch) return;
    
    touchId.current = null;
    setIsActive(false);
    setNubPosition({ x: 0, y: 0 });
    onEnd();
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: baseColor,
        position: 'relative',
        touchAction: 'none',
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: nubSize,
          height: nubSize,
          backgroundColor: nubColor,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${nubPosition.x}px, ${nubPosition.y}px)`,
          transition: isActive ? 'none' : 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default VirtualJoystick;