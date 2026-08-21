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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* Sheet Content */}
      <div className="relative bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-slate-200 animate-slide-up w-full max-w-xl mx-auto p-5 sm:p-6 pb- safe-bottom">
        {/* Drag Pill */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
