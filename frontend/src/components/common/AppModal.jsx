import React, { useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './Button';

export const AppModal = ({
  isOpen = false,
  onClose,
  title = '',
  subtitle = null,
  icon: Icon = null,
  children,
  footer = null,
  confirmText = 'Save Changes',
  cancelText = 'Cancel',
  onConfirm = null,
  onCancel = null,
  loading = false,
  disabled = false,
  confirmVariant = 'primary',
  size = 'md', // sm | md | lg | xl | full
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showFooter = true,
}) => {
  const overlayRef = useRef(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current && onClose) {
      onClose();
    }
  };

  // Determine width based on size prop
  const getSizeWidth = () => {
    switch (size) {
      case 'sm':
        return '360px';
      case 'lg':
        return '580px';
      case 'xl':
        return '720px';
      case 'full':
        return '94vw';
      case 'md':
      default:
        return '460px';
    }
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: getSizeWidth(),
          maxHeight: size === 'full' ? '96vh' : '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: 'none',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        {/* Header with Teal to Navy Gradient */}
        <div
          style={{
            padding: '12px 18px',
            background: 'linear-gradient(135deg, #1ba3b9 0%, #1d5287 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {Icon && (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={16} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '14px 18px',
            overflowY: 'auto',
            flex: 1,
            color: '#334155',
            fontSize: '12px',
            lineHeight: '1.4'
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div
            style={{
              padding: '10px 18px',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: 'none'
            }}
          >
            {footer ? (
              footer
            ) : (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCancelClick}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#eef2f6',
                    color: '#475569',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#eef2f6'; }}
                >
                  {cancelText}
                </button>

                {onConfirm && (
                  <button
                    type="button"
                    disabled={disabled || loading}
                    onClick={onConfirm}
                    style={{
                      padding: '6px 18px',
                      borderRadius: '10px',
                      backgroundColor: '#168a9b',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '12px',
                      border: '1.5px solid #00b4d8',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(22, 138, 155, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#137988'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#168a9b'; }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      confirmText
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
