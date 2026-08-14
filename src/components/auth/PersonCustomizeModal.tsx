import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCalendar } from '../../context/CalendarContext';
import { X, Check, Upload, RotateCcw } from 'lucide-react';

interface PersonCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = ['👩‍🎓', '👩‍💻', '🌸', '🎨', '📚', '⚡', '🌟'];
const COLOR_PRESETS = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Amber', hex: '#F59E0B' },
];

export const PersonCustomizeModal: React.FC<PersonCustomizeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, updateProfile } = useAuth();
  const { resetAllData, resetAnniversaryWithPassword } = useCalendar();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
      setAvatarUrl(userProfile.avatar_url || '👩‍🎓');
      setSelectedColor(userProfile.profile_color || '#3B82F6');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        profile_color: selectedColor,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '380px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Edit Profile
          </h3>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Avatar Preview & Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: `${selectedColor}18`,
              border: `3px solid ${selectedColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              {avatarUrl.startsWith('http') || avatarUrl.startsWith('data:') ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                avatarUrl || '👩‍🎓'
              )}
            </div>

            {/* Single Row Emoji Pills */}
            <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: avatarUrl === emoji ? `2.5px solid ${selectedColor}` : '1px solid var(--border-color)',
                    backgroundColor: avatarUrl === emoji ? `${selectedColor}15` : 'var(--bg-primary)',
                    fontSize: '1.15rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Custom Photo Upload Button */}
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}>
              <Upload size={13} /> Upload photo
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      if (evt.target?.result) {
                        setAvatarUrl(evt.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Name
            </label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
              style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem', borderRadius: '12px' }}
            />
          </div>

          {/* Color Presets */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Profile Color
            </label>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setSelectedColor(col.hex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: col.hex,
                    border: selectedColor === col.hex ? '3px solid var(--text-primary)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    transition: 'all 0.12s ease',
                  }}
                  title={col.name}
                >
                  {selectedColor === col.hex && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Protected Anniversary Reset & Data Reset */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                resetAnniversaryWithPassword();
              }}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '12px',
                border: '1px solid #FBCFE8',
                backgroundColor: '#FDF2F8',
                color: '#BE185D',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              💖 Reset Anniversary (Password: MacLeod)
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset calendar events, tasks, classes, meals & habits? (Anniversary events will be kept!)')) {
                  resetAllData();
                }
              }}
              style={{
                width: '100%',
                padding: '0.55rem',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} /> Reset App Data
            </button>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ borderRadius: '999px', padding: '0.5rem 1rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !displayName.trim()}
              style={{ borderRadius: '999px', padding: '0.5rem 1.25rem', fontWeight: 800 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
