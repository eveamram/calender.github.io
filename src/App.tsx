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

import { useIsMobile } from './hooks/useIsMobile';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { GroceryView } from './components/grocery/GroceryView';
import { MealsView } from './components/meals/MealsView';

type AppTab = 'calendar' | 'schedule' | 'todo' | 'habits' | 'grocery' | 'meals';

function MainAppContent() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<AppTab>('calendar');
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
      {/* Header Navigation: Desktop Header vs Mobile Compact Header */}
      {isMobile ? (
        <MobileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDate={selectedDate}
          onOpenAddModal={() => handleOpenAddModal(activeTab === 'schedule' ? 'class' : activeTab === 'todo' ? 'task' : 'personal')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddEvent={() => handleOpenAddModal(activeTab === 'schedule' ? 'class' : activeTab === 'todo' ? 'task' : 'personal')}
          onOpenPersonModal={() => setIsSettingsOpen(true)}
        />
      )}

      <main style={{
        flex: 1,
        padding: isMobile ? '0.85rem 0.85rem 5rem 0.85rem' : '1.25rem 1rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
      }}>
        {activeTab === 'calendar' ? (
          /* Calendar View */
          <div className="calendar-grid-layout" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              alignItems: 'start',
            }}>
              <div style={{ flex: '1 1 340px', minWidth: 0 }}>
                <MinimalCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSelectEvent={(evt) => setSelectedDetailsEvent(evt)}
                  onOpenAddEvent={() => handleOpenAddModal('personal')}
                />
              </div>

              <div style={{ flex: isMobile ? '1 1 100%' : '0 0 auto', width: isMobile ? '100%' : '380px' }}>
                <SelectedDaySchedule
                  selectedDate={selectedDate}
                  onSelectEvent={(evt) => setSelectedDetailsEvent(evt)}
                  onOpenAddEvent={() => handleOpenAddModal('personal')}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'schedule' ? (
          /* Dedicated Class Timetable View */
          <WeeklyClassScheduleView
            onSelectEvent={(evt) => setSelectedDetailsEvent(evt)}
            onOpenAddEvent={() => handleOpenAddModal('class')}
          />
        ) : activeTab === 'todo' ? (
          /* Personal To-Do Lists */
          <TodoListView
            onOpenAddEvent={() => handleOpenAddModal('task')}
            onEditTask={(task) => handleOpenEditModal(task)}
          />
        ) : activeTab === 'habits' ? (
          /* Daily Habits Tracker */
          <HabitsView />
        ) : activeTab === 'grocery' ? (
          /* Mobile Grocery List */
          <GroceryView />
        ) : (
          /* Mobile Meal Planner */
          <MealsView />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => handleOpenAddModal(activeTab === 'schedule' ? 'class' : activeTab === 'todo' ? 'task' : 'personal')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

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
