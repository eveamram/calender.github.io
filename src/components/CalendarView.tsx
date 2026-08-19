import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent } from '../types/event';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectDate: (start: string, end: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onUpdateEventTimes: (id: string, start: string, end: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectDate,
  onSelectEvent,
  onUpdateEventTimes,
}) => {
  const calendarRef = useRef<any>(null);

  // Convert application events into FullCalendar payload structure
  const fullCalendarEvents = events.map((evt) => ({
    id: evt.id,
    title: evt.title,
    start: evt.start,
    end: evt.end,
    backgroundColor: evt.color,
    borderColor: evt.color,
    textColor: '#ffffff',
    extendedProps: {
      description: evt.description,
      category: evt.category,
      createdBy: evt.createdBy,
    },
  }));

  const handleDateSelect = (selectInfo: any) => {
    onSelectDate(selectInfo.startStr, selectInfo.endStr);
  };

  const handleEventClick = (clickInfo: any) => {
    const matched = events.find((e) => e.id === clickInfo.event.id);
    if (matched) {
      onSelectEvent(matched);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const { id, startStr, endStr } = dropInfo.event;
    onUpdateEventTimes(id, startStr, endStr || startStr);
  };

  const handleEventResize = (resizeInfo: any) => {
    const { id, startStr, endStr } = resizeInfo.event;
    onUpdateEventTimes(id, startStr, endStr || startStr);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-6 overflow-hidden">
      <FullCalendar
        {...({
          ref: calendarRef,
          plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          },
          buttonText: {
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
          },
          events: fullCalendarEvents,
          selectable: true,
          selectMirror: true,
          editable: true,
          dayMaxEvents: true,
          weekends: true,
          height: 'auto',
          aspectRatio: 1.65,
          select: handleDateSelect,
          eventClick: handleEventClick,
          eventDrop: handleEventDrop,
          eventResize: handleEventResize,
          eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          },
        } as any)}
      />
    </div>
  );
};

