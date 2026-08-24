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
  subtitle,
  badgeEmoji,
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
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Sheet Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-t-[28px] sm:rounded-3xl max-h-[85vh] sm:max-h-[90vh] shadow-2xl border animate-slide-up w-full max-w-lg mx-auto flex flex-col z-10 overflow-hidden ${
          isRedHeader ? 'border-red-200' : 'border-slate-200/80'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Mobile Drag Handle Bar */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden cursor-pointer shrink-0" onClick={onClose}>
          <div className={`w-12 h-1.5 rounded-full transition-colors ${isRedHeader ? 'bg-red-200 hover:bg-red-300' : 'bg-slate-300 hover:bg-slate-400'}`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between px-4 sm:px-5 py-3 border-b shrink-0 ${isRedHeader ? 'bg-red-50/50 border-red-100' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            {badgeEmoji && (
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs shrink-0 ${isRedHeader ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100'}`}>
                {badgeEmoji}
              </span>
            )}
            <div>
              <h3 className={`text-base font-black tracking-tight leading-snug ${isRedHeader ? 'text-red-950' : 'text-slate-900'}`}>{title}</h3>
              {subtitle && <p className={`text-[11px] font-medium leading-none mt-0.5 ${isRedHeader ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 min-h-[44px] min-w-[44px]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5 space-y-3 min-h-0">{children}</div>

        {/* Optional Sticky Footer Action Bar */}
        {footer && (
          <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/95 backdrop-blur-xs shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
