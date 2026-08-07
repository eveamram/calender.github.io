import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCalendar();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      zIndex: 10000,
      maxWidth: '380px',
      width: 'calc(100% - 3rem)',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-card animate-fade-in"
          style={{
            pointerEvents: 'auto',
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-lg)',
            borderLeft: `4px solid ${
              toast.type === 'success'
                ? '#10B981'
                : toast.type === 'error'
                ? '#EF4444'
                : '#3B82F6'
            }`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {toast.type === 'success' && <CheckCircle2 size={20} style={{ color: '#10B981', flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={20} style={{ color: '#3B82F6', flexShrink: 0 }} />}
            
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {toast.message}
            </span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
