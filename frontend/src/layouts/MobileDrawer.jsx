import React from 'react';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

export const MobileDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex-1 max-w-xs w-full bg-white flex flex-col z-10">
        <div className="p-4 flex items-center justify-between border-b border-slate-200">
          <span className="font-bold text-slate-800">Navigation</span>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar className="flex-1" />
      </div>
    </div>
  );
};
