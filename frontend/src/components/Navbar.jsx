import React from 'react';
import { Activity, Power, User, LogOut, UserCircle, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage, sensorStatus, onOpenAuth }) {
  const { user, logout } = useAuth();
  const isSensorOn = sensorStatus?.currentState === 'ON';

  return (
    <header className="navbar">
      <div
        className="nav-brand"
        onClick={() => setActivePage('dashboard')}
        role="button"
        tabIndex={0}
        title="Go to Dashboard"
      >
        <div className="brand-icon">
          <Activity size={22} color="#ffffff" />
        </div>
        <div className="brand-title">
          Sensor<span>Pulse</span>™
        </div>
      </div>

      <div className="nav-actions">
        {/* Sensor Live Status Pill */}
        <div
          className="nav-status-pill"
          style={{ cursor: 'pointer' }}
          onClick={() => setActivePage('dashboard')}
          title="Click to view sensor on Dashboard"
        >
          <span className={`status-dot ${isSensorOn ? 'active' : 'inactive'}`} />
          <span>{isSensorOn ? 'SENSOR ACTIVE (ON)' : 'STANDBY (OFF)'}</span>
        </div>

        {/* Dashboard Navigation Button */}
        <button
          id="nav-dashboard-btn"
          className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <Cpu size={16} />
          <span>Dashboard</span>
        </button>

        {user ? (
          <>
            <button
              id="nav-profile-btn"
              className={`nav-btn ${activePage === 'profile' ? 'active' : ''}`}
              onClick={() => setActivePage('profile')}
              style={{ cursor: 'pointer' }}
            >
              <UserCircle size={16} />
              <span>{user.fullName || 'Profile'}</span>
            </button>
            <button
              className="nav-btn"
              onClick={logout}
              title="Log Out"
              style={{ cursor: 'pointer' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <button
            id="nav-auth-btn"
            className="nav-btn nav-btn-primary"
            onClick={onOpenAuth}
            style={{ cursor: 'pointer' }}
          >
            <User size={16} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
