import React from 'react';
import { MinimalCalendar } from './MinimalCalendar';
import { CalendarEvent } from '../../types';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = (props) => {
  return <MinimalCalendar {...props} />;
};
