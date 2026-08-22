import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, CloudOff, Database, Check } from 'lucide-react';
import { getSupabaseConfigStatus, supabaseUrl as currentUrl, supabaseAnonKey as currentKey } from '../../lib/supabase';

interface ConnectionErrorBannerProps {
  errorDetails?: string;
  onRetry?: () => void;
}

export const ConnectionErrorBanner: React.FC<ConnectionErrorBannerProps> = ({
  errorDetails,
  onRetry,
}) => {
  const status = getSupabaseConfigStatus();
  const [url, setUrl] = useState(currentUrl || '');
  const [key, setKey] = useState(currentKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;
    try {
      localStorage.setItem('calender_supabase_url', url.trim());
      localStorage.setItem('calender_supabase_key', key.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Failed to save credentials:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl space-y-5 text-center my-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <CloudOff className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Shared Supabase Cloud Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {errorDetails || status.message}
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 text-left text-xs space-y-1.5 font-medium text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Single Source of Truth Active</span>
          </div>
          <p className="text-[11px] text-rose-700/90 leading-snug">
            To guarantee every device sees the exact same calendar & reading sanctuary, local-only offline mode is disabled. Please enter your Supabase Cloud credentials below:
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveCredentials} className="space-y-3 text-left pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer mt-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Connected! Reloading...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Connect Shared Supabase Cloud</span>
              </>
            )}
          </button>
        </form>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Check Connection Status</span>
          </button>
        )}
      </div>
    </div>
  );
};
