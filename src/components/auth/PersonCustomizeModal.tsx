import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCalendar } from '../../context/CalendarContext';
import { X, Palette, User, Check } from 'lucide-react';
import { PROFILE_COLORS } from '../../types';

interface PersonCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonCustomizeModal: React.FC<PersonCustomizeModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfile } = useAuth();
  const { members, updateMemberProfile, addToast } = useCalendar();

  const [displayName, setDisplayName] = useState(userProfile?.display_name || 'Eve');
  const [profileColor, setProfileColor] = useState(userProfile?.profile_color || '#3B82F6');

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile({
      display_name: displayName.trim() || userProfile?.display_name || 'Person',
      profile_color: profileColor,
    });

    if (userProfile?.id) {
      updateMemberProfile(userProfile.id, {
        display_name: displayName.trim() || 'Person',
        profile_color: profileColor,
      });
    }

    addToast(`Updated ${displayName}'s color & icon!`, 'success');
    onClose();
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
        maxWidth: '420px',
        width: '100%',
        padding: '1.75rem',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Palette size={18} style={{ color: 'var(--accent-primary)' }} /> Customize Person Icon & Color
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Preview Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-hover)',
          borderRadius: '16px',
          marginBottom: '1.25rem',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: profileColor,
            color: '#FFFFFF',
            fontSize: '1.2rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{displayName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calendar Member Avatar</div>
          </div>
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Display Name / Initial
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            placeholder="e.g. Eve or Abbie"
          />
        </div>

        {/* Profile Color Palette Swatches */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Choose Profile Color
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
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
                  border: profileColor === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.12s ease',
                }}
              >
                {profileColor === c && <Check size={14} />}
              </button>
            ))}

            {/* Custom Color Input */}
            <label style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }} title="Custom Color">
              <Palette size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="color"
                value={profileColor}
                onChange={(e) => setProfileColor(e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} style={{ padding: '0.65rem 1.4rem' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
