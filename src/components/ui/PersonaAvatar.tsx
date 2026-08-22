import React from 'react';

interface PersonaAvatarProps {
  person: 'Eve' | 'Abbie' | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PersonaAvatar: React.FC<PersonaAvatarProps> = ({ person, size = 'md', className = '' }) => {
  const isEve = person === 'Eve';
  const isAbbie = person === 'Abbie';

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  // Eve: White girl with gorgeous long curly dark brown hair
  if (isEve) {
    return (
      <div
        className={`rounded-full bg-amber-100/90 border border-purple-300 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
        title="Eve (Long Curly Dark Brown Hair)"
      >
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          {/* Background */}
          <circle cx="18" cy="18" r="18" fill="#FCE7F3" />

          {/* Full Back Curly Hair Volume */}
          <circle cx="11" cy="13" r="6" fill="#3D2314" />
          <circle cx="25" cy="13" r="6" fill="#3D2314" />
          <circle cx="8" cy="19" r="5.5" fill="#3D2314" />
          <circle cx="28" cy="19" r="5.5" fill="#3D2314" />
          <circle cx="9" cy="26" r="5" fill="#3D2314" />
          <circle cx="27" cy="26" r="5" fill="#3D2314" />
          <circle cx="11" cy="32" r="4.5" fill="#3D2314" />
          <circle cx="25" cy="32" r="4.5" fill="#3D2314" />

          {/* Face Skin */}
          <circle cx="18" cy="18" r="9.5" fill="#FDE2D4" />

          {/* Full Crown & Curly Front Bangs */}
          <path d="M7 16 C7 6, 29 6, 29 16 C27 11, 23 10, 18 12 C13 10, 9 11, 7 16 Z" fill="#3D2314" />
          <circle cx="12" cy="10" r="5" fill="#3D2314" />
          <circle cx="18" cy="9" r="5.5" fill="#3D2314" />
          <circle cx="24" cy="10" r="5" fill="#3D2314" />
          <circle cx="14" cy="13" r="3" fill="#3D2314" />
          <circle cx="22" cy="13" r="3" fill="#3D2314" />

          {/* Eyes */}
          <circle cx="14.5" cy="18" r="1.2" fill="#2E1C0C" />
          <circle cx="21.5" cy="18" r="1.2" fill="#2E1C0C" />

          {/* Rosy Cheeks */}
          <circle cx="13" cy="20.5" r="1.5" fill="#F472B6" opacity="0.5" />
          <circle cx="23" cy="20.5" r="1.5" fill="#F472B6" opacity="0.5" />

          {/* Smile */}
          <path d="M15.5 22 C16.5 23.5, 19.5 23.5, 20.5 22" stroke="#3D2314" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Abbie: White girl with gorgeous long straight light brown hair
  if (isAbbie) {
    return (
      <div
        className={`rounded-full bg-rose-100/90 border border-rose-300 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
        title="Abbie (Long Straight Light Brown Hair)"
      >
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          {/* Background */}
          <circle cx="18" cy="18" r="18" fill="#FFE4E6" />

          {/* Full Back & Side Hair Flowing Way Past Shoulders */}
          <path d="M6 14 C6 4, 30 4, 30 14 L31 36 L23 36 L23 18 L13 18 L13 36 L5 36 Z" fill="#8C6239" />

          {/* Face Skin */}
          <circle cx="18" cy="18" r="9.5" fill="#FDE2D4" />

          {/* Complete Top Crown & Straight Side Bangs */}
          <path d="M6 14 C6 5, 30 5, 30 14 C27 9, 21 8, 18 12 C15 8, 9 9, 6 14 Z" fill="#8C6239" />
          <path d="M10 14 C12 9, 18 8, 18 13 L11 16 Z" fill="#75502C" />
          <path d="M26 14 C24 9, 18 8, 18 13 L25 16 Z" fill="#75502C" />

          {/* Eyes */}
          <circle cx="14.5" cy="18" r="1.2" fill="#2E1C0C" />
          <circle cx="21.5" cy="18" r="1.2" fill="#2E1C0C" />

          {/* Rosy Cheeks */}
          <circle cx="13" cy="20.5" r="1.5" fill="#FB7185" opacity="0.5" />
          <circle cx="23" cy="20.5" r="1.5" fill="#FB7185" opacity="0.5" />

          {/* Smile */}
          <path d="M15.5 22 C16.5 23.5, 19.5 23.5, 20.5 22" stroke="#75502C" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Fallback for Both / Shared
  return (
    <div className={`rounded-full bg-purple-100 border border-purple-300 text-purple-900 font-extrabold flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
      👥
    </div>
  );
};

export default PersonaAvatar;
