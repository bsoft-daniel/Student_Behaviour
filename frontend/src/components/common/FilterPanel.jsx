import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const FilterPanel = ({
  children,
  onReset = null,
  onApply = null,
  className = '',
}) => {
  return (
    <div className={`bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <Filter size={14} className="text-primary" />
          <span>Filters & Search</span>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
      {onApply && (
        <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
          <Button size="sm" onClick={onApply}>
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
};
