import React from 'react';
import { PulseLoader } from 'react-spinners';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 max-w-3xl mx-auto w-full my-3">
        <PulseLoader 
          color="#f59e0b"
          size={6} 
          margin={3}
          speedMultiplier={0.8}
        />
    </div>
  );
};