import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeEmoji?: string;
  isRedHeader?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  isRedHeader,
  children,
  footer,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Floating Centered Sheet Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-[32px] shadow-2xl border animate-slide-up flex flex-col z-10 overflow-hidden w-[calc(100%-40px)] sm:w-[350px] max-w-[350px] mx-auto my-auto max-h-[90vh] shrink-0 ${
          isRedHeader ? 'border-red-200' : 'border-slate-100'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Mobile Drag Handle Bar */}
        <div className="pt-2.5 pb-1 flex justify-center cursor-pointer shrink-0" onClick={onClose}>
          <div className={`w-9 h-1 rounded-full transition-colors ${isRedHeader ? 'bg-red-300' : 'bg-slate-300/90'}`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 pt-1 pb-3 shrink-0 ${isRedHeader ? 'bg-red-50/40 border-b border-red-100/60' : ''}`}>
          <h3 className={`text-xl font-bold tracking-tight truncate ${isRedHeader ? 'text-red-950' : 'text-slate-900'}`}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0 no-scrollbar">
          {children}
        </div>

        {/* Footer if provided */}
        {footer && (
          <div className="px-5 py-3 border-t border-slate-100 bg-white shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

