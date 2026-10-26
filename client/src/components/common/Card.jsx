import React from 'react';

export const Card = ({
  children,
  className = '',
  variant = 'glass', // 'glass', 'flat', 'elevated', 'bordered'
  hover = true,
  interactive = false,
  ...props
}) => {
  const base = 'rounded-3xl transition-all duration-200';
  
  const variants = {
    glass: 'bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs',
    flat: 'bg-slate-50 border border-slate-100',
    elevated: 'bg-white border border-slate-100 shadow-card-elevated',
    bordered: 'bg-white border border-slate-200 shadow-xs',
    navy: 'bg-slate-900 border border-slate-800 text-white shadow-xl',
    tealTint: 'bg-gradient-to-br from-teal-50/60 to-cyan-50/30 border border-teal-100/80 shadow-xs',
  };

  const hoverStyle = hover
    ? 'hover:shadow-glass-hover hover:border-teal-200/80'
    : '';

  const interactiveStyle = interactive
    ? 'cursor-pointer active:scale-[0.99]'
    : '';

  return (
    <div
      className={`${base} ${variants[variant] || variants.glass} ${hoverStyle} ${interactiveStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', title, subtitle, action }) => (
  <div className={`p-6 pb-4 border-b border-slate-100/80 flex items-center justify-between gap-4 ${className}`}>
    <div>
      {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 border-t border-slate-100/80 bg-slate-50/50 rounded-b-3xl ${className}`}>
    {children}
  </div>
);
