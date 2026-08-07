import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PROFILE_COLORS } from '../../types';
import { Calendar, Sparkles, Check, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const { signIn, signUp, enableDemoMode, isDemoMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileColor, setProfileColor] = useState(PROFILE_COLORS[0]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your display name.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, displayName.trim(), profileColor);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div className="glass-modal animate-scale-in" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2rem',
        position: 'relative',
      }}>
        {/* Header Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
          }}>
            <Calendar size={32} />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Shared Student Calendar
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Track exams, assignments & trips together with your best friend.
        </p>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-hover)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            className="btn"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
            style={{
              flex: 1,
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: !isSignUp ? 'var(--bg-card)' : 'transparent',
              color: !isSignUp ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
            style={{
              flex: 1,
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: isSignUp ? 'var(--bg-card)' : 'transparent',
              color: isSignUp ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Your Name / Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex (Friend A)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Choose Your Avatar Profile Color
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PROFILE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProfileColor(c)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: profileColor === c ? '3px solid var(--text-primary)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transition: 'transform 0.15s ease',
                      transform: profileColor === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {profileColor === c && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
          >
            {loading ? 'Connecting...' : isSignUp ? 'Create My Account' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={enableDemoMode}
            className="btn btn-ghost"
            style={{
              fontSize: '0.85rem',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={16} />
            {isDemoMode ? 'Continue with Live Interactive Demo' : 'Try Preview Demo Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
