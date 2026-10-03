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
  style = {},
  ...props
}) => {
  const btnClass = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`.trim();

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return <span>{icon}</span>;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.render || icon.$$typeof))) {
      const IconComp = icon;
      return <span><IconComp size={16} /></span>;
    }
    return <span>{icon}</span>;
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={btnClass}
      style={style}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : renderIcon()}
      {children}
    </button>
  );
};
