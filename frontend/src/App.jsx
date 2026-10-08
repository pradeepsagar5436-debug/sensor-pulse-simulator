import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CheckCircle2, AlertCircle, Info, Activity, Cpu, Shield, Zap, BarChart3, ArrowRight, Lock } from 'lucide-react';

// ─── Landing / Auth Gate ──────────────────────────────────────────────────────
function LandingPage({ onOpenAuth, openTab }) {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        {/* Animated background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="landing-content">
          <div className="landing-badge">
            <Activity size={14} />
            <span>IoT Telemetry Platform</span>
          </div>

          <h1 className="landing-title">
            Sensor<span className="landing-title-accent">Pulse</span>™
          </h1>
          <p className="landing-subtitle">
            Real-time sensor detection, live power consumption monitoring,
            and historical telemetry — all in one intelligent dashboard.
          </p>

          <div className="landing-cta-row">
            <button
              className="landing-btn-primary"
              onClick={() => openTab('register')}
            >
              <Zap size={18} />
              Create Free Account
              <ArrowRight size={16} />
            </button>
            <button
              className="landing-btn-secondary"
              onClick={() => openTab('login')}
            >
              <Lock size={16} />
              Sign In
            </button>
          </div>

          {/* Feature cards */}
          <div className="landing-features">
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#06b6d4' }}>
                <Cpu size={24} />
              </div>
              <h3>Live Sensor Control</h3>
              <p>Toggle sensors in real-time with instant state persistence</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#a855f7' }}>
                <BarChart3 size={24} />
              </div>
              <h3>Power Analytics</h3>
              <p>Monitor AC, Fan, Light &amp; component energy consumption live</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#10b981' }}>
                <Shield size={24} />
              </div>
              <h3>JWT Authentication</h3>
              <p>Secure access with access/refresh token rotation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Application (authenticated shell) ───────────────────────────────────
function MainApp() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sensorStatus, setSensorStatus] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const openAuthTab = (tab) => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  // While checking localStorage auth, show spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: '16px'
      }}>
        <div className="brand-icon" style={{ width: 56, height: 56 }}>
          <Activity size={28} color="#fff" />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initializing SensorPulse™...</span>
      </div>
    );
  }

  // Not logged in → show landing page
  if (!user) {
    return (
      <>
        <LandingPage onOpenAuth={() => setIsAuthOpen(true)} openTab={openAuthTab} />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          addToast={addToast}
          initialTab={authInitialTab}
        />
        {/* Toast Layer */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === 'success' && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
              {t.type === 'error' && <AlertCircle size={18} color="var(--accent-crimson)" />}
              {t.type === 'info' && <Info size={18} color="var(--accent-cyan)" />}
              <span style={{ fontSize: '0.85rem', color: '#fff' }}>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Logged in → full app shell
  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        sensorStatus={sensorStatus}
        onOpenAuth={() => openAuthTab('login')}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard
            sensorStatus={sensorStatus}
            setSensorStatus={setSensorStatus}
            addToast={addToast}
          />
        )}
        {activePage === 'profile' && (
          <Profile
            addToast={addToast}
            onOpenAuth={() => openAuthTab('login')}
          />
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(8, 13, 26, 0.9)'
      }}>
        <p>SensorPulse™ IoT Simulator &amp; Telemetry Platform • Built with React &amp; Spring Boot</p>
        <p style={{ marginTop: '4px', fontSize: '0.75rem' }}>
          Real-time ON/OFF state persistence with H2 Database &amp; JWT Access/Refresh Token Authentication
        </p>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        addToast={addToast}
        initialTab={authInitialTab}
      />

      {/* Toast Layer */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
            {t.type === 'error' && <AlertCircle size={18} color="var(--accent-crimson)" />}
            {t.type === 'info' && <Info size={18} color="var(--accent-cyan)" />}
            <span style={{ fontSize: '0.85rem', color: '#fff' }}>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
