import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CalendarView } from './components/calendar/CalendarView';
import { AuthModal } from './components/auth/AuthModal';
import { CalendarJoinModal } from './components/auth/CalendarJoinModal';
import { EventFormModal } from './components/events/EventFormModal';
import { EventDetailsModal } from './components/events/EventDetailsModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { ToastContainer } from './components/ui/ToastContainer';
import { CalendarEvent } from './types';
import { Calendar as CalendarIcon, Plus, Filter, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const { activeCalendar, loading: calLoading, deleteEvent } = useCalendar();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<Date | undefined>(undefined);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const handleSelectDate = (date: Date) => {
    setSelectedDateForNewEvent(date);
    setEventToEdit(null);
    setIsAddModalOpen(true);
  };

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
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading calender...</p>
      </div>
    );
  }

  const showAuthModal = !userProfile;
  const showJoinModal = Boolean(userProfile && !activeCalendar);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      <Header
        onOpenAddEvent={() => {
          setEventToEdit(null);
          setSelectedDateForNewEvent(new Date());
          setIsAddModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '1rem',
        flex: 1,
      }}>
        {/* Responsive 2-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 280px) 1fr',
          gap: '1.25rem',
        }} className="main-layout-grid">
          {/* Sidebar */}
          <div className="sidebar-container">
            <Sidebar />
          </div>

          {/* Main Calendar */}
          <div style={{ width: '100%' }}>
            <CalendarView
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
              onOpenAddEvent={() => {
                setEventToEdit(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar for Smartphones */}
      <div className="mobile-bottom-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 9900,
        boxShadow: 'var(--shadow-lg)',
      }}>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: 'var(--accent-primary)',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <CalendarIcon size={20} />
          Calendar
        </button>

        <button
          type="button"
          onClick={() => {
            setEventToEdit(null);
            setSelectedDateForNewEvent(new Date());
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary"
          style={{
            borderRadius: '999px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.85rem',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}
        >
          <Plus size={18} /> Add Event
        </button>

        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: 'var(--text-secondary)',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Mobile Sidebar Modal Drawer */}
      {isMobileSidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-start',
        }}>
          <div style={{
            maxWidth: '310px',
            width: '85%',
            height: '100%',
            backgroundColor: 'var(--bg-card)',
            padding: '1.25rem',
            overflowY: 'auto',
            position: 'relative',
          }}>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} />
      <CalendarJoinModal isOpen={showJoinModal} />

      <EventFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialDate={selectedDateForNewEvent}
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
        message="Are you sure you want to delete this event from the shared calendar?"
        confirmText="Delete Event"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingEventId(null)}
      />

      <ToastContainer />

      <style>{`
        @media (max-width: 900px) {
          .main-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .sidebar-container {
            display: none !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-bottom-bar {
            display: none !important;
          }
          body {
            padding-bottom: 0 !important;
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
