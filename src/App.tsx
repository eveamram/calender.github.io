import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CalendarView } from './components/calendar/CalendarView';
import { ClassesView } from './components/classes/ClassesView';
import { TodoView } from './components/todo/TodoView';
import { HabitsView } from './components/habits/HabitsView';
import { BooksView } from './components/books/BooksView';
import { CreationModalContainer } from './components/modals/CreationModalContainer';
import { SettingsModal } from './components/modals/SettingsModal';
import { CalendarEvent, ClassItem, BookItem, HabitItem, EventType } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, syncStatus } = useStore();

  const [activeModal, setActiveModal] = useState<
    'event' | 'class' | 'task' | 'habit' | 'book' | null
  >(null);

  const [initialModalDate, setInitialModalDate] = useState<string | undefined>(undefined);
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>(undefined);
  const [initialEventType, setInitialEventType] = useState<EventType | undefined>(undefined);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [classToEdit, setClassToEdit] = useState<ClassItem | null>(null);
  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<HabitItem | null>(null);
  const [initialClassDay, setInitialClassDay] = useState<number | undefined>(undefined);

  const handleOpenAddForTab = () => {
    setEventToEdit(null);
    setClassToEdit(null);
    setBookToEdit(null);
    setHabitToEdit(null);
    setInitialClassDay(undefined);
    setInitialEventType(undefined);
    setInitialStartTime(undefined);
    switch (activeTab) {
      case 'calendar':
        setActiveModal('event');
        break;
      case 'classes':
        setActiveModal('class');
        break;
      case 'todo':
        setActiveModal('task');
        break;
      case 'habits':
        setActiveModal('habit');
        break;
      case 'books':
        setActiveModal('book');
        break;
      default:
        setActiveModal('event');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-safe-bottom">
      {/* Header with Centered Top Add Button & Settings */}
      <Header onOpenAddModal={handleOpenAddForTab} />

      {/* Main Content Area */}
      <main className="flex-1 pb-28 lg:pb-8">
        {activeTab === 'calendar' && (
          <CalendarView
            onOpenAddModal={(date?: string, evtToEdit?: CalendarEvent, startTime?: string) => {
              setInitialModalDate(date);
              setInitialStartTime(evtToEdit ? undefined : startTime);
              setInitialEventType(undefined);
              setEventToEdit(evtToEdit || null);
              setActiveModal('event');
            }}
          />
        )}
        {activeTab === 'classes' && (
          <ClassesView
            onOpenAddClassModal={(day, clsToEdit) => {
              setInitialClassDay(day);
              setClassToEdit(clsToEdit || null);
              setActiveModal('class');
            }}
            onOpenAddExamModal={(exam) => {
              setInitialEventType('exam');
              setEventToEdit(exam || null);
              setActiveModal('event');
            }}
          />
        )}
        {activeTab === 'todo' && (
          <TodoView onOpenAddModal={() => setActiveModal('task')} />
        )}
        {activeTab === 'habits' && (
          <HabitsView
            onOpenAddModal={(habit) => {
              setHabitToEdit(habit || null);
              setActiveModal('habit');
            }}
          />
        )}
        {activeTab === 'books' && (
          <BooksView
            onOpenAddBookModal={(book) => {
              setBookToEdit(book || null);
              setActiveModal('book');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation with centered + Add button */}
      <MobileBottomNav onOpenAddModal={handleOpenAddForTab} />

      {/* Settings & Reset Modal */}
      <SettingsModal />

      {/* Creation / Edit Modal Container */}
      <CreationModalContainer
        modalType={activeModal}
        onClose={() => {
          setActiveModal(null);
          setInitialModalDate(undefined);
          setInitialStartTime(undefined);
          setInitialEventType(undefined);
          setEventToEdit(null);
          setClassToEdit(null);
          setBookToEdit(null);
          setHabitToEdit(null);
          setInitialClassDay(undefined);
        }}
        initialDate={initialModalDate}
        initialStartTime={initialStartTime}
        initialEventType={initialEventType}
        eventToEdit={eventToEdit}
        classToEdit={classToEdit}
        bookToEdit={bookToEdit}
        habitToEdit={habitToEdit}
        initialClassDay={initialClassDay}
      />
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <MainAppContent />
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
