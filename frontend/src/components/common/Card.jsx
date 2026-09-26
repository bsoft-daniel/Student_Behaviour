import React from 'react';

export const Card = ({
  children,
  className = '',
  title = null,
  subtitle = null,
  action = null,
  padding = 'normal',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    tight: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-6',
    spacious: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs transition-shadow duration-200 hover:shadow-sm ${paddings[padding] || paddings.normal} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div>
            {title && <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
