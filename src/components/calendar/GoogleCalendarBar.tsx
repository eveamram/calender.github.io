import React from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const GoogleCalendarBar: React.FC = () => {
  const {
    googleConfig,
    googleSyncing,
    setIsSettingsOpen,
    syncGoogleCalendars,
  } = useStore();

  const connected = googleConfig.calendars.some((cal) => cal.enabled);
  const lastSynced = googleConfig.lastSyncedAt
    ? new Date(googleConfig.lastSyncedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-[#e8f0fe] px-3.5 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#4285F4] shrink-0 border border-blue-100">
        <CalendarDays className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-900 tracking-tight">Google Calendar</p>
        <p className="text-[11px] font-medium text-slate-600 truncate">
          {googleSyncing
            ? 'Syncing…'
            : connected
              ? lastSynced
                ? `Last synced ${lastSynced}`
                : 'Connected — tap Sync to pull events'
              : 'Connect to show your Google events here'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {connected && (
          <button
            type="button"
            onClick={() => void syncGoogleCalendars({ interactive: true })}
            disabled={googleSyncing}
            className="inline-flex items-center gap-1 bg-white hover:bg-blue-50 text-[#4285F4] font-extrabold px-3 py-2 rounded-xl text-xs border border-blue-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${googleSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem('calender_open_google_settings', '1');
            setIsSettingsOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-2 rounded-xl text-xs cursor-pointer"
        >
          {connected ? 'Manage' : 'Connect'}
        </button>
      </div>
    </div>
  );
};
