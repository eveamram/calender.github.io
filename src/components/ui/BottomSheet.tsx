import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, footer }) => {
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
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/50 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-t-[28px] sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] shadow-2xl border border-slate-200/80 animate-slide-up w-full max-w-lg mx-auto flex flex-col z-10 overflow-hidden"
      >
        {/* Mobile Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden cursor-pointer shrink-0" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer Action Bar */}
        {footer && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
