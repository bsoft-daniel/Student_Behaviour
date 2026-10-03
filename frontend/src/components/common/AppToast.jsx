import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const AppToastItem = ({ toast, onClose }) => {
  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          color: '#14532d',
          iconColor: '#16a34a'
        };
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          color: '#7f1d1d',
          iconColor: '#dc2626'
        };
      case 'warning':
        return {
          backgroundColor: '#fffbeb',
          borderColor: '#fde68a',
          color: '#78350f',
          iconColor: '#d97706'
        };
      case 'info':
      default:
        return {
          backgroundColor: '#f0f9ff',
          borderColor: '#bae6fd',
          color: '#0c4a6e',
          iconColor: '#0284c7'
        };
    }
  };

  const getIcon = (type, color) => {
    const props = { size: 18, style: { color, flexShrink: 0 } };
    switch (type) {
      case 'success':
        return <CheckCircle2 {...props} />;
      case 'error':
        return <XCircle {...props} />;
      case 'warning':
        return <AlertTriangle {...props} />;
      case 'info':
      default:
        return <Info {...props} />;
    }
  };

  const styleConfig = getToastStyle(toast.type);

  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '12px',
        border: `1px solid ${styleConfig.borderColor}`,
        backgroundColor: styleConfig.backgroundColor,
        color: styleConfig.color,
        boxShadow: '0 10px 25px -5px rgba(11, 60, 116, 0.12)',
        minWidth: '280px',
        maxWidth: '380px',
        width: '100%',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '1.4',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, paddingRight: '8px' }}>
        {getIcon(toast.type, styleConfig.iconColor)}
        <span style={{ wordBreak: 'break-word' }}>{toast.message}</span>
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: styleConfig.color,
          opacity: 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}
        onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseOut={(e) => { e.currentTarget.style.opacity = '0.6'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const AppToastContainer = ({ toasts = [], onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <AppToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default AppToastContainer;
