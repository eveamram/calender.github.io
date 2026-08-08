import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Header } from './components/layout/Header';
import { MinimalCalendar } from './components/calendar/MinimalCalendar';
import { SelectedDaySchedule } from './components/schedule/SelectedDaySchedule';
import { WeeklyClassScheduleView } from './components/schedule/WeeklyClassScheduleView';
import { PersonCustomizeModal } from './components/auth/PersonCustomizeModal';
import { EventFormModal } from './components/events/EventFormModal';
import { EventDetailsModal } from './components/events/EventDetailsModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { ToastContainer } from './components/ui/ToastContainer';
import { CalendarEvent } from './types';

const MainAppContent: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { loading: calLoading, deleteEvent } = useCalendar();

  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule'>('calendar');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const handleSelectEvent = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
  };

  const handleEditEvent = (evt: CalendarEvent) => {
    setSelectedEvent(null);
    setEventToEdit(evt);
    setIsAddModalOpen(true);
  };

  const handleDeleteRequest = (eventId: string) => {
    setSelectedEvent(null);
    setDeletingEventId(eventId);
  };

  const confirmDelete = async () => {
    if (deletingEventId) {
      await deleteEvent(deletingEventId);
      setDeletingEventId(null);
    }
  };

  if (authLoading || calLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid var(--border-color)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenAddEvent={() => {
          setEventToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '1.5rem',
        flex: 1,
      }}>
        {activeTab === 'calendar' ? (
          /* Pure 2-Column Layout: Left Calendar of Important Dates (70-75%), Right Schedule (25-30%) */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '1.5rem',
            alignItems: 'start',
          }} className="pure-calendar-grid">
            {/* Left: Main Monthly Calendar of Important Dates */}
            <MinimalCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectEvent={handleSelectEvent}
              onOpenAddEvent={() => {
                setEventToEdit(null);
                setIsAddModalOpen(true);
              }}
            />

            {/* Right: Selected Day's Schedule */}
            <SelectedDaySchedule
              selectedDate={selectedDate}
              onSelectEvent={handleSelectEvent}
              onOpenAddEvent={() => {
                setEventToEdit(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        ) : (
          /* Separate Dedicated Class Schedule View */
          <WeeklyClassScheduleView
            onSelectEvent={handleSelectEvent}
            onOpenAddEvent={() => {
              setEventToEdit(null);
              setIsAddModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <PersonCustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />

      <EventFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialDate={selectedDate}
        eventToEdit={eventToEdit}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
        onDeleteRequest={handleDeleteRequest}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEventId)}
        title="Delete Event?"
        message="Are you sure you want to delete this event?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingEventId(null)}
      />

      <ToastContainer />

      <style>{`
        @media (max-width: 900px) {
          .pure-calendar-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <MainAppContent />
      </CalendarProvider>
    </AuthProvider>
  );
}
