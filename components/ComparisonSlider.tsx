
import React, { useState, useRef } from 'react';

interface ComparisonSliderProps {
  original: string;
  edited: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, edited }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newPos = ((x - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(newPos, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] flex items-center justify-center cursor-ew-resize select-none overflow-hidden"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Edited Image (Bottom Layer) */}
      <img 
        src={edited} 
        alt="Edited" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Original Image (Top Layer) */}
      <div 
        className="absolute inset-0 h-full overflow-hidden pointer-events-none z-10"
        style={{ width: `${position}%` }}
      >
        <img 
          src={original} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-contain"
          style={{ width: `${100 / (position / 100)}%` }}
        />
        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest backdrop-blur-md z-20">
          BEFORE
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-blue-600/80 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest backdrop-blur-md z-20">
        AFTER
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-0.5 bg-white/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center z-30"
        style={{ left: `${position}%` }}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center -ml-0.5 border-4 border-black/10">
          <i className="fa-solid fa-arrows-left-right text-zinc-900 text-xs"></i>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
