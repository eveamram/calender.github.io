import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '85vh',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Sheet Container */}
      <div style={{
        position: 'relative',
        zIndex: 1001,
        backgroundColor: 'var(--bg-secondary)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid var(--border-color)',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.15)',
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* Drag Handle */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '10px',
          paddingBottom: '6px',
        }}>
          <div style={{
            width: '36px',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: 'var(--border-color)',
          }} />
        </div>

        {/* Title & Close Bar */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 1.25rem 0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--bg-hover)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Sheet Content */}
        <div style={{
          padding: '1.25rem',
          overflowY: 'auto',
          flex: 1,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};
