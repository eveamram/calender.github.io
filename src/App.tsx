import React, { useState } from 'react';
import { CalendarProvider } from './context/CalendarContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { MinimalCalendar } from './components/calendar/MinimalCalendar';
import { SelectedDaySchedule } from './components/schedule/SelectedDaySchedule';
import { WeeklyClassScheduleView } from './components/schedule/WeeklyClassScheduleView';
import { TodoListView } from './components/todo/TodoListView';
import { HabitsView } from './components/habits/HabitsView';
import { EventFormModal } from './components/events/EventFormModal';
import { EventDetailsModal } from './components/events/EventDetailsModal';
import { PersonCustomizeModal } from './components/auth/PersonCustomizeModal';
import { CalendarEvent, EventType } from './types';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'todo' | 'habits'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState<EventType>('personal');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDetailsEvent, setSelectedDetailsEvent] = useState<CalendarEvent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenAddModal = (category: EventType = 'personal') => {
    setEditingEvent(null);
    setAddModalCategory(category);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setAddModalCategory(event.event_type as EventType);
    setIsAddModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Navigation: Calendar | Class Schedule | To-Do List | Habits */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddEvent={() => handleOpenAddModal(activeTab === 'schedule' ? 'class' : activeTab === 'todo' ? 'task' : 'personal')}
        onOpenPersonModal={() => setIsSettingsOpen(true)}
      />

      <main style={{ flex: 1, padding: '1.25rem 1rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'calendar' ? (
          /* Calendar View: 2-column Desktop (Left: Calendar 75%, Right: Schedule 25%) */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}>
            <div style={{ gridColumn: 'span 2' }}>
              <MinimalCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectEvent={(evt) => setSelectedDetailsEvent(evt)}
                onOpenAddEvent={() => handleOpenAddModal('personal')}
              />
            </div>

            <div style={{ minWidth: '300px' }}>
              <SelectedDaySchedule
                selectedDate={selectedDate}
                onSelectEvent={(evt) => setSelectedDetailsEvent(evt)}
                onOpenAddEvent={() => handleOpenAddModal('personal')}
              />
            </div>
          </div>
        ) : activeTab === 'schedule' ? (
          /* Dedicated Class Timetable View */
          <WeeklyClassScheduleView
            onSelectEvent={(evt) => setSelectedDetailsEvent(evt)}
            onOpenAddEvent={() => handleOpenAddModal('class')}
          />
        ) : activeTab === 'todo' ? (
          /* Personal To-Do Lists for Eve & Abbie */
          <TodoListView
            onOpenAddEvent={() => handleOpenAddModal('task')}
            onEditTask={(task) => handleOpenEditModal(task)}
          />
        ) : (
          /* Daily Habits Tracker based on Person */
          <HabitsView />
        )}
      </main>

      {/* Add / Edit Form Modal */}
      <EventFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEvent(null);
        }}
        initialDate={selectedDate}
        eventToEdit={editingEvent}
        defaultCategory={addModalCategory}
      />

      {/* Event Details View / Actions Modal */}
      <EventDetailsModal
        isOpen={!!selectedDetailsEvent}
        event={selectedDetailsEvent}
        onClose={() => setSelectedDetailsEvent(null)}
        onEdit={(evt) => {
          setSelectedDetailsEvent(null);
          handleOpenEditModal(evt);
        }}
      />

      {/* Settings & Profile Customization Modal */}
      <PersonCustomizeModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <MainAppContent />
      </CalendarProvider>
    </AuthProvider>
  );
}

export default App;
