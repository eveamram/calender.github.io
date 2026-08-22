import React from 'react';
import { RefreshCw, CloudOff } from 'lucide-react';

interface ConnectionErrorBannerProps {
  errorDetails?: string;
  onRetry?: () => void;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({
  errorDetails,
  onRetry,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl space-y-5 text-center my-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <CloudOff className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Connecting to Shared Database...
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {errorDetails || 'Re-establishing live cloud data sync. Please check your internet connection.'}
          </p>
        </div>

        <button
          onClick={onRetry || (() => window.location.reload())}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
