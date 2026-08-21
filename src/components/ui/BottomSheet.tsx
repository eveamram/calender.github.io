import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/40 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* Modal Dialog Content - Always docked at bottom of screen on phone */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200/80 animate-slide-up w-full max-w-lg mx-auto p-5 sm:p-6 pb-20 sm:pb-6 z-10">
        {/* Mobile Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300/80 rounded-full mx-auto mb-4 sm:hidden cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
