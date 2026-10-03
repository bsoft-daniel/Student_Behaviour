import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import schoolLogo from '../../assets/school_logo.png';
import campusFront from '../../assets/campus_front.jpg';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(username.trim(), password);
      showSuccess(`Welcome back, ${loggedUser.first_name || loggedUser.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Background Soft Abstract Elements */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {/* Main Grid Wrapper */}
      <div style={styles.mainGrid}>
        
        {/* LEFT PANEL: Blue Curved Section with School Logo & Details */}
        <div style={styles.leftPanel}>
          <div style={styles.blueBg} />
          <div style={styles.waveDark} />
          <div style={styles.waveGold} />

          <div style={styles.leftContent}>
            {/* School Emblem Logo */}
            <div style={styles.logoContainer}>
              <img 
                src={schoolLogo} 
                alt="St. Martin's Emblem" 
                style={styles.logoImg}
              />
            </div>

            {/* School Name */}
            <h1 style={styles.schoolTitle}>
              St. Martin’s
            </h1>
            <h2 style={styles.schoolSubTitle}>
              Matriculation School
            </h2>

            {/* Subtitle / Location Line */}
            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.locationText}>ANDHAMADAM</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Motto */}
            <p style={styles.mottoText}>
              Knowledge &bull; Discipline &bull; A Brighter Future
            </p>

            {/* School Building Photo Card */}
            <div style={styles.photoCard}>
              <img 
                src={campusFront} 
                alt="St. Martin's Building" 
                style={styles.photoImg}
              />
              <div style={styles.photoOverlay} />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: White Floating Login Card */}
        <div style={styles.rightPanel}>
          <div style={styles.card}>
            
            {/* Emblem Badge on Card */}
            <div style={styles.cardLogoContainer}>
              <img 
                src={schoolLogo} 
                alt="St. Martin's Logo" 
                style={styles.cardLogoImg}
              />
            </div>

            {/* Heading */}
            <h3 style={styles.cardTitle}>Welcome Back</h3>
            <p style={styles.cardSubtitle}>Sign in to your account to continue</p>

            {/* Form */}
            <form onSubmit={handleLogin} style={styles.form}>
              
              {/* Email Address */}
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email Address"
                  required
                  style={styles.inputField}
                />
              </div>

              {/* Password */}
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={styles.inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Options Row */}
              <div style={styles.optionsRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Remember me</span>
                </label>
                
                <a 
                  href="#forgot" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    showSuccess('Please contact your School IT Administrator to reset your password.'); 
                  }}
                  style={styles.forgotLink}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={styles.submitBtn}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={styles.cardFooter}>
              <span style={styles.footerText}>
                St. Martin's Matriculation School
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// Pure Internal React CSS Stylesheet
const styles = {
  pageContainer: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#eef2f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  bgGlow1: {
    position: 'absolute',
    right: '-100px',
    top: '-100px',
    width: '400px',
    height: '400px',
    backgroundColor: 'rgba(191, 219, 254, 0.5)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    right: '-50px',
    bottom: '-50px',
    width: '500px',
    height: '500px',
    backgroundColor: 'rgba(224, 231, 255, 0.7)',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  mainGrid: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
  },
  leftPanel: {
    gridColumn: 'span 5',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
    color: '#ffffff',
    overflow: 'hidden',
    minHeight: '100vh',
  },
  blueBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, #3b59c4 0%, #2d43a6 50%, #1e2e78 100%)',
    clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
  },
  waveDark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '180px',
    backgroundColor: 'rgba(27, 38, 99, 0.9)',
    clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 100%)',
  },
  waveGold: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '130px',
    backgroundColor: 'rgba(229, 168, 35, 0.85)',
    clipPath: 'polygon(0 75%, 100% 15%, 100% 100%, 0 100%)',
  },
  leftContent: {
    position: 'relative',
    zIndex: 10,
    margin: 'auto 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '420px',
    width: '100%',
  },
  logoContainer: {
    width: '160px',
    height: '160px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  schoolTitle: {
    fontSize: '2.5rem',
    fontWeight: '900',
    letterSpacing: '-0.025em',
    color: '#ffffff',
    lineHeight: '1.1',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  schoolSubTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: '0.25rem',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    margin: '0.75rem 0',
  },
  dividerLine: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    flex: 1,
    maxWidth: '60px',
  },
  locationText: {
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#dbeafe',
  },
  mottoText: {
    fontSize: '0.875rem',
    color: 'rgba(219, 234, 254, 0.9)',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  photoCard: {
    marginTop: '2rem',
    width: '100%',
    maxWidth: '280px',
    height: '170px',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    border: '4px solid rgba(255, 255, 255, 0.25)',
    position: 'relative',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
  },

  /* Right Panel */
  rightPanel: {
    gridColumn: 'span 7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '1.75rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    padding: '2.5rem',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardLogoContainer: {
    width: '90px',
    height: '90px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1e295b',
    letterSpacing: '-0.02em',
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
    marginBottom: '2rem',
    fontWeight: '500',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  inputField: {
    width: '100%',
    fontSize: '0.875rem',
    paddingLeft: '3rem',
    paddingRight: '1rem',
    paddingTop: '0.875rem',
    paddingBottom: '0.875rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '1rem',
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    color: '#1e293b',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    paddingTop: '0.25rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#475569',
    fontWeight: '500',
    cursor: 'pointer',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
    accentColor: '#3b59c4',
    cursor: 'pointer',
  },
  forgotLink: {
    fontWeight: '600',
    color: '#3b59c4',
    textDecoration: 'none',
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#3b59c4',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1rem',
    borderRadius: '1rem',
    border: 'none',
    boxShadow: '0 10px 20px -5px rgba(59, 89, 196, 0.4)',
    cursor: 'pointer',
    marginTop: '0.75rem',
    transition: 'all 0.2s ease',
  },
  cardFooter: {
    marginTop: '2.5rem',
    width: '100%',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
};
