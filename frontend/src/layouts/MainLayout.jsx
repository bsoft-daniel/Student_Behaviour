import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import logoImg from '../assets/logo bg removed.png';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Show full-screen logo loader whenever user clicks a new module/path
    setNavigating(true);
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Header />
        
        {/* Global Module Transition Overlay Loader */}
        {navigating && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Logo Image Top */}
              <img
                src={logoImg}
                alt="School Logo"
                style={{
                  width: '90px',
                  height: '90px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(11, 60, 116, 0.15))',
                  animation: 'logoGlowPulse 1.5s ease-in-out infinite'
                }}
              />

              {/* Glowing Cyan Dots Spinner BELOW the Logo */}
              <div className="cyan-dot-spinner" style={{ width: '40px', height: '40px', position: 'relative' }}>
                {[...Array(10)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: `${8 - i * 0.5}px`,
                      height: `${8 - i * 0.5}px`,
                      borderRadius: '50%',
                      backgroundColor: '#00f2fe',
                      boxShadow: '0 0 10px #00f2fe, 0 0 20px #00c6ff',
                      transform: `rotate(${i * 36}deg) translate(20px, -50%)`,
                      transformOrigin: '0 0',
                      opacity: 1 - i * 0.08,
                      animation: `cyanPulse 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0b3c74', letterSpacing: '0.04em' }}>
                  ST. MARTIN'S
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '11px', fontWeight: 700, color: '#168a9b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Loading Module...
                </p>
              </div>
            </div>

            <style>{`
              .cyan-dot-spinner {
                animation: rotateDots 1.2s linear infinite;
              }
              @keyframes rotateDots {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes cyanPulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.4); opacity: 0.4; }
              }
              @keyframes logoGlowPulse {
                0%, 100% { transform: scale(0.96); opacity: 0.9; }
                50% { transform: scale(1.04); opacity: 1; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        )}

        <div className="content">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};



