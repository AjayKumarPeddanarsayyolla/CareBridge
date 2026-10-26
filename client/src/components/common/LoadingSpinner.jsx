import React from 'react';
import { HeartPulse } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading clinical data...', size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-teal-600">
          <HeartPulse className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      {message && <p className="text-xs font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  );
};
