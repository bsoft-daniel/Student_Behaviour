import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading content...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
      <p className="text-xs sm:text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};
