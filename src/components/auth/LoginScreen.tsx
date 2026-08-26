import React, { FormEvent, useState } from 'react';
import { Calendar, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type LoginState = 'idle' | 'sending' | 'sent' | 'error';

export const LoginScreen: React.FC = () => {
  const { signInWithMagicLink, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSending = state === 'sending';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || isSending) return;

    setState('sending');
    setErrorMessage(null);

    try {
      await signInWithMagicLink(trimmed);
      setState('sent');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : authError || 'Could not send a magic link. Please try again.';
      setErrorMessage(message);
      setState('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-200/90 via-pink-200/85 via-amber-100/90 to-yellow-100/90" />
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-purple-300/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-md w-full space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Calendar className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              calender<span className="text-pink-500">.</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Sign in to the household calendar
            </p>
          </div>
        </div>

        {state === 'sent' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Check your email</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                We sent a magic link to {email.trim() || 'your inbox'}. Open it on this device to
                finish signing in.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-slate-600">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSending}
                  placeholder="you@email.com"
                  className="w-full text-base font-medium pl-10 pr-3 py-2.5 border border-slate-200 rounded-2xl bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>

            {(state === 'error' || errorMessage) && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-rose-700">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !email.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-2xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send magic link'
              )}
            </button>
          </form>
        )}

        {state === 'sent' && (
          <button
            type="button"
            onClick={() => {
              setState('idle');
              setErrorMessage(null);
            }}
            className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Use a different email
          </button>
        )}

        <p className="text-[11px] leading-relaxed text-slate-500 font-medium text-center">
          Household members only. After the first deploy, Eve signs in with her invite, then
          invite Abbie from the Supabase dashboard using her real email.
        </p>
      </div>
    </div>
  );
};
