
import React, { useState, useRef, useEffect } from 'react';

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
      className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none border border-zinc-800"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Edited Image (Bottom Layer) */}
      <img 
        src={edited} 
        alt="Edited" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Original Image (Top Layer) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img 
          src={original} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (position / 100)}%` }}
        />
        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
          BEFORE
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-blue-600/80 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
        AFTER
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-xl flex items-center justify-center"
        style={{ left: `${position}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center -ml-0.5">
          <i className="fa-solid fa-arrows-left-right text-zinc-900 text-xs"></i>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
