import React from 'react';

export const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const base = 'skeleton-box rounded-xl';
  const variantStyles = {
    text: 'h-4 w-full',
    title: 'h-7 w-3/4',
    avatar: 'rounded-full w-12 h-12 flex-shrink-0',
    card: 'h-48 w-full rounded-3xl',
    button: 'h-11 w-32 rounded-xl',
  };

  return (
    <div
      className={`${base} ${variantStyles[variant] || ''} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton variant="avatar" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="title" className="w-1/2" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-4/5" />
    </div>
    <div className="pt-2 flex justify-between items-center">
      <Skeleton variant="button" className="w-24 h-8" />
      <Skeleton variant="button" className="w-28 h-8" />
    </div>
  </div>
);
