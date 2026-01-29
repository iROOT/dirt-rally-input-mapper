import React, { useEffect, useRef } from 'react';

interface Props {
  deviceIndex: number;
  type: 'axis' | 'button';
  index: number;
  className?: string;
}

export const InputVisualizer: React.FC<Props> = ({ deviceIndex, type, index, className = '' }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      const gps = navigator.getGamepads();
      const gp = gps[deviceIndex];
      
      if (gp && barRef.current) {
        let value = 0;
        
        if (type === 'axis') {
          // Raw axis value is usually -1.0 to 1.0
          value = gp.axes[index] || 0;
          
          // Convert -1..1 to 0..100%
          const pct = Math.max(0, Math.min(100, ((value + 1) / 2) * 100));
          barRef.current.style.width = `${pct}%`;
        } else {
          // Button value 0..1
          const btn = gp.buttons[index];
          value = btn ? (typeof btn === 'object' ? btn.value : (btn ? 1 : 0)) : 0;
          
          // For buttons, we just change opacity or fill
          barRef.current.style.width = `${value * 100}%`;
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [deviceIndex, type, index]);

  return (
    <div className={`relative h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 ${className}`}>
      {/* Center marker for axes */}
      {type === 'axis' && (
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-500 z-10 opacity-50"></div>
      )}
      
      {/* Active Bar */}
      <div 
        ref={barRef} 
        className={`h-full transition-none ${type === 'axis' ? 'bg-orange-500' : 'bg-green-500'}`}
        style={{ width: type === 'axis' ? '50%' : '0%' }}
      />
    </div>
  );
};
