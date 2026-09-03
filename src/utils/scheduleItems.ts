import { CalendarEvent, ClassItem, HabitCompletion, HabitItem, ProfilePersona } from '../types';
import { classPersonaColor, habitItemColor } from './personaColor';
import { ScheduleItem } from '../components/calendar/DayHourGrid';

export function weekdayNumFromDate(dateStr: string): number {
  const jsDay = new Date(dateStr + 'T00:00:00').getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekDatesFrom(dateStr: string): string[] {
  const d = new Date(dateStr + 'T00:00:00');
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(sunday);
    x.setDate(sunday.getDate() + i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildScheduleItemsForDate(opts: {
  dateStr: string;
  eventList: CalendarEvent[];
  classes: ClassItem[];
  habits: HabitItem[];
  habitCompletions: HabitCompletion[];
  activeProfile: ProfilePersona;
  profileColors: Record<ProfilePersona, string>;
}): ScheduleItem[] {
  const { dateStr, eventList, classes, habits, habitCompletions, activeProfile, profileColors } = opts;
  const dayOfWeekNum = weekdayNumFromDate(dateStr);

  const classEvents: ScheduleItem[] = classes
    .filter((cls) => {
      const activeDays = cls.days_of_week && cls.days_of_week.length > 0 ? cls.days_of_week : [1, 2, 3, 4, 5];
      return activeDays.includes(dayOfWeekNum);
    })
    .map((cls) => {
      const classColor = classPersonaColor(cls.profile, activeProfile, profileColors, cls.color);
      return {
        id: `class-item-${cls.id}`,
        title: `📚 ${cls.name}${cls.room ? ` (${cls.room})` : ''}`,
        event_type: 'class' as const,
        event_date: dateStr,
        start_time: cls.start_time,
        end_time: cls.end_time,
        location: cls.room || cls.instructor,
        color: classColor,
        profile: cls.profile || 'Both',
        is_completed: false,
        is_class_item: true,
        class_original_id: cls.id,
      };
    });

  const habitEvents: ScheduleItem[] = habits
    .filter((h) => Boolean(h.show_in_daily_schedule))
    .filter((h) => {
      const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];
      return activeDays.includes(dayOfWeekNum);
    })
    .map((h) => {
      const isDone = habitCompletions.some(
        (hc) => hc.habit_id === h.id && hc.date === dateStr && (hc.completed || (hc.current_quantity ?? 0) > 0)
      );
      const habitColor = habitItemColor(h.color, h.profile, profileColors);
      return {
        id: `habit-evt-${h.id}`,
        title: `${h.emoji || '✨'} ${h.title}`,
        event_type: 'personal' as const,
        event_date: dateStr,
        start_time: 'Habit',
        color: habitColor,
        profile: h.profile || 'Both',
        is_completed: isDone,
        is_habit_item: true,
        habit_original_id: h.id,
      };
    });

  return [...eventList, ...classEvents, ...habitEvents].sort((a, b) =>
    (a.start_time || '00:00').localeCompare(b.start_time || '00:00')
  );
}
