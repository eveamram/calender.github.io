import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeEmoji?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeEmoji,
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
        className="relative bg-white rounded-t-[28px] sm:rounded-3xl max-h-[75vh] sm:max-h-[85vh] shadow-2xl border border-slate-200/80 animate-slide-up w-full max-w-lg mx-auto flex flex-col z-10 overflow-hidden"
      >
        {/* Mobile Drag Handle Bar */}
        <div className="pt-2 pb-1 flex justify-center sm:hidden cursor-pointer shrink-0" onClick={onClose}>
          <div className="w-10 h-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            {badgeEmoji && (
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm shadow-2xs shrink-0">
                {badgeEmoji}
              </span>
            )}
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">{title}</h3>
              {subtitle && <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">{children}</div>

        {/* Optional Sticky Footer Action Bar */}
        {footer && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/95 backdrop-blur-xs shrink-0 pb-5 sm:pb-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
