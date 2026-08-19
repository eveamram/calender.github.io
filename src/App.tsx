import React, { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { CalendarView } from './components/CalendarView';
import { EmptyState } from './components/EmptyState';
import { EventModal } from './components/EventModal';
import { AuthModal } from './components/AuthModal';
import { CalendarEvent, NewCalendarEventPayload } from './types/event';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  const { displayName, isAnonymous, signInGoogle, signOut, updateCustomName } = useAuth();
  const {
    events,
    filteredEvents,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    seedSampleEvents,
  } = useEvents();

  // Modal State Controls
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialStart, setInitialStart] = useState<string | undefined>();
  const [initialEnd, setInitialEnd] = useState<string | undefined>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Compute category event counts for CategoryFilter component
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: events.length, Work: 0, Personal: 0, Meeting: 0, Other: 0 };
    events.forEach((evt) => {
      if (counts[evt.category] !== undefined) {
        counts[evt.category]++;
      }
    });
    return counts;
  }, [events]);

  // Event Action Handlers
  const handleOpenNewEventModal = () => {
    setSelectedEvent(null);
    setInitialStart(undefined);
    setInitialEnd(undefined);
    setIsEventModalOpen(true);
  };

  const handleSelectDateSlot = (start: string, end: string) => {
    setSelectedEvent(null);
    setInitialStart(start);
    setInitialEnd(end);
    setIsEventModalOpen(true);
  };

  const handleSelectEvent = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setIsEventModalOpen(true);
  };

  const handleSaveNewEvent = async (payload: NewCalendarEventPayload) => {
    await createEvent(payload);
    showToast(`Event "${payload.title}" created!`);
  };

  const handleUpdateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    await updateEvent(id, updates);
    showToast('Event updated successfully');
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    showToast('Event deleted', 'info');
  };

  const handleUpdateTimes = async (id: string, start: string, end: string) => {
    await updateEvent(id, { start, end });
    showToast('Event schedule updated');
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    await seedSampleEvents();
    setIsSeeding(false);
    showToast('Sample events added to calendar!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        displayName={displayName}
        isAnonymous={isAnonymous}
        onOpenNewEventModal={handleOpenNewEventModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSeedData={handleSeedData}
        onSignOut={signOut}
        isSeeding={isSeeding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notice */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleSeedData}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold"
            >
              Seed Local Demo
            </button>
          </div>
        )}

        {/* Filter Bar & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
          <div className="text-xs font-semibold text-slate-500 hidden md:block">
            Showing <span className="font-extrabold text-slate-800">{filteredEvents.length}</span> of{' '}
            <span className="font-extrabold text-slate-800">{events.length}</span> total events
          </div>
        </div>

        {/* Calendar Grid / Empty State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Syncing real-time Firestore events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            category={selectedCategory}
            onOpenCreate={handleOpenNewEventModal}
            onSeedData={handleSeedData}
          />
        ) : (
          <CalendarView
            events={filteredEvents}
            onSelectDate={handleSelectDateSlot}
            onSelectEvent={handleSelectEvent}
            onUpdateEventTimes={handleUpdateTimes}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toast.message}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveNewEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        selectedEvent={selectedEvent}
        initialStart={initialStart}
        initialEnd={initialEnd}
        currentUserName={displayName}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        displayName={displayName}
        isAnonymous={isAnonymous}
        onSignInGoogle={signInGoogle}
        onSignOut={signOut}
        onUpdateCustomName={updateCustomName}
      />
    </div>
  );
}

export default App;
