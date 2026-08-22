import React from 'react';
import { AlertTriangle, RefreshCw, CloudOff } from 'lucide-react';
import { getSupabaseConfigStatus } from '../../lib/supabase';

interface ConnectionErrorBannerProps {
  errorDetails?: string;
  onRetry?: () => void;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({
  errorDetails,
  onRetry,
}) => {
  const status = getSupabaseConfigStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <CloudOff className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Database Connection Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {errorDetails || status.message}
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 text-left text-xs space-y-1.5 font-medium text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Single Source of Truth Protection</span>
          </div>
          <p className="text-[11px] text-rose-700/90 leading-snug">
            To prevent data loss or out-of-sync devices, local-only data fallback is disabled. All clients must connect to the shared Supabase Cloud database.
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
};
