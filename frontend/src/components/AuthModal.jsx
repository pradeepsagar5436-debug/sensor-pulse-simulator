import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, KeyRound, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, addToast, initialTab = 'login' }) {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'forgot' | 'reset'

  // Sync tab with initialTab when modal is opened
  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ token: '', newPassword: '' });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      addToast('success', 'Logged in successfully! Welcome back.');
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await register(registerForm.fullName, registerForm.email, registerForm.password, registerForm.phone);
      addToast('success', 'Registration successful! Verification email sent.');
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      addToast('info', 'Reset code sent! Check your email inbox.');
      setTab('reset');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await resetPassword(resetForm.token, resetForm.newPassword);
      addToast('success', 'Password reset successfully! Please log in.');
      setTab('login');
      setLoginForm((prev) => ({ ...prev, password: resetForm.newPassword }));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoLogin = () => {
    setLoginForm({
      email: 'admin@sensorsimulator.com',
      password: 'Password123!',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Tab switch header */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setErrorMsg(''); }}
          >
            Register
          </button>
          <button
            className={`auth-tab-btn ${tab === 'forgot' || tab === 'reset' ? 'active' : ''}`}
            onClick={() => { setTab('forgot'); setErrorMsg(''); }}
          >
            Reset
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="name@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer' }}
                  onClick={() => setTab('forgot')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In with JWT'}
              <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={fillDemoLogin}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                ⚡ Autofill Demo Credentials
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="John Doe"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Receives Welcome Email)</label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="john@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <div className="input-wrap">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password (Min 6 characters)</label>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account & Dispatch Email'}
              <CheckCircle size={18} />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter your registered email address. We will generate and dispatch a 6-digit password reset verification code.
            </p>
            <div className="form-group">
              <label className="form-label">Account Email</label>
              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP Code...' : 'Send Reset Verification Code'}
              <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                onClick={() => setTab('reset')}
              >
                Already have a reset code? Click here
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter the 6-digit OTP code received in your email inbox.
            </p>
            <div className="form-group">
              <label className="form-label">6-Digit Reset Code / Token</label>
              <div className="input-wrap">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 582914"
                  value={resetForm.token}
                  onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              <CheckCircle size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
