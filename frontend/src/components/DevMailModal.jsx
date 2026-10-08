import React, { useState, useEffect } from 'react';
import { X, Mail, RefreshCw, Copy, Check, Clock, Send } from 'lucide-react';
import api from '../services/api';

export default function DevMailModal({ isOpen, onClose, addToast }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchOutbox = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/outbox');
      if (res.data?.success) {
        setEmails(res.data.data.reverse()); // latest first
      }
    } catch (err) {
      console.warn('Could not fetch outbox:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOutbox();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    if (addToast) addToast('info', 'Content copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to extract 6-digit OTP from email body
  const extractCode = (body) => {
    const match = body.match(/\b\d{6}\b/);
    return match ? match[0] : null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Simulated Mail Server</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Dispatched verification codes and password reset emails
              </p>
            </div>
          </div>

          <button
            onClick={fetchOutbox}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              <Send size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p>No emails dispatched yet.</p>
              <span style={{ fontSize: '0.75rem' }}>
                Register a new user or request a password reset to see emails simulated here.
              </span>
            </div>
          ) : (
            emails.map((mail, idx) => {
              const code = extractCode(mail.body);
              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        TO: {mail.to}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700, marginTop: '2px' }}>
                        {mail.subject}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(mail.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <pre style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {mail.body}
                  </pre>

                  {code && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                        Detected Code: <strong>{code}</strong>
                      </span>
                      <button
                        onClick={() => copyToClipboard(code, idx)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                        {copiedIndex === idx ? 'Copied' : 'Copy Code'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
