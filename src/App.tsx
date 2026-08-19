import React, { useState, useMemo } from 'react';
import { isFirebaseConfigured } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { CalendarView } from './components/CalendarView';
import { EmptyState } from './components/EmptyState';
import { EventModal } from './components/EventModal';
import { CalendarEvent } from './types/event';
import { AlertCircle, CheckCircle2, Flame } from 'lucide-react';

// =========================================================================
// Setup Screen — shown when Firebase env vars are missing
// =========================================================================
function SetupScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Firebase Not Configured</h1>
            <p className="text-sm text-slate-500 font-medium">One-time setup required</p>
          </div>
        </div>

        <div className="text-sm text-slate-700 space-y-3">
          <p>This app needs a Firebase project to store calendar events in a shared database. Without it, nothing is saved or shared.</p>

          <ol className="list-decimal list-inside space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a> → Create project</li>
            <li>Enable <strong>Firestore Database</strong> (start in test mode)</li>
            <li>Enable <strong>Authentication → Anonymous</strong></li>
            <li>Go to Project Settings → copy your web app config</li>
            <li>Create a <code className="bg-slate-200 px-1 rounded">.env</code> file in the project root:</li>
          </ol>

          <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto">
{`VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123`}
          </pre>

          <p className="text-xs text-slate-500">After creating <code>.env</code>, restart the dev server with <code>npm run dev</code>.</p>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Main App
// =========================================================================
export default function App() {
  // If Firebase isn't configured, show the setup instructions
  if (!isFirebaseConfigured) {
    return <SetupScreen />;
  }

  return <AppInner />;
}

function AppInner() {
  const auth = useAuth();
  const evts = useEvents();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initStart, setInitStart] = useState<string | undefined>();
  const [initEnd, setInitEnd] = useState<string | undefined>();
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { All: evts.events.length, Work: 0, Personal: 0, Meeting: 0, Other: 0 };
    evts.events.forEach((e) => { if (c[e.category] !== undefined) c[e.category]++; });
    return c;
  }, [evts.events]);

  // Handlers
  const openCreate = () => { setSelectedEvent(null); setInitStart(undefined); setInitEnd(undefined); setModalOpen(true); };
  const openCreateAt = (s: string, e: string) => { setSelectedEvent(null); setInitStart(s); setInitEnd(e); setModalOpen(true); };
  const openEdit = (evt: CalendarEvent) => { setSelectedEvent(evt); setModalOpen(true); };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await evts.seedSampleEvents(auth.displayName);
      showToast('Sample events added!');
    } catch { /* ignore */ }
    setSeeding(false);
  };

  const handleUpdateTimes = async (id: string, start: string, end: string) => {
    const evt = evts.events.find((e) => e.id === id);
    if (!evt) return;
    try {
      await evts.updateEvent(id, evt.version, { start, end }, auth.displayName);
    } catch (err: any) {
      if (err.name === 'ConflictError') showToast('⚠️ Conflict — event was changed by someone else. Drag reverted.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        displayName={auth.displayName}
        isAnonymous={auth.isAnonymous}
        onOpenNewEvent={openCreate}
        onSeedData={handleSeed}
        isSeeding={seeding}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {evts.error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" /> {evts.error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <CategoryFilter selected={evts.selectedCategory} onSelect={evts.setSelectedCategory} counts={categoryCounts} />
          <span className="text-xs font-semibold text-slate-500 hidden md:block">
            {evts.filteredEvents.length} of {evts.events.length} events
          </span>
        </div>

        {evts.loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 mt-3">Connecting to Firestore…</p>
          </div>
        ) : evts.filteredEvents.length === 0 ? (
          <EmptyState category={evts.selectedCategory} onOpenCreate={openCreate} onSeedData={handleSeed} />
        ) : (
          <CalendarView events={evts.filteredEvents} onSelectDate={openCreateAt} onSelectEvent={openEdit} onUpdateEventTimes={handleUpdateTimes} />
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
          </div>
        </div>
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (p) => { await evts.createEvent(p); showToast('Event created!'); }}
        onUpdate={async (id, v, u, by) => { await evts.updateEvent(id, v, u, by); showToast('Event updated!'); }}
        onDelete={async (id, v) => { await evts.deleteEvent(id, v); showToast('Event deleted.'); }}
        selectedEvent={selectedEvent}
        initialStart={initStart}
        initialEnd={initEnd}
        currentUserName={auth.displayName}
      />
    </div>
  );
}
