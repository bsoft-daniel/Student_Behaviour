import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AppToastContainer } from '../components/common/AppToast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Set());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    if (!message) return;
    const key = `${type}:${message}`;

    // Prevent duplicate toast messages emitted within short timeframe
    if (recentToastsRef.current.has(key)) return;
    recentToastsRef.current.add(key);
    setTimeout(() => {
      recentToastsRef.current.delete(key);
    }, 2000);

    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const showError = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const showWarning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const showInfo = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      <AppToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

