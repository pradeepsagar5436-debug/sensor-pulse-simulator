import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Shield, CheckCircle, KeyRound, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile({ addToast, onOpenAuth }) {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  if (!user) {
    return (
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '60px auto', padding: '40px', textAlign: 'center' }}>
        <Shield size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Please sign in or create an account to view and manage your operator profile.
        </p>
        <button className="submit-btn" onClick={onOpenAuth} style={{ maxWidth: '240px', margin: '0 auto' }}>
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await updateProfile(profileForm.fullName, profileForm.phone);
      addToast('success', 'Profile details updated successfully!');
    } catch (err) {
      addToast('error', err.response?.data?.message || err.message || 'Profile update failed');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('error', 'New passwords do not match');
      return;
    }
    setLoadingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      addToast('success', 'Password updated! A security confirmation was dispatched.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast('error', err.response?.data?.message || err.message || 'Password update failed');
    } finally {
      setLoadingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'OP';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-container">
      {/* Left Column: Avatar & Overview */}
      <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="avatar-large">{getInitials(user.fullName)}</div>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>{user.fullName}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{user.email}</p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '24px' }}>
          <ShieldCheck size={14} />
          {user.role || 'ROLE_USER'}
        </div>

        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>User ID</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>#{user.id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Registered On</span>
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-dim)' }}></span>
            <span style={{ color: 'var(--accent-emerald)' }}> </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-dim)' }}></span>
            <span style={{ color: 'var(--accent-cyan)' }}></span>
          </div>
        </div>
      </div>

      {/* Right Column: Update Info & Change Password Forms */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Update Profile Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--accent-cyan)" />
            Personal Information
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Update your public operator display name and contact telephone
          </p>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrap">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{ maxWidth: '200px' }} disabled={loadingProfile}>
              {loadingProfile ? 'Saving...' : 'Save Profile Changes'}
              <CheckCircle size={16} />
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="var(--accent-emerald)" />
            Security & Change Password
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Ensure your account is protected with a secure password (minimum 6 characters)
          </p>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{ maxWidth: '220px' }} disabled={loadingPassword}>
              {loadingPassword ? 'Updating...' : 'Update Password'}
              <KeyRound size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
