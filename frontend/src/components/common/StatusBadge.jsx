import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const getStyle = (st) => {
    const s = (st || '').toLowerCase();
    if (s.includes('open') || s.includes('active') || s.includes('present')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('progress') || s.includes('pending') || s.includes('late')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('critical') || s.includes('absent') || s.includes('urgent') || s.includes('severe')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (s.includes('resolved') || s.includes('closed') || s.includes('excused')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStyle(
        status
      )} ${className}`}
    >
      {status || 'Unknown'}
    </span>
  );
};
