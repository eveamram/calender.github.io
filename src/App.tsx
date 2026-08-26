import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CalendarView } from './components/calendar/CalendarView';
import { ClassesView } from './components/classes/ClassesView';
import { TodoView } from './components/todo/TodoView';
import { HabitsView } from './components/habits/HabitsView';
import { MealsView } from './components/meals/MealsView';
import { BooksView } from './components/books/BooksView';
import { CreationModalContainer } from './components/modals/CreationModalContainer';
import { SettingsModal } from './components/modals/SettingsModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { MealType, CalendarEvent, ClassItem, BookItem, HabitItem, EventType } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, syncStatus } = useStore();

  const [activeModal, setActiveModal] = useState<
    'event' | 'class' | 'task' | 'habit' | 'meal' | 'book' | null
  >(null);

  const [initialModalDate, setInitialModalDate] = useState<string | undefined>(undefined);
  const [initialEventType, setInitialEventType] = useState<EventType | undefined>(undefined);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [classToEdit, setClassToEdit] = useState<ClassItem | null>(null);
  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<HabitItem | null>(null);
  const [initialMealDay, setInitialMealDay] = useState<number | undefined>(undefined);
  const [initialMealType, setInitialMealType] = useState<MealType | undefined>(undefined);
  const [initialClassDay, setInitialClassDay] = useState<number | undefined>(undefined);

  const handleOpenAddForTab = () => {
    setEventToEdit(null);
    setClassToEdit(null);
    setBookToEdit(null);
    setHabitToEdit(null);
    setInitialClassDay(undefined);
    setInitialEventType(undefined);
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
      case 'meals':
        setActiveModal('meal');
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
            onOpenAddModal={(date?: string, evtToEdit?: CalendarEvent) => {
              setInitialModalDate(date);
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
            onOpenAddExamModal={() => {
              setInitialEventType('exam');
              setEventToEdit(null);
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
        {activeTab === 'meals' && (
          <MealsView
            onOpenAddMealModal={(day, type) => {
              setInitialMealDay(day);
              setInitialMealType(type);
              setActiveModal('meal');
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
          setInitialEventType(undefined);
          setEventToEdit(null);
          setClassToEdit(null);
          setBookToEdit(null);
          setHabitToEdit(null);
          setInitialMealDay(undefined);
          setInitialMealType(undefined);
          setInitialClassDay(undefined);
        }}
        initialDate={initialModalDate}
        initialEventType={initialEventType}
        eventToEdit={eventToEdit}
        classToEdit={classToEdit}
        bookToEdit={bookToEdit}
        habitToEdit={habitToEdit}
        initialMealDay={initialMealDay}
        initialMealType={initialMealType}
        initialClassDay={initialClassDay}
      />
    </div>
  );
};

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-200/90 via-pink-200/85 via-amber-100/90 to-yellow-100/90">
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-white/70 border-t-slate-900 animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-slate-600">Loading…</p>
    </div>
  </div>
);

const AuthGate: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
