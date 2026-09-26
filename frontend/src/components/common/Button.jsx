import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon = null,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-xs';

  const variants = {
    primary: 'bg-[#0B4F8A] hover:bg-[#073763] text-white focus:ring-[#0B4F8A]/40 border border-transparent',
    secondary: 'bg-[#1777C8] hover:bg-[#0B4F8A] text-white focus:ring-[#1777C8]/40 border border-transparent',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/40 border border-transparent',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/40 border border-transparent',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500/40 border border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300 shadow-none',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
