import React from 'react';

interface AppLogoProps {
  size?: number; // Outer container size in px (default 32)
  showWordmark?: boolean;
  fontSize?: string; // Font size of wordmark (default '1.2rem')
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  showWordmark = true,
  fontSize = '1.2rem',
  onClick,
}) => {
  const iconSize = Math.round(size * 0.625);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Icon Container */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        backgroundColor: '#FFFFFF',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        flexShrink: 0,
      }}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Minimal Calendar Outline */}
          <rect x="4" y="5.5" width="16" height="15" rx="3.5" stroke="#18181B" strokeWidth="1.8" fill="#FFFFFF" />
          <line x1="4" y1="9.5" x2="20" y2="9.5" stroke="#18181B" strokeWidth="1.5" />
          <line x1="8" y1="3" x2="8" y2="6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="3" x2="16" y2="6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
          {/* Dot Grid */}
          <circle cx="9" cy="13" r="1.3" fill="#CBD5E1" />
          <circle cx="15" cy="13" r="1.3" fill="#CBD5E1" />
          <circle cx="9" cy="17" r="1.3" fill="#CBD5E1" />
          <circle cx="15" cy="17" r="2.2" fill="#2563EB" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span style={{
          fontSize,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          display: 'flex',
          alignItems: 'baseline',
        }}>
          calender<span style={{ color: '#2563EB' }}>.</span>
        </span>
      )}
    </div>
  );
};
