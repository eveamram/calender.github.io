import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProfilePersona } from '../../types';
import {
  Settings,
  X,
  Palette,
  CheckCircle2,
  Clock,
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
    timeFormats,
    setTimeFormat,
  } = useStore();

  const [colorPickerTarget, setColorPickerTarget] = useState<ProfilePersona | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const profiles: ProfilePersona[] = ['Eve', 'Abbie', 'Both'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsSettingsOpen(false)}
      />
      <div className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">App Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Manage persona themes and app customization</p>
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
                    onClick={() => setColorPickerTarget(p)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Change Color
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clock Format Preference Section */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            Time Format Preference (12-Hour vs 24-Hour)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {profiles.map((p) => {
              const currentFmt = timeFormats[p] || '12h';

              return (
                <div
                  key={p}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60"
                >
                  <span className="text-xs font-bold text-slate-900">{p}</span>

                  <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl">
                    <button
                      onClick={() => {
                        setTimeFormat(p, '12h');
                        showToast(`${p}'s clock format set to 12-Hour (AM/PM)`);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        currentFmt === '12h'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      12-Hr
                    </button>
                    <button
                      onClick={() => {
                        setTimeFormat(p, '24h');
                        showToast(`${p}'s clock format set to 24-Hour (14:00)`);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        currentFmt === '24h'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      24-Hr
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
                if (window.confirm("Reset all stored holidays & anniversary custom entries?")) {
                  await clearAnniversariesOnly();
                  showToast("Holidays & Anniversaries reset to defaults!");
                }
              }}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold px-4 py-2 rounded-2xl text-xs transition-colors cursor-pointer shrink-0"
            >
              Reset Holidays 💕
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
                if (window.confirm("Clear all calendar events except holidays & anniversaries?")) {
                  await clearCalendarEventsExceptAnniversaries();
                  showToast("Events cleared! Holidays & anniversaries preserved.");
                }
              }}
              className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold px-4 py-2 rounded-2xl text-xs transition-colors cursor-pointer shrink-0"
            >
              Reset Except Holidays
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Reset All App Data
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Clear stored calendar events and restore initial app state.
              </p>
            </div>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to reset all app calendar data and restore defaults?")) {
                  await factoryResetAllData();
                  showToast("App data has been reset to defaults!");
                }
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold px-4 py-2 rounded-2xl text-xs transition-colors cursor-pointer shrink-0"
            >
              Reset All Data
            </button>
          </div>
        </div>

      </div>

      {/* PERSONA COLOR PICKER MODAL OVERLAY */}
      {colorPickerTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Color for {colorPickerTarget}
                </h3>
              </div>
              <button
                onClick={() => setColorPickerTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Choose a signature persona color for {colorPickerTarget}:
            </p>

            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {PERSONA_COLORS.map((c) => (
                <button
                  key={c.label}
                  onClick={async () => {
                    await setProfileColor(colorPickerTarget, c.hex);
                    setColorPickerTarget(null);
                    showToast(`Updated color for ${colorPickerTarget}`);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 transition-all gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <div
                    className="w-6 h-6 rounded-full border border-slate-300/50 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px] text-slate-700">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

