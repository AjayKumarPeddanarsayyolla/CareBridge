import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-teal-50 text-teal-700 border-teal-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    navy: 'bg-slate-800 text-slate-100 border-slate-700',
    // Clinical triage specific
    EMERGENCY: 'bg-red-600 text-white border-red-700 animate-pulse font-bold',
    EMERGENCY_CARE: 'bg-red-600 text-white border-red-700 animate-pulse font-bold',
    URGENT: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    URGENT_CONSULTATION: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    ROUTINE: 'bg-blue-50 text-blue-700 border-blue-200',
    ROUTINE_CONSULTATION: 'bg-blue-50 text-blue-700 border-blue-200',
    // Status
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    VERIFIED: 'bg-teal-50 text-teal-700 border-teal-300 font-semibold',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REQUESTED: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ${sizeStyle} ${style} ${className}`}
    >
      {children}
    </span>
  );
};
