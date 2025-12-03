import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = Math.min(100, (current / total) * 100);
  
  return (
    <div className="w-full h-1 bg-neutral-200/50 rounded-full overflow-hidden mb-8">
      <div 
        className="h-full bg-neutral-800 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};