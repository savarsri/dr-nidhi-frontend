import React, { useEffect } from 'react';
import { PlusSquare } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-deeper flex items-center justify-center">
      <div className="animate-[bounce_1s_infinite] text-white flex flex-col items-center">
        <PlusSquare className="w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold">Dr. Nidhi</h1>
      </div>
    </div>
  );
};