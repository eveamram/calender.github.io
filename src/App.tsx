import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Header } from './components/layout/Header';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MonthGrid } from './components/calendar/MonthGrid';
import { SelectedDaySchedule } from './components/schedule/SelectedDaySchedule';
import { WeeklyClassScheduleView } from './components/schedule/WeeklyClassScheduleView';
import { TodoListView } from './components/todo/TodoListView';
import { HabitsView } from './components/habits/HabitsView';
import { GroceryView } from './components/grocery/GroceryView';
import { MealsView } from './components/meals/MealsView';
import { BooksView } from './components/books/BooksView';
import { NotesView } from './components/notes/NotesView';
import { EventFormModal } from './components/events/EventFormModal';
import { EventDetailsModal } from './components/events/EventDetailsModal';
import { PersonCustomizeModal } from './components/auth/PersonCustomizeModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { AppTab, CalendarEvent } from './types';

function AtlasAppContent() {
  const { currentDate, setCurrentDate } = useCalendar();
  const [activeTab, setActiveTab] = useState<AppTab>('calendar');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleOpenAddEvent = () => {
    setSelectedEvent(null);
    setIsEventFormOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddEvent={handleOpenAddEvent}
          onOpenPersonModal={() => setIsPersonModalOpen(true)}
        />
      </div>

      {/* Mobile Header */}
      <div className="block md:hidden">
        <MobileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDate={selectedDate}
          onOpenAddModal={handleOpenAddEvent}
        />
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.25rem' }}>
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <MonthGrid
                onSelectEvent={handleSelectEvent}
                onSelectDate={handleSelectDate}
              />
            </div>
            <div className="lg:col-span-4">
              <SelectedDaySchedule
                selectedDate={selectedDate}
                onSelectEvent={handleSelectEvent}
                onOpenAddEvent={handleOpenAddEvent}
              />
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <WeeklyClassScheduleView
            onSelectEvent={(evt: any) => handleSelectEvent(evt)}
            onOpenAddEvent={handleOpenAddEvent}
          />
        )}

        {activeTab === 'todo' && (
          <TodoListView
            onOpenAddEvent={handleOpenAddEvent}
            onEditTask={(evt) => handleSelectEvent(evt)}
          />
        )}

        {activeTab === 'habits' && <HabitsView />}
        {activeTab === 'grocery' && <GroceryView />}
        {activeTab === 'meals' && <MealsView />}
        {activeTab === 'books' && <BooksView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddEvent}
      />

      {/* Modals */}
      <EventFormModal
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        initialDate={selectedDate}
      />

      {selectedEvent && (
        <EventDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          event={selectedEvent}
          onEdit={(evt) => {
            setIsDetailsOpen(false);
            setSelectedEvent(evt);
            setIsEventFormOpen(true);
          }}
        />
      )}

      <PersonCustomizeModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <AtlasAppContent />
      </CalendarProvider>
    </AuthProvider>
  );
}
