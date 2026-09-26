import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend = null,
  trendType = 'neutral',
  variant = 'blue',
  subtitle = null,
  onClick = null,
}) => {
  const variants = {
    blue: 'bg-blue-50/60 text-primary border-blue-100',
    green: 'bg-emerald-50/60 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50/60 text-amber-700 border-amber-100',
    rose: 'bg-rose-50/60 text-rose-700 border-rose-100',
    purple: 'bg-purple-50/60 text-purple-700 border-purple-100',
  };

  const iconBg = {
    blue: 'bg-blue-100 text-primary',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg[variant] || iconBg.blue} shrink-0`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trendType === 'positive'
                ? 'text-emerald-600'
                : trendType === 'negative'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
