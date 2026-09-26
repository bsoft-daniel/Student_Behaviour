import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear = null,
}) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={onClear ? onClear : () => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
