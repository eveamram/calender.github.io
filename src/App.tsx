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
import { MealType, CalendarEvent } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab } = useStore();

  const [activeModal, setActiveModal] = useState<
    'event' | 'class' | 'task' | 'habit' | 'meal' | 'book' | null
  >(null);

  const [initialModalDate, setInitialModalDate] = useState<string | undefined>(undefined);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [initialMealDay, setInitialMealDay] = useState<number | undefined>(undefined);
  const [initialMealType, setInitialMealType] = useState<MealType | undefined>(undefined);

  const handleOpenAddForTab = () => {
    setEventToEdit(null);
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
      case 'grocery':
        setActiveModal('event');
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
      <main className="flex-1">
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
          <ClassesView onOpenAddClassModal={() => setActiveModal('class')} />
        )}
        {activeTab === 'todo' && (
          <TodoView onOpenAddModal={() => setActiveModal('task')} />
        )}
        {activeTab === 'habits' && (
          <HabitsView onOpenAddModal={() => setActiveModal('habit')} />
        )}
        {activeTab === 'grocery' && <GroceryView />}
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
          <BooksView onOpenAddBookModal={() => setActiveModal('book')} />
        )}
      </main>

      {/* Mobile Floating Add Button */}
      <FloatingAddButton onClick={handleOpenAddForTab} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Creation / Edit Modal Container */}
      <CreationModalContainer
        modalType={activeModal}
        onClose={() => {
          setActiveModal(null);
          setInitialModalDate(undefined);
          setEventToEdit(null);
          setInitialMealDay(undefined);
          setInitialMealType(undefined);
        }}
        initialDate={initialModalDate}
        eventToEdit={eventToEdit}
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
