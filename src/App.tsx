import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { FloatingAddButton } from './components/ui/FloatingAddButton';
import { CalendarView } from './components/calendar/CalendarView';
import { ClassesView } from './components/classes/ClassesView';
import { TodoView } from './components/todo/TodoView';
import { HabitsView } from './components/habits/HabitsView';
import { GroceryView } from './components/grocery/GroceryView';
import { MealsView } from './components/meals/MealsView';
import { BooksView } from './components/books/BooksView';
import { CreationModalContainer } from './components/modals/CreationModalContainer';
import { SettingsModal } from './components/modals/SettingsModal';
import { MealType, CalendarEvent, BookItem } from './types';

import { ConnectionErrorBanner } from './components/ui/ConnectionErrorBanner';
import { syncEngine } from './lib/syncEngine';

const MainAppContent: React.FC = () => {
  const { activeTab, syncStatus } = useStore();

  const [activeModal, setActiveModal] = useState<
    'event' | 'class' | 'task' | 'habit' | 'meal' | 'book' | null
  >(null);

  const [initialModalDate, setInitialModalDate] = useState<string | undefined>(undefined);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null);
  const [initialMealDay, setInitialMealDay] = useState<number | undefined>(undefined);
  const [initialMealType, setInitialMealType] = useState<MealType | undefined>(undefined);

  const handleOpenAddForTab = () => {
    setEventToEdit(null);
    setBookToEdit(null);
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
      {/* Show connection error overlay if Supabase is unconfigured */}
      {!syncStatus.isConfigured && (
        <ConnectionErrorBanner
          errorDetails={syncStatus.syncError || undefined}
          onRetry={() => syncEngine.fetchAll()}
        />
      )}

      {/* Header with Centered Top Add Button & Settings */}
      <Header onOpenAddModal={handleOpenAddForTab} />

      {/* Main Content Area */}
      <main className="flex-1 pb-40 lg:pb-8">
        {activeTab === 'calendar' && (
          <CalendarView
            onOpenAddModal={(date, evtToEdit) => {
              setInitialModalDate(date);
              setEventToEdit(evtToEdit || null);
              setActiveModal('event');
            }}
          />
        )}
        {activeTab === 'classes' && (
          <ClassesView
            onOpenAddClassModal={() => setActiveModal('class')}
            onOpenAddExamModal={() => setActiveModal('event')}
          />
        )}
        {activeTab === 'todo' && (
          <TodoView onOpenAddModal={() => setActiveModal('task')} />
        )}
        {activeTab === 'habits' && (
          <HabitsView onOpenAddModal={() => setActiveModal('habit')} />
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
          setEventToEdit(null);
          setBookToEdit(null);
          setInitialMealDay(undefined);
          setInitialMealType(undefined);
        }}
        initialDate={initialModalDate}
        eventToEdit={eventToEdit}
        bookToEdit={bookToEdit}
        initialMealDay={initialMealDay}
        initialMealType={initialMealType}
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

