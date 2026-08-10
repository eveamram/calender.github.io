import React from 'react';
import { WeeklyClassScheduleView } from '../schedule/WeeklyClassScheduleView';
import { CalendarEvent } from '../../types';

interface ScheduleViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = (props) => {
  return <WeeklyClassScheduleView {...props} />;
};
