import React from 'react';
import logoImg from '../../assets/logo bg removed.png';

export const LoadingState = ({ message = 'Loading module...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      textAlign: 'center',
      minHeight: '260px'
    }}>
      <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '16px' }}>
        {/* Outer Animated Ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#0b3c74',
          borderRightColor: '#168a9b',
          animation: 'logoSpinner 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
        }} />
        {/* Centered Pulsing Logo */}
        <img
          src={logoImg}
          alt="Loading..."
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '8px',
            animation: 'logoPulse 1.5s ease-in-out infinite'
          }}
        />
      </div>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0b3c74', letterSpacing: '0.02em' }}>
        {message}
      </p>

      <style>{`
        @keyframes logoSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

