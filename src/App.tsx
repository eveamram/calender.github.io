import React, { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { CalendarView } from './components/CalendarView';
import { WeeklyClassScheduleView } from './components/schedule/WeeklyClassScheduleView';
import { EmptyState } from './components/EmptyState';
import { EventModal } from './components/EventModal';
import { CalendarEvent } from './types/event';
import { isGoogleSheetsConfigured } from './lib/googleSheets';
import { AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const auth = useAuth();
  const evts = useEvents();

  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule'>('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initStart, setInitStart] = useState<string | undefined>();
  const [initEnd, setInitEnd] = useState<string | undefined>();
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { All: evts.events.length, Work: 0, Personal: 0, Meeting: 0, Exam: 0, Other: 0 };
    evts.events.forEach((e) => {
      if (c[e.category] !== undefined) c[e.category]++;
    });
    return c;
  }, [evts.events]);

  // Handlers
  const openCreate = () => {
    setSelectedEvent(null);
    setInitStart(undefined);
    setInitEnd(undefined);
    setModalOpen(true);
  };

  const openCreateAt = (s: string, e: string) => {
    setSelectedEvent(null);
    setInitStart(s);
    setInitEnd(e);
    setModalOpen(true);
  };

  const openEdit = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setModalOpen(true);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await evts.seedSampleEvents(auth.displayName);
      showToast('Sample events added!');
    } catch {
      /* ignore */
    }
    setSeeding(false);
  };

  const handleUpdateTimes = async (id: string, start: string, end: string) => {
    const evt = evts.events.find((e) => e.id === id);
    if (!evt) return;
    try {
      await evts.updateEvent(id, evt.version, { start, end }, auth.displayName);
    } catch (err: any) {
      showToast('Error updating event times');
    }
  };

  const sheetsConnected = isGoogleSheetsConfigured();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        displayName={auth.displayName}
        isAnonymous={auth.isAnonymous}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEvent={openCreate}
        onSeedData={handleSeed}
        isSeeding={seeding}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {!sheetsConnected && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Google Sheets Database:</strong> Ready for setup. Paste your Apps Script Web App URL into <code>.env</code> to connect live sync across devices!
              </span>
            </div>
          </div>
        )}

        {evts.error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" /> {evts.error}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <CategoryFilter selected={evts.selectedCategory} onSelect={evts.setSelectedCategory} counts={categoryCounts} />
            <span className="text-xs font-semibold text-slate-500 hidden md:block">
              {evts.filteredEvents.length} of {evts.events.length} events
            </span>
          </div>
        )}

        {evts.loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 mt-3">Connecting to Google Sheet…</p>
          </div>
        ) : activeTab === 'schedule' ? (
          <WeeklyClassScheduleView
            events={evts.events}
            onSelectEvent={openEdit}
            onOpenAddEvent={openCreate}
          />
        ) : evts.filteredEvents.length === 0 ? (
          <EmptyState category={evts.selectedCategory} onOpenCreate={openCreate} onSeedData={handleSeed} />
        ) : (
          <CalendarView
            events={evts.filteredEvents}
            onSelectDate={openCreateAt}
            onSelectEvent={openEdit}
            onUpdateEventTimes={handleUpdateTimes}
          />
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
        onSave={async (p) => {
          await evts.createEvent(p);
          showToast('Event created!');
        }}
        onUpdate={async (id, v, u, by) => {
          await evts.updateEvent(id, v, u, by);
          showToast('Event updated!');
        }}
        onDelete={async (id, v) => {
          await evts.deleteEvent(id, v);
          showToast('Event deleted.');
        }}
        selectedEvent={selectedEvent}
        initialStart={initStart}
        initialEnd={initEnd}
        currentUserName={auth.displayName}
      />
    </div>
  );
}
