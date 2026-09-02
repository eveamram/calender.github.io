import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProfilePersona } from '../../types';
import { envGoogleClientId, resolvedGoogleClientId } from '../../lib/googleCalendar';
import {
  Settings,
  X,
  Palette,
  CheckCircle2,
  Cloud,
  RefreshCw,
  Database,
  CalendarDays,
  Upload,
  Copy,
} from 'lucide-react';
const PERSONA_COLORS = [
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Vibrant Pink', hex: '#ec4899' },
  { label: 'Purple', hex: '#7c3aed' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Rose', hex: '#e11d48' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Cyan', hex: '#0891b2' },
  { label: 'Indigo', hex: '#4f46e5' },
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    profileColors,
    setProfileColor,
    factoryResetAllData,
    clearAnniversariesOnly,
    clearCalendarEventsExceptAnniversaries,
    syncStatus,
    googleConfig,
    googleSyncing,
    googleSyncError,
    setGoogleClientId,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    updateGoogleCalendarLink,
    syncGoogleCalendars,
    importIcsFile,
    activeProfile,
  } = useStore();


  const [colorPickerTarget, setColorPickerTarget] = useState<ProfilePersona | null>(null);
  const [customHex, setCustomHex] = useState<string>('#2563eb');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [confirmResetHolidays, setConfirmResetHolidays] = useState(false);
  const [confirmResetEvents, setConfirmResetEvents] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [clientIdDraft, setClientIdDraft] = useState(() => resolvedGoogleClientId(googleConfig));
  const [showGoogleSetup, setShowGoogleSetup] = useState(() => !resolvedGoogleClientId(googleConfig));
  const icsInputRef = useRef<HTMLInputElement>(null);
  const googleConnected = googleConfig.calendars.length > 0;
  const googleOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (!isSettingsOpen) return;
    if (sessionStorage.getItem('calender_open_google_settings') !== '1') return;
    sessionStorage.removeItem('calender_open_google_settings');
    window.setTimeout(() => {
      document.getElementById('google-calendar-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenColorPicker = (p: ProfilePersona) => {
    const existing = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');
    setCustomHex(existing);
    setColorPickerTarget(p);
  };

  const profiles: ProfilePersona[] = ['Eve', 'Abbie', 'Both'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsSettingsOpen(false)}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-6 animate-slide-up pb-20 sm:pb-6 z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">App Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Google Calendar sync, colors, and data</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-slide-down">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Color Customization Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-600" />
              Persona Badge Colors
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {profiles.map((p) => {
              const currentColor = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');

              return (
                <div
                  key={p}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs shrink-0"
                      style={{ backgroundColor: currentColor }}
                    />
                    <span className="text-xs font-bold text-slate-900">{p}</span>
                  </div>

                  <button
                    onClick={() => handleOpenColorPicker(p)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Change Color
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Calendar */}
        <div id="google-calendar-settings" className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                Google Calendar
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                One-way sync: Google events appear here. Already-entered events are not duplicated. Removing a Google event only deletes it from this calendar — Google is unchanged, and it stays gone after the next sync.
              </p>
            </div>
            {googleSyncing && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </span>
            )}
          </div>

          {googleSyncError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs font-bold text-rose-700">
              {googleSyncError}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowGoogleSetup((open) => !open)}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {showGoogleSetup ? 'Hide setup steps' : 'Show Google Cloud setup'}
          </button>

          {showGoogleSetup && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 font-medium">
                <li>
                  In{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Google Cloud Console
                  </a>
                  , enable the <span className="font-bold text-slate-800">Google Calendar API</span>.
                </li>
                <li>
                  Create an <span className="font-bold text-slate-800">OAuth client ID</span> of type{' '}
                  <span className="font-bold text-slate-800">Web application</span>.
                </li>
                <li>Add this JavaScript origin, then paste the Client ID below.</li>
              </ol>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 text-[11px] font-mono font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 truncate">
                  {googleOrigin}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(googleOrigin);
                      showToast('Copied site origin');
                    } catch {
                      showToast('Copy the origin from the box');
                    }
                  }}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
                  title="Copy origin"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={clientIdDraft}
                onChange={(e) => setClientIdDraft(e.target.value)}
                onBlur={() => setGoogleClientId(clientIdDraft)}
                placeholder="….apps.googleusercontent.com"
                className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-white"
              />
              {envGoogleClientId() && (
                <p className="text-[10px] text-slate-400 font-medium">
                  A Client ID is already built into this app. You can override it here.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {googleConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => void syncGoogleCalendars({ interactive: true })}
                  disabled={googleSyncing}
                  className="font-extrabold px-4 py-2 rounded-2xl text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer disabled:opacity-50"
                >
                  Sync now
                </button>
                <button
                  type="button"
                  onClick={() => void disconnectGoogleCalendar()}
                  disabled={googleSyncing}
                  className="font-extrabold px-4 py-2 rounded-2xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setGoogleClientId(clientIdDraft);
                  void connectGoogleCalendar();
                }}
                disabled={googleSyncing}
                className="font-extrabold px-4 py-2 rounded-2xl text-xs bg-slate-900 hover:bg-slate-800 text-white cursor-pointer disabled:opacity-50"
              >
                Connect Google Calendar
              </button>
            )}
            <button
              type="button"
              onClick={() => icsInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 font-extrabold px-4 py-2 rounded-2xl text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import .ics
            </button>
            <input
              ref={icsInputRef}
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  const text = await file.text();
                  const count = await importIcsFile(text, activeProfile === 'Both' ? 'Eve' : activeProfile);
                  showToast(count ? `Imported ${count} event${count === 1 ? '' : 's'} from ${file.name}` : 'No events found in that file');
                } catch {
                  showToast('Could not read that calendar file');
                }
              }}
            />
          </div>

          {googleConnected && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500">
                Signed in as {googleConfig.email || 'Google'}
                {googleConfig.lastSyncedAt
                  ? ` · Last synced ${new Date(googleConfig.lastSyncedAt).toLocaleString()}`
                  : ''}
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {googleConfig.calendars.map((cal) => (
                  <div
                    key={cal.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-slate-200 bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={cal.enabled}
                      onChange={(e) => void updateGoogleCalendarLink(cal.id, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: cal.backgroundColor || '#4285F4' }}
                    />
                    <span className="flex-1 text-xs font-bold text-slate-800 truncate" title={cal.summary}>
                      {cal.summary}
                    </span>
                    <select
                      value={cal.profile}
                      onChange={(e) =>
                        void updateGoogleCalendarLink(cal.id, { profile: e.target.value as ProfilePersona })
                      }
                      className="text-[11px] font-bold border border-slate-200 rounded-lg px-1.5 py-1 bg-slate-50 cursor-pointer"
                    >
                      <option value="Eve">Eve</option>
                      <option value="Abbie">Abbie</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Reset Section */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Reset Holidays & Anniversaries
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Clear custom anniversaries & holiday overrides to restore default calendar dates.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!confirmResetHolidays) {
                  setConfirmResetHolidays(true);
                  setTimeout(() => setConfirmResetHolidays(false), 4000);
                  return;
                }
                await clearAnniversariesOnly();
                setConfirmResetHolidays(false);
                showToast("Holidays & Anniversaries reset to defaults!");
              }}
              className={`font-extrabold px-4 py-2 rounded-2xl text-xs transition-all cursor-pointer shrink-0 shadow-xs ${
                confirmResetHolidays
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
              }`}
            >
              {confirmResetHolidays ? '⚠️ Are you sure? Click to confirm' : 'Reset Holidays 💕'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Reset Events (Keep Holidays & Anniversaries)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Clear all scheduled user events while preserving holidays & anniversaries.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!confirmResetEvents) {
                  setConfirmResetEvents(true);
                  setTimeout(() => setConfirmResetEvents(false), 4000);
                  return;
                }
                await clearCalendarEventsExceptAnniversaries();
                setConfirmResetEvents(false);
                showToast("Events cleared! Holidays & anniversaries preserved.");
              }}
              className={`font-extrabold px-4 py-2 rounded-2xl text-xs transition-all cursor-pointer shrink-0 shadow-xs ${
                confirmResetEvents
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
              }`}
            >
              {confirmResetEvents ? '⚠️ Are you sure? Click to confirm' : 'Reset Except Holidays'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100/60 space-y-2">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Clear this device
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Clears this browser&apos;s local cache only. Household data in the cloud is not deleted.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder='Type RESET'
                className="flex-1 text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl bg-white"
              />
              <button
                onClick={async () => {
                  if (resetConfirmText.trim() !== 'RESET') return;
                  await factoryResetAllData();
                  setResetConfirmText('');
                  showToast('This device cache was cleared. Cloud data is unchanged.');
                }}
                disabled={resetConfirmText.trim() !== 'RESET'}
                className="font-extrabold px-4 py-2 rounded-2xl text-xs shrink-0 shadow-xs bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Clear cache
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Synchronization Status Banner */}
        <div className="border-t border-slate-100 pt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Automatic Data Synchronization
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {syncStatus.isSyncing ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing...
                </span>
              ) : syncStatus.isConfigured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Cloud & Device Sync Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Automatic Local & Tab Sync Active
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            {syncStatus.isConfigured
              ? 'Your calendar, tasks, habits, and colors are automatically synchronized live across all your cloud devices.'
              : 'Automatic local state & multi-tab broadcast sync is active. Changes update seamlessly everywhere.'}
          </p>
        </div>

      </div>

      {/* PERSONA COLOR PICKER MODAL OVERLAY */}
      {colorPickerTarget && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Custom Color for {colorPickerTarget}
                </h3>
              </div>
              <button
                onClick={() => setColorPickerTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Color Wheel & Hex Section */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎨 Color Wheel Selector</span>
                </h4>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Full RGB Spectrum
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <label className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-300/80 shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform bg-gradient-to-tr from-red-500 via-green-500 via-blue-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-[14px] flex items-center justify-center bg-white/20 backdrop-blur-2xs">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-xs"
                      style={{ backgroundColor: customHex }}
                    />
                  </div>
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="absolute -inset-4 w-24 h-24 cursor-pointer opacity-0"
                    title="Tap to open full color wheel picker"
                  />
                </label>

                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Selected Hex Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      placeholder="#2563eb"
                      className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await setProfileColor(colorPickerTarget, customHex);
                    setColorPickerTarget(null);
                    showToast(`Set ${colorPickerTarget} color to ${customHex}`);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer self-end shrink-0 shadow-xs"
                >
                  Apply Color
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium italic">
                Tap the multi-color wheel icon above to open the visual color spectrum picker.
              </p>
            </div>

            {/* Preset Color Swatches */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Or Select From Preset Swatches
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {PERSONA_COLORS.map((c) => (
                  <button
                    key={c.label}
                    onClick={async () => {
                      await setProfileColor(colorPickerTarget, c.hex);
                      setColorPickerTarget(null);
                      showToast(`Updated color for ${colorPickerTarget} to ${c.label}`);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-slate-300/60 shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-slate-700 font-bold truncate w-full text-center">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

